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

/**
 * Lee-B1: count AUDIT events for workflow@version (in-memory).
 * Equals blast radius of unpinning that pinned version.
 */
export function blastRadius(workflowId: string, version: string): number {
  return events.filter(
    (e) => e.workflowId === workflowId && e.workflowVersion === version
  ).length;
}

/** Same count from JSONL on disk (falls back to in-memory if unreadable). */
export function blastRadiusFromJsonl(
  workflowId: string,
  version: string,
  filePath: string | null = jsonlPath
): number {
  if (!filePath || !fs.existsSync(filePath)) {
    return blastRadius(workflowId, version);
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    let n = 0;
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      const e = JSON.parse(t) as AuditEvent;
      if (e.workflowId === workflowId && e.workflowVersion === version) n++;
    }
    return n;
  } catch {
    return blastRadius(workflowId, version);
  }
}

export function formatUnpinBlast(
  workflowId: string,
  version: string,
  affected: number = blastRadius(workflowId, version)
): string {
  return `unpin workflow version ${workflowId}@${version} → ${affected} executions affected (demo-derived)`;
}

export interface StepTiming {
  stepId: string;
  kind: string;
  ms: number;
}

export interface HotPathTiming {
  steps: StepTiming[];
  totalMs: number;
  /** Sum of compute + persist step durations only. */
  computePersistMs: number;
}

/** Lee-B3: footer lines for AUDIT SUMMARY — ms/step, labeled demo-derived. */
export function formatHotPathLatency(timing: HotPathTiming): string {
  const lines = [
    "HOT-PATH LATENCY (demo-derived — compute+persist ms/step, offline seed)",
    `  total=${timing.totalMs}ms compute+persist=${timing.computePersistMs}ms`,
  ];
  for (const s of timing.steps) {
    lines.push(`  ${s.kind}:${s.stepId} ${s.ms}ms/step`);
  }
  return lines.join("\n");
}

export function formatAuditSummary(
  summary: AuditSummary = auditSummary(),
  opts?: { hotPath?: HotPathTiming; unpin?: { workflowId: string; version: string } }
): string {
  const lines = [
    "AUDIT SUMMARY (demo-derived — offline seed, not field baseline)",
    `  total=${summary.total} approve_ok=${summary.approveOk} approve_fail=${summary.approveFail} persist_ok=${summary.persistOk} persist_fail=${summary.persistFail}`,
  ];
  for (const e of summary.events) {
    const step = e.stepId ? ` step=${e.stepId}` : "";
    const detail = e.detail ? ` — ${e.detail}` : "";
    lines.push(
      `  [${e.action}] ${e.workflowId}@${e.workflowVersion} (${e.domain})${step}${detail}`
    );
  }
  if (opts?.unpin) {
    const y = blastRadius(opts.unpin.workflowId, opts.unpin.version);
    lines.push(
      `  BLAST-RADIUS: ${formatUnpinBlast(opts.unpin.workflowId, opts.unpin.version, y)}`
    );
  }
  if (opts?.hotPath) {
    lines.push(formatHotPathLatency(opts.hotPath));
  }
  return lines.join("\n");
}
