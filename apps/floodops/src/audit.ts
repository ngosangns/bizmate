/**
 * Append-only JSONL audit for FloodOps waves + human decisions (Lee Round-1).
 * Refund never auto-applies — only approveRefund flips propose_refund → approved.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ActionKind, ProposedAction } from "./engine.js";

export type AuditRecordType = "wave_action" | "human_decision";

export interface AuditRecord {
  ts: string;
  type: AuditRecordType;
  waveId?: string;
  orderId: string;
  kind: ActionKind;
  status: ProposedAction["status"];
  requiresHuman?: boolean;
  reason?: string;
  actor?: string;
  decision?: "approved";
  before?: { status: ProposedAction["status"] };
  after?: { status: ProposedAction["status"] };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function defaultAuditJsonlPath(): string {
  return path.join(__dirname, "..", ".audit", "wave.jsonl");
}

export function resetAuditFile(auditPath: string = defaultAuditJsonlPath()): void {
  try {
    if (fs.existsSync(auditPath)) fs.unlinkSync(auditPath);
    const dir = path.dirname(auditPath);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
    }
  } catch {
    /* demo must not crash */
  }
}

function appendJsonl(record: AuditRecord, auditPath: string): void {
  try {
    fs.mkdirSync(path.dirname(auditPath), { recursive: true });
    fs.appendFileSync(auditPath, JSON.stringify(record) + "\n", "utf8");
  } catch {
    /* ignore disk errors in demo/tests */
  }
}

export function persistWaveActions(
  actions: ProposedAction[],
  opts?: { waveId?: string; ts?: string; auditPath?: string }
): AuditRecord[] {
  const ts = opts?.ts ?? new Date().toISOString();
  const auditPath = opts?.auditPath ?? defaultAuditJsonlPath();
  const waveId = opts?.waveId ?? "hcm-flood-day";
  const records: AuditRecord[] = actions.map((a) => ({
    ts,
    type: "wave_action" as const,
    waveId,
    orderId: a.orderId,
    kind: a.kind,
    status: a.status,
    requiresHuman: a.requiresHuman,
    reason: a.reason,
  }));
  for (const r of records) appendJsonl(r, auditPath);
  return records;
}

/**
 * Human approve: only flips propose_refund from awaiting_human → approved.
 * Never auto-applies refund. Mutates the action in-place and appends audit.
 */
export function approveRefund(
  actions: ProposedAction[],
  orderId: string,
  actor: string,
  opts?: { ts?: string; auditPath?: string }
): ProposedAction {
  const action = actions.find((a) => a.orderId === orderId);
  if (!action) {
    throw new Error(`approveRefund: order ${orderId} not found`);
  }
  if (action.kind !== "propose_refund") {
    throw new Error(
      `approveRefund: ${orderId} kind=${action.kind} (chỉ duyệt propose_refund)`
    );
  }
  if (action.status !== "awaiting_human") {
    throw new Error(
      `approveRefund: ${orderId} status=${action.status} (cần awaiting_human)`
    );
  }
  const before = { status: action.status };
  action.status = "approved";
  const ts = opts?.ts ?? new Date().toISOString();
  const auditPath = opts?.auditPath ?? defaultAuditJsonlPath();
  appendJsonl(
    {
      ts,
      type: "human_decision",
      orderId,
      kind: action.kind,
      status: action.status,
      requiresHuman: true,
      actor,
      decision: "approved",
      before,
      after: { status: "approved" },
      reason: action.reason,
    },
    auditPath
  );
  return action;
}

export function readAuditJsonl(
  auditPath: string = defaultAuditJsonlPath()
): AuditRecord[] {
  if (!fs.existsSync(auditPath)) return [];
  return fs
    .readFileSync(auditPath, "utf8")
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as AuditRecord);
}
