/**
 * Shared mutable UI state for BizMate web (R6 split).
 */
import type { BillingMode, CheckoutResult, StubChargeResult } from "@bizmate/billing";
import type { Domain } from "./samples.js";
import type { RunResult } from "./runner.js";

export type Progress =
  | "idle"
  | "generating"
  | "judging"
  | "ready"
  | "running"
  | "done";

export interface AuditEntry {
  action: string;
  at: string;
  detail: string;
  workflowId?: string;
  workflowVersion?: string;
}

export interface StepMs {
  stepId: string;
  kind: string;
  ms: number;
}

export type BillingSnapshot =
  | { kind: "checkout"; result: CheckoutResult }
  | { kind: "stub"; result: StubChargeResult };

export type RunFeedback =
  | { kind: "ok"; text: string }
  | { kind: "blocked"; text: string };

/** Mutable bag — modules read/write the same object. */
export const state = {
  domain: "accounting" as Domain,
  approved: false,
  lastResult: null as RunResult | null,
  progress: "ready" as Progress,
  seed: 1,
  webAudit: [] as AuditEntry[],
  lastRunMs: null as number | null,
  lastStepMs: [] as StepMs[],
  /** Kyle-B2: animate chips only after explicit Tạo lại click. */
  animateChips: false,
  lastBilling: null as BillingSnapshot | null,
  billingMode: "stripe_test" as BillingMode,
  /** R5 Lee: banner after Chạy — success persist / blocked without Duyệt. */
  lastRunFeedback: null as RunFeedback | null,
  /** R5 Lee: flash metrics strip once after run. */
  flashMetrics: false,
};

export function resetSessionFields(): void {
  state.approved = false;
  state.lastResult = null;
  state.webAudit.length = 0;
  state.lastRunMs = null;
  state.lastStepMs = [];
  state.animateChips = false;
  state.lastRunFeedback = null;
  state.flashMetrics = false;
  state.progress = "ready";
}
