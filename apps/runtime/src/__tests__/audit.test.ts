import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { Workflow } from "@bizmate/contracts";
import {
  appendAudit,
  auditSummary,
  clearAudit,
  formatAuditSummary,
  listAudit,
  setAuditJsonlPath,
  setAuditPersistToDisk,
} from "../audit.js";
import { executeWorkflow } from "../engine.js";

const accountingWorkflow: Workflow = {
  id: "wf-audit-accounting",
  version: "0.1.0",
  domain: "accounting",
  name: "Audit accounting",
  steps: [
    { id: "intake", kind: "intake", label: "Intake" },
    {
      id: "compute",
      kind: "compute",
      label: "Compute",
      ruleRefs: ["money.sumVnd"],
    },
    {
      id: "approve",
      kind: "approve",
      label: "Approve",
      requiresHuman: true,
    },
    { id: "persist", kind: "persist", label: "Persist" },
    { id: "emit", kind: "emit", label: "Emit" },
  ],
  invariants: [],
};

const event = {
  structured: {
    items: [{ qty: 1, unitPriceVnd: 15_000_000 }],
    ytdRevenueVnd: 990_000_000,
  },
};

describe("audit trail", () => {
  let tmpJsonl: string;

  beforeEach(() => {
    clearAudit();
    tmpJsonl = path.join(
      os.tmpdir(),
      `bizmate-audit-${Date.now()}-${Math.random().toString(36).slice(2)}.jsonl`
    );
    setAuditJsonlPath(tmpJsonl);
    setAuditPersistToDisk(true);
  });

  afterEach(() => {
    clearAudit({ unlinkJsonl: true });
    setAuditPersistToDisk(false);
    setAuditJsonlPath(null);
  });

  it("append-only list grows and pins workflow version", () => {
    appendAudit({
      action: "approve_ok",
      workflowId: "wf-x",
      workflowVersion: "0.1.0",
      domain: "accounting",
      stepId: "approve",
    });
    expect(listAudit()).toHaveLength(1);
    expect(listAudit()[0]!.workflowVersion).toBe("0.1.0");
    appendAudit({
      action: "persist_ok",
      workflowId: "wf-x",
      workflowVersion: "0.1.0",
      domain: "accounting",
      stepId: "persist",
    });
    expect(listAudit()).toHaveLength(2);
  });

  it("mirrors events to JSONL with workflow version pin", () => {
    appendAudit({
      action: "approve_fail",
      workflowId: "wf-jsonl",
      workflowVersion: "0.2.0",
      domain: "accounting",
      stepId: "approve",
      detail: "denied",
    });
    const lines = fs.readFileSync(tmpJsonl, "utf8").trim().split("\n");
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]!) as {
      action: string;
      workflowVersion: string;
    };
    expect(parsed.action).toBe("approve_fail");
    expect(parsed.workflowVersion).toBe("0.2.0");
  });

  it("records approve_fail when human gate denies", () => {
    const result = executeWorkflow(accountingWorkflow, event, {
      approved: false,
    });
    expect(result.ok).toBe(false);
    const summary = auditSummary();
    expect(summary.approveFail).toBe(1);
    expect(summary.persistOk).toBe(0);
    expect(summary.events[0]!.action).toBe("approve_fail");
    expect(summary.events[0]!.workflowId).toBe("wf-audit-accounting");
    expect(summary.events[0]!.workflowVersion).toBe("0.1.0");
  });

  it("records approve_ok + persist_ok when approved", () => {
    const result = executeWorkflow(accountingWorkflow, event, {
      approved: true,
      entryId: "ledger-audit",
    });
    expect(result.ok).toBe(true);
    const summary = auditSummary();
    expect(summary.approveOk).toBe(1);
    expect(summary.persistOk).toBe(1);
    expect(summary.approveFail).toBe(0);
    const formatted = formatAuditSummary(summary);
    expect(formatted).toContain("AUDIT SUMMARY");
    expect(formatted).toContain("approve_ok");
    expect(formatted).toContain("persist_ok");
    expect(formatted).toContain("wf-audit-accounting@0.1.0");
    expect(fs.existsSync(tmpJsonl)).toBe(true);
    const diskLines = fs.readFileSync(tmpJsonl, "utf8").trim().split("\n");
    expect(diskLines.length).toBeGreaterThanOrEqual(2);
  });
});
