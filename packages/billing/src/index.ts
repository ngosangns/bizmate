/**
 * @bizmate/billing — shared sandbox / stub billing for BizMate apps.
 * NEVER claims live payment or live tax portal.
 *
 * Canonical API: types + plans + honesty + checkout modules.
 * Apps import from `@bizmate/billing` only — do not fork stub APIs per app.
 */

export type {
  AppId,
  BillingMode,
  CheckoutResult,
  CreateCheckoutInput,
  Plan,
  PlanInterval,
  StubChargeInput,
  StubChargeResult,
} from "./types.js";

export { allPlans, getPlan, listPlans } from "./plans.js";
export { honestyBadge, honestyBanner } from "./honesty.js";
export { createCheckout, stubCharge } from "./checkout.js";
