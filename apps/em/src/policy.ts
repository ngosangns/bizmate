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

/**
 * Decide whether EM may auto-advance `task` into `toStatus`.
 *
 * Auto (AFK agents): non-HITL work moving through todo / in_progress / blocked / done.
 * HITL: human-owned tasks, hitl:true tasks, and any cancel.
 */
export function advancePolicy(
  task: EmTask,
  toStatus: EmTask["status"]
): AdvanceKind {
  if (task.hitl === true) return "hitl";
  if (task.owner === "human") return "hitl";
  if (hitlRequiredStatuses.includes(toStatus)) return "hitl";
  if (autoAdvanceStatuses.includes(toStatus)) return "auto";
  return "hitl";
}

export function canAutoAdvance(
  task: EmTask,
  toStatus: EmTask["status"]
): boolean {
  return advancePolicy(task, toStatus) === "auto";
}
