/** Shared billing types — sandbox/stub only; never live payment. */

export type BillingMode = "stripe_test" | "vn_sandbox" | "offline_stub";

export type AppId = "bizmate" | "bookkeeper" | "shield" | "floodops";

export type PlanInterval = "month" | "year" | "seat" | "one_time";

export interface Plan {
  id: string;
  appId: AppId;
  name: string;
  nameVi: string;
  /** Display string only — fixture pricing, not live catalog. */
  priceDisplay: string;
  interval: PlanInterval;
  features: string[];
  /** True = documented roadmap, not D-Day sell. */
  roadmapOnly?: boolean;
  /** Short honesty note for this tier (VN OK). */
  honestyNote: string;
}

export interface CreateCheckoutInput {
  appId: AppId | string;
  planId: string;
  mode: BillingMode;
}

export interface CheckoutResult {
  ok: boolean;
  mode: BillingMode;
  /** Always present — UI must show this. */
  honestyBanner: string;
  planId: string;
  appId: string;
  /** Fake Stripe Checkout session id (stripe_test) or stub id. */
  sessionId: string;
  /** Fake hosted checkout URL (stripe_test / vn_sandbox) or null for offline. */
  url: string | null;
  stub: boolean;
  detail: string;
  /** Optional cost-center label for Sea internal path. */
  costCenter?: string;
}

export interface StubChargeInput {
  appId: AppId | string;
  planId: string;
  amountDisplay?: string;
  /** Sea internal cost-center code (fixture). */
  costCenter?: string;
}

export interface StubChargeResult {
  ok: boolean;
  mode: "offline_stub";
  honestyBanner: string;
  chargeId: string;
  appId: string;
  planId: string;
  costCenter: string;
  detail: string;
}
