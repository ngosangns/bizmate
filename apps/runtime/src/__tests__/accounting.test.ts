import { describe, expect, it } from "vitest";
import { EXEMPTION_THRESHOLD_VND } from "@bizmate/core";
import type { Workflow } from "@bizmate/contracts";
import { executeWorkflow } from "../engine.js";
import { computeSale, processSale } from "../handlers/accounting.js";

const nearThreshold = EXEMPTION_THRESHOLD_VND - 10_000_000;

const accountingWorkflow: Workflow = {
  id: "wf-test-accounting",
  version: "0.1.0",
  domain: "accounting",
  name: "Test accounting",
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

describe("accounting threshold crossing", () => {
  it("sums line items deterministically", () => {
    const result = computeSale({
      items: [
        { qty: 3, unitPriceVnd: 2_000_000 },
        { qty: 1, unitPriceVnd: 15_000_000 },
      ],
      ytdRevenueVnd: nearThreshold,
    });
    expect(result.saleTotalVnd).toBe(21_000_000);
  });

  it("detects crossing the 1B VND exemption threshold", () => {
    const sale = 15_000_000;
    const result = computeSale({
      items: [{ qty: 1, unitPriceVnd: sale }],
      ytdRevenueVnd: nearThreshold,
    });
    expect(result.crossedExemption).toBe(true);
    expect(result.ytdBeforeVnd).toBe(nearThreshold);
    expect(result.ytdAfterVnd).toBe(nearThreshold + sale);
    expect(result.ytdAfterVnd).toBeGreaterThanOrEqual(EXEMPTION_THRESHOLD_VND);
    expect(result.remainingExemptionVnd).toBe(0);
  });

  it("does not flag when staying under threshold", () => {
    const result = computeSale({
      items: [{ qty: 1, unitPriceVnd: 1_000_000 }],
      ytdRevenueVnd: 100_000_000,
    });
    expect(result.crossedExemption).toBe(false);
    expect(result.remainingExemptionVnd).toBe(
      EXEMPTION_THRESHOLD_VND - 101_000_000
    );
  });

  it("requires approval flag before persist", () => {
    const input = {
      items: [{ qty: 1, unitPriceVnd: 15_000_000 }],
      ytdRevenueVnd: nearThreshold,
    };
    const denied = processSale(input, false, "ledger-denied");
    expect(denied.persisted).toBe(false);
    expect(denied.crossedExemption).toBe(true);

    const allowed = processSale(input, true, "ledger-ok");
    expect(allowed.persisted).toBe(true);
    expect(allowed.saleTotalVnd).toBe(15_000_000);
  });

  it("workflow persist fails without human approval", () => {
    const event = {
      structured: {
        items: [{ qty: 1, unitPriceVnd: 15_000_000 }],
        ytdRevenueVnd: nearThreshold,
      },
    };
    const result = executeWorkflow(accountingWorkflow, event, {
      approved: false,
    });
    expect(result.ok).toBe(false);
    const approveStep = result.steps.find((s) => s.stepId === "approve");
    expect(approveStep?.ok).toBe(false);
    expect(approveStep?.error).toMatch(/approval/i);
    expect(result.finalState.ledger).toBeUndefined();
  });

  it("workflow persists ledger when approved and crossed threshold", () => {
    const event = {
      structured: {
        items: [
          { qty: 3, unitPriceVnd: 2_000_000 },
          { qty: 1, unitPriceVnd: 15_000_000 },
        ],
        ytdRevenueVnd: 985_000_000,
      },
    };
    const result = executeWorkflow(accountingWorkflow, event, {
      approved: true,
      entryId: "ledger-test-cross",
    });
    expect(result.ok).toBe(true);
    const ledger = result.finalState.ledger as {
      saleTotalVnd: number;
      crossedExemption: boolean;
      persisted: boolean;
      ytdAfterVnd: number;
    };
    expect(ledger.persisted).toBe(true);
    expect(ledger.saleTotalVnd).toBe(21_000_000);
    expect(ledger.crossedExemption).toBe(true);
    expect(ledger.ytdAfterVnd).toBe(1_006_000_000);
  });
});
