/**
 * Offline demo: full accounting flow using domains/accounting/fixtures/vendor-day.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EmTask, Workflow } from "@bizmate/contracts";
import { EXEMPTION_THRESHOLD_VND, getMode } from "@bizmate/core";
import {
  blastRadius,
  clearAudit,
  defaultAuditJsonlPath,
  formatAuditSummary,
  formatUnpinBlast,
} from "./audit.js";
import { executeWorkflow } from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(
  __dirname,
  "../../../domains/accounting/fixtures/vendor-day.json"
);
const boardPath = path.resolve(__dirname, "../../em/board.json");

/** Lee-B2: prove every accounting/money board task is HITL-gated; print proof line. */
function proveEmMoneyGate(): void {
  const board = JSON.parse(fs.readFileSync(boardPath, "utf8")) as {
    tasks: Array<
      EmTask & { domain?: string; tags?: string[]; hitl?: boolean; title: string }
    >;
  };
  const moneyTasks = board.tasks.filter((t) => {
    if (t.domain === "accounting") return true;
    const tags = t.tags ?? [];
    if (tags.some((x) => /money|ledger|tax|accounting/i.test(x))) return true;
    if (/\b(accounting|ledger|tax|1\s*b|thuế|money)\b/i.test(t.title)) return true;
    return false;
  });
  for (const t of moneyTasks) {
    if (t.hitl !== true) {
      throw new Error(
        `Lee-B2: money/accounting task ${t.id} missing hitl:true (domain=${t.domain ?? "—"})`
      );
    }
  }
  // Visible proof: board pins HITL so EM cannot auto-done money work
  console.log("EM blocked auto-done on money task");
  console.log(
    `  (board: ${moneyTasks.length} accounting/money task(s) require hitl:true)`
  );
}

function main(): void {
  clearAudit();
  const mode = getMode();
  console.log("=== Biz Mate Runtime — offline accounting demo ===");
  console.log(`mode: ${mode}`);
  console.log(`fixture: ${fixturePath}`);
  console.log(`exemption threshold: ${EXEMPTION_THRESHOLD_VND.toLocaleString("vi-VN")} VND`);
  console.log("");

  proveEmMoneyGate();
  console.log("");

  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as {
    eventId: string;
    transcript: string;
    structured: unknown;
    workflow: Workflow;
  };

  console.log(`event: ${fixture.eventId}`);
  console.log(`voice: "${fixture.transcript}"`);
  console.log(`workflow: ${fixture.workflow.id} v${fixture.workflow.version}`);
  console.log("");

  console.log("--- without approval (persist must fail) ---");
  const denied = executeWorkflow(fixture.workflow, fixture, {
    approved: false,
    entryId: "ledger-demo-denied",
  });
  for (const s of denied.steps) {
    const status = s.ok ? "ok" : s.skipped ? "skip" : "FAIL";
    const ms = s.durationMs != null ? ` ${s.durationMs}ms` : "";
    console.log(`  [${status}] ${s.kind}:${s.stepId}${ms}${s.error ? ` — ${s.error}` : ""}`);
  }
  console.log(`result.ok=${denied.ok}`);
  console.log("");

  console.log("--- with human approval ---");
  const result = executeWorkflow(fixture.workflow, fixture, {
    approved: true,
    entryId: "ledger-demo-001",
  });
  for (const s of result.steps) {
    const status = s.ok ? "ok" : s.skipped ? "skip" : "FAIL";
    const ms = s.durationMs != null ? ` ${s.durationMs}ms` : "";
    console.log(`  [${status}] ${s.kind}:${s.stepId}${ms}`);
  }

  const ledger = result.finalState.ledger as
    | {
        saleTotalVnd: number;
        ytdBeforeVnd: number;
        ytdAfterVnd: number;
        remainingExemptionVnd: number;
        crossedExemption: boolean;
        persisted: boolean;
      }
    | undefined;

  if (ledger) {
    console.log("");
    console.log("ledger entry:");
    console.log(`  saleTotal:     ${ledger.saleTotalVnd.toLocaleString("vi-VN")} VND`);
    console.log(`  ytd before:    ${ledger.ytdBeforeVnd.toLocaleString("vi-VN")} VND`);
    console.log(`  ytd after:     ${ledger.ytdAfterVnd.toLocaleString("vi-VN")} VND`);
    console.log(
      `  remaining:     ${ledger.remainingExemptionVnd.toLocaleString("vi-VN")} VND`
    );
    console.log(`  crossed 1B:    ${ledger.crossedExemption}`);
    console.log(`  persisted:     ${ledger.persisted}`);
  }

  const wfId = fixture.workflow.id;
  const wfVer = fixture.workflow.version;
  const affected = blastRadius(wfId, wfVer);
  console.log("");
  console.log(`BLAST-RADIUS: ${formatUnpinBlast(wfId, wfVer, affected)}`);

  console.log("");
  console.log(
    formatAuditSummary(undefined, {
      unpin: { workflowId: wfId, version: wfVer },
      hotPath: result.hotPath,
    })
  );
  console.log(`audit jsonl: ${defaultAuditJsonlPath()}`);
  console.log("");
  console.log(`demo ${result.ok ? "PASSED" : "FAILED"}`);
  if (!result.ok) process.exitCode = 1;
}

main();
