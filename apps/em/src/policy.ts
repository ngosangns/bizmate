import type { EmTask } from "./types.js";

/** Status transitions EM may auto-advance without a human in the loop. */
export const autoAdvanceStatuses: ReadonlyArray<EmTask["status"]> = [
  "todo",
  "in_progress",
  "blocked",
  "done",
];

/**
 * Statuses / outcomes that always require HITL confirmation
 * (human approve, cancel, or any hitl-flagged task reaching done).
 */
export const hitlRequiredStatuses: ReadonlyArray<EmTask["status"]> = [
  "cancelled",
];

export type AdvanceKind = "auto" | "hitl";

const MONEY_RE =
  /\b(money|ledger|tax|thu[eế]|s[oổ]|exemption|vnd|1\s*b|accounting|thuế)\b/i;

/**
 * True when task touches accounting / money / ledger / tax
 * (domain field, tags, or title keywords).
 */
export function touchesMoney(task: EmTask): boolean {
  const domain = (task as EmTask & { domain?: string }).domain;
  if (domain === "accounting") return true;
  const tags = (task as EmTask & { tags?: string[] }).tags ?? [];
  if (tags.some((t) => MONEY_RE.test(t) || t.toLowerCase() === "accounting")) {
    return true;
  }
  if (MONEY_RE.test(task.title)) return true;
  if (task.pillar === "runtime" && /threshold|ledger|1B/i.test(task.title)) {
    return true;
  }
  return false;
}

/**
 * Decide whether EM may auto-advance `task` into `toStatus`.
 *
 * Auto (AFK agents): non-HITL work moving through todo / in_progress / blocked / done.
 * HITL: human-owned tasks, hitl:true tasks, any cancel, and money/accounting → done.
 */
export function advancePolicy(
  task: EmTask,
  toStatus: EmTask["status"]
): AdvanceKind {
  if (task.hitl === true) return "hitl";
  if (task.owner === "human") return "hitl";
  if (hitlRequiredStatuses.includes(toStatus)) return "hitl";
  // Lee: never auto-done money-touching / accounting tasks
  if (toStatus === "done" && touchesMoney(task)) return "hitl";
  if (autoAdvanceStatuses.includes(toStatus)) return "auto";
  return "hitl";
}

export function canAutoAdvance(
  task: EmTask,
  toStatus: EmTask["status"]
): boolean {
  return advancePolicy(task, toStatus) === "auto";
}
