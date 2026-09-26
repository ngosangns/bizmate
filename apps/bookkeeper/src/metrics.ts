/**
 * Week-2 seed metrics — counts from one demo/fixture run only.
 * Hypothesis / demo-seed labels; NOT production KPIs.
 */
import { remainingExemption, type Vnd } from "@bizmate/core";

export interface Week2SeedMetrics {
  /** Số lần Duyệt (human approve) on this seed run */
  approveCount: number;
  /** Số lần Từ chối-before-Duyệt (HITL refuse shown before approve) */
  refuseBeforeDuyetCount: number;
  /** Số lần cảnh báo gần/vượt ngưỡng 1B (crossedThreshold) */
  thresholdWarningCount: number;
  /** Citation id occurrences shown this run (proposals + tax Q&A) */
  citationHits: number;
  finalYtdVnd: Vnd;
  /** YTD gap to 1B exemption threshold (0 if already over) */
  remainingExemptionVnd: Vnd;
}

export function buildWeek2SeedMetrics(input: {
  approveCount: number;
  refuseBeforeDuyetCount: number;
  thresholdWarningCount: number;
  citationHits: number;
  finalYtdVnd: number;
}): Week2SeedMetrics {
  return {
    approveCount: input.approveCount,
    refuseBeforeDuyetCount: input.refuseBeforeDuyetCount,
    thresholdWarningCount: input.thresholdWarningCount,
    citationHits: input.citationHits,
    finalYtdVnd: input.finalYtdVnd,
    remainingExemptionVnd: remainingExemption(input.finalYtdVnd),
  };
}

function vnd(n: number): string {
  return `${n.toLocaleString("vi-VN")}₫`;
}

/** CLI lines for demo end — clearly labeled hypothesis on this seed. */
export function formatWeek2SeedMetricsBlock(m: Week2SeedMetrics): string[] {
  return [
    "── WEEK-2 METRICS (hypothesis on this seed) ──",
    "⚠️  Đây là số đếm trên demo seed — KHÔNG phải KPI production / live.",
    `  số lần Duyệt (approves):              ${m.approveCount}`,
    `  số lần Từ chối-before-Duyệt:          ${m.refuseBeforeDuyetCount}`,
    `  số lần cảnh báo gần/vượt 1B:          ${m.thresholdWarningCount}`,
    `  citation hits (ids shown this run):   ${m.citationHits}`,
    `  YTD final:                            ${vnd(m.finalYtdVnd)}`,
    `  YTD gap to 1B (remainingExemption):   ${vnd(m.remainingExemptionVnd)}`,
  ];
}

/**
 * Soft paywall VN copy when crossedThreshold — fixture upsell, no live billing.
 */
export const PRO_KE_KHAI_PAYWALL_VN =
  "💎 Pro kê khai (fixture): Vượt 1 tỷ — mở gói Pro để xuất HĐ + kê khai có căn cứ. Không thu phí trong demo · không billing live.";

export function formatSoftPaywallLine(): string {
  return PRO_KE_KHAI_PAYWALL_VN;
}
