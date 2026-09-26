import { honestyBanner } from "./honesty.js";
import { getPlan } from "./plans.js";
import type {
  CheckoutResult,
  CreateCheckoutInput,
  StubChargeInput,
  StubChargeResult,
} from "./types.js";

function fakeId(prefix: string): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${t}${r}`;
}

/**
 * Create a sandbox checkout session (Stripe-test shaped) or labeled stub.
 * Never talks to a real payment network.
 */
export function createCheckout(input: CreateCheckoutInput): CheckoutResult {
  const { appId, planId, mode } = input;
  const plan = getPlan(planId);
  const banner = honestyBanner(mode);
  const sessionId =
    mode === "stripe_test"
      ? fakeId("cs_test")
      : mode === "vn_sandbox"
        ? fakeId("vn_sb")
        : fakeId("stub_sess");

  if (!plan) {
    return {
      ok: false,
      mode,
      honestyBanner: banner,
      planId,
      appId: String(appId),
      sessionId,
      url: null,
      stub: true,
      detail: `Unknown planId=${planId} — stub refuse (fixture catalog only)`,
    };
  }

  if (mode === "offline_stub") {
    return {
      ok: true,
      mode,
      honestyBanner: banner,
      planId,
      appId: String(appId),
      sessionId,
      url: null,
      stub: true,
      costCenter: "SEA-INTERNAL-TOOLING",
      detail: `Offline stub checkout for ${plan.nameVi} — cost-center chargeback, no PSP call`,
    };
  }

  if (mode === "stripe_test") {
    const url = `https://checkout.stripe.com/c/pay/${sessionId}#fid_sandbox_fixture`;
    return {
      ok: true,
      mode,
      honestyBanner: banner,
      planId,
      appId: String(appId),
      sessionId,
      url,
      stub: false,
      detail: `Stripe TEST session shaped result for ${plan.name} · ${plan.priceDisplay}`,
    };
  }

  // vn_sandbox
  const url = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=${sessionId}`;
  return {
    ok: true,
    mode,
    honestyBanner: banner,
    planId,
    appId: String(appId),
    sessionId,
    url,
    stub: false,
    detail: `VN sandbox pattern for ${plan.nameVi} · ${plan.priceDisplay}`,
  };
}

/**
 * Offline stub charge — Sea cost-center / internal chargeback.
 * Always labeled stub; never live.
 */
export function stubCharge(input: StubChargeInput): StubChargeResult {
  const costCenter = input.costCenter ?? "SEA-INTERNAL-TOOLING";
  const plan = getPlan(input.planId);
  const amount = input.amountDisplay ?? plan?.priceDisplay ?? "0 ₫ (stub)";
  return {
    ok: true,
    mode: "offline_stub",
    honestyBanner: honestyBanner("offline_stub"),
    chargeId: fakeId("ch_stub"),
    appId: String(input.appId),
    planId: input.planId,
    costCenter,
    detail: `Stub charge ${amount} → cost-center ${costCenter}${
      plan ? ` (${plan.nameVi})` : ""
    } — offline only`,
  };
}
