/**
 * Lightweight append-only audit trail for approve / persist gates.
 * In-memory + JSONL mirror under apps/runtime/.audit/ (Lee Round-1).
 * Pins workflow id + version on every event.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AuditAction =
  | "approve_ok"
  | "approve_fail"
  | "persist_ok"
  | "persist_fail";

export interface AuditEvent {
  at: string;
  action: AuditAction;
  workflowId: string;
  workflowVersion: string;
  domain: string;
  stepId?: string;
  detail?: string;
}

const events: AuditEvent[] = [];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Default JSONL path: apps/runtime/.audit/events.jsonl */
export function defaultAuditJsonlPath(): string {
  return path.join(__dirname, "..", ".audit", "events.jsonl");
}

let jsonlPath: string | null = defaultAuditJsonlPath();
let persistToDisk = true;

export function setAuditJsonlPath(p: string | null): void {
  jsonlPath = p;
}

export function setAuditPersistToDisk(enabled: boolean): void {
  persistToDisk = enabled;
}

function appendJsonl(event: AuditEvent): void {
  if (!persistToDisk || !jsonlPath) return;
  try {
    fs.mkdirSync(path.dirname(jsonlPath), { recursive: true });
    fs.appendFileSync(jsonlPath, JSON.stringify(event) + "\n", "utf8");
  } catch {
    // Demo/tests must not crash if disk write fails (e.g. read-only).
  }
}

export function appendAudit(
  partial: Omit<AuditEvent, "at"> & { at?: string }
): AuditEvent {
  const event: AuditEvent = {
    at: partial.at ?? new Date().toISOString(),
    action: partial.action,
    workflowId: partial.workflowId,
    workflowVersion: partial.workflowVersion,
    domain: partial.domain,
    stepId: partial.stepId,
    detail: partial.detail,
  };
  events.push(event);
  appendJsonl(event);
  return event;
}

export function listAudit(): readonly AuditEvent[] {
  return events;
}

export function clearAudit(opts?: { unlinkJsonl?: boolean }): void {
  events.length = 0;
  if (opts?.unlinkJsonl && jsonlPath && fs.existsSync(jsonlPath)) {
    try {
      fs.unlinkSync(jsonlPath);
    } catch {
      /* ignore */
    }
  }
}

export interface AuditSummary {
  total: number;
  approveOk: number;
  approveFail: number;
  persistOk: number;
  persistFail: number;
  events: readonly AuditEvent[];
}

export function auditSummary(): AuditSummary {
  let approveOk = 0;
  let approveFail = 0;
  let persistOk = 0;
  let persistFail = 0;
  for (const e of events) {
    if (e.action === "approve_ok") approveOk++;
    else if (e.action === "approve_fail") approveFail++;
    else if (e.action === "persist_ok") persistOk++;
    else if (e.action === "persist_fail") persistFail++;
  }
  return {
    total: events.length,
    approveOk,
    approveFail,
    persistOk,
    persistFail,
    events: [...events],
  };
}

export function formatAuditSummary(summary: AuditSummary = auditSummary()): string {
  const lines = [
    "AUDIT SUMMARY",
    `  total=${summary.total} approve_ok=${summary.approveOk} approve_fail=${summary.approveFail} persist_ok=${summary.persistOk} persist_fail=${summary.persistFail}`,
  ];
  for (const e of summary.events) {
    const step = e.stepId ? ` step=${e.stepId}` : "";
    const detail = e.detail ? ` — ${e.detail}` : "";
    lines.push(
      `  [${e.action}] ${e.workflowId}@${e.workflowVersion} (${e.domain})${step}${detail}`
    );
  }
  return lines.join("\n");
}
