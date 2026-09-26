import type { BillingMode } from "./types.js";

/**
 * Honesty banner — must say sandbox/stub clearly.
 * Vietnamese OK; never claim live payment.
 */
export function honestyBanner(mode: BillingMode): string {
  switch (mode) {
    case "stripe_test":
      return "⚠️ SANDBOX · Stripe TEST mode — không phải thanh toán thật / not live payment";
    case "vn_sandbox":
      return "⚠️ SANDBOX · Cổng VN giả lập (MoMo/VNPay pattern) — không trừ tiền thật / not live payment";
    case "offline_stub":
      return "⚠️ STUB · Offline stub / cost-center nội bộ — không gọi cổng thanh toán / offline stub only";
    default: {
      const _exhaustive: never = mode;
      return `⚠️ UNKNOWN billing mode: ${String(_exhaustive)} — treat as stub`;
    }
  }
}

/** Short EN label for badges. */
export function honestyBadge(mode: BillingMode): string {
  switch (mode) {
    case "stripe_test":
      return "stripe_test · sandbox";
    case "vn_sandbox":
      return "vn_sandbox · sandbox";
    case "offline_stub":
      return "offline_stub · stub";
  }
}
