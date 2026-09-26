/**
 * Offline demo: full accounting flow using domains/accounting/fixtures/vendor-day.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Workflow } from "@bizmate/contracts";
import { EXEMPTION_THRESHOLD_VND, getMode } from "@bizmate/core";
import { clearAudit, defaultAuditJsonlPath, formatAuditSummary } from "./audit.js";
import { executeWorkflow } from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(
  __dirname,
  "../../../domains/accounting/fixtures/vendor-day.json"
);

function main(): void {
  clearAudit();
  const mode = getMode();
  console.log("=== Biz Mate Runtime — offline accounting demo ===");
  console.log(`mode: ${mode}`);
  console.log(`fixture: ${fixturePath}`);
  console.log(`exemption threshold: ${EXEMPTION_THRESHOLD_VND.toLocaleString("vi-VN")} VND`);
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
    console.log(`  [${status}] ${s.kind}:${s.stepId}${s.error ? ` — ${s.error}` : ""}`);
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
    console.log(`  [${status}] ${s.kind}:${s.stepId}`);
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

  console.log("");
  console.log(formatAuditSummary());
  console.log(`audit jsonl: ${defaultAuditJsonlPath()}`);
  console.log("");
  console.log(`demo ${result.ok ? "PASSED" : "FAILED"}`);
  if (!result.ok) process.exitCode = 1;
}

main();
