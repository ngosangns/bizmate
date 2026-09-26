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
  /** approved = Duyệt; omit on Từ chối (status → proposed, schema-safe). */
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

/** Lee-F2: latest human_decision for an order from JSONL (replay after ~7 days). */
export function findLatestHumanDecision(
  records: AuditRecord[],
  orderId: string
): AuditRecord | undefined {
  const hits = records.filter(
    (r) =>
      r.type === "human_decision" &&
      r.orderId === orderId &&
      r.decision === "approved"
  );
  return hits.length ? hits[hits.length - 1] : undefined;
}

/**
 * Re-apply a prior JSONL approval onto in-memory actions — no new audit append.
 * Returns the mutated action, or undefined if not applicable.
 */
export function applyReplayApproval(
  actions: ProposedAction[],
  decision: AuditRecord
): ProposedAction | undefined {
  const action = actions.find((a) => a.orderId === decision.orderId);
  if (!action || action.kind !== "propose_refund") return undefined;
  action.status = "approved";
  return action;
}

/**
 * Ops apply: flip non-refund awaiting_human → approved (hold/reschedule/reroute).
 * Refund must use approveRefund.
 */
export function applyOpsAction(
  actions: ProposedAction[],
  orderId: string,
  actor: string,
  opts?: { ts?: string; auditPath?: string }
): ProposedAction {
  const action = actions.find((a) => a.orderId === orderId);
  if (!action) {
    throw new Error(`applyOpsAction: order ${orderId} not found`);
  }
  if (action.kind === "propose_refund") {
    throw new Error(
      `applyOpsAction: ${orderId} is propose_refund — dùng approveRefund / Duyệt hoàn`
    );
  }
  if (action.status !== "awaiting_human") {
    throw new Error(
      `applyOpsAction: ${orderId} status=${action.status} (cần awaiting_human)`
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

/**
 * Ops Từ chối: awaiting_human → proposed (schema-safe; no "rejected" enum yet).
 * Appends human_decision audit without decision:"approved".
 */
export function rejectHumanAction(
  actions: ProposedAction[],
  orderId: string,
  actor: string,
  opts?: { ts?: string; auditPath?: string; note?: string }
): ProposedAction {
  const action = actions.find((a) => a.orderId === orderId);
  if (!action) {
    throw new Error(`rejectHumanAction: order ${orderId} not found`);
  }
  if (action.status !== "awaiting_human") {
    throw new Error(
      `rejectHumanAction: ${orderId} status=${action.status} (cần awaiting_human)`
    );
  }
  const before = { status: action.status };
  const note = opts?.note?.trim() || "ops từ chối";
  action.status = "proposed";
  if (!action.reason.includes("ops từ chối")) {
    action.reason = `${action.reason} · ${note}`;
  }
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
      before,
      after: { status: "proposed" },
      reason: action.reason,
    },
    auditPath
  );
  return action;
}

/**
 * Unified HITL entry for UI / API: approve refund, apply ops, or reject.
 */
export function resolveHumanAction(
  actions: ProposedAction[],
  orderId: string,
  actor: string,
  verdict: "approve" | "reject",
  opts?: { ts?: string; auditPath?: string; note?: string }
): ProposedAction {
  const action = actions.find((a) => a.orderId === orderId);
  if (!action) {
    throw new Error(`resolveHumanAction: order ${orderId} not found`);
  }
  if (verdict === "reject") {
    return rejectHumanAction(actions, orderId, actor, opts);
  }
  if (action.kind === "propose_refund") {
    return approveRefund(actions, orderId, actor, opts);
  }
  return applyOpsAction(actions, orderId, actor, opts);
}
