/**
 * In-memory HITL audit trail for Bookkeeper demo.
 * At least one Từ chối-before-Duyệt leaves approve_rejected (or equivalent).
 * No live tax API — offline seed only.
 */

export type AuditEventType =
  | "approve_rejected"
  | "approve_committed"
  | "idempotency_conflict"
  | "threshold_warned"
  | "soft_paywall_shown";

export interface AuditEvent {
  ts: string;
  type: AuditEventType;
  utteranceId?: string;
  detail: string;
  ytdVnd?: number;
}

export function createAuditLog(): AuditEvent[] {
  return [];
}

export function appendAudit(
  log: AuditEvent[],
  event: Omit<AuditEvent, "ts"> & { ts?: string }
): AuditEvent[] {
  const row: AuditEvent = {
    ts: event.ts ?? new Date().toISOString(),
    type: event.type,
    utteranceId: event.utteranceId,
    detail: event.detail,
    ytdVnd: event.ytdVnd,
  };
  log.push(row);
  return log;
}

/** Format audit for CLI end — short lines, not JSON dump wall. */
export function formatAuditBlock(log: AuditEvent[]): string[] {
  const lines = [
    "── AUDIT (in-memory seed) ──",
    `  ${log.length} event(s) · includes approve_rejected on Từ chối-before-Duyệt`,
  ];
  for (const e of log) {
    const id = e.utteranceId ? ` · ${e.utteranceId}` : "";
    lines.push(`  [${e.type}]${id}: ${e.detail}`);
  }
  return lines;
}
