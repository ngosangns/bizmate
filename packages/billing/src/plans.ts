import type { AppId, Plan } from "./types.js";

/**
 * Demo pricing fixtures per app.
 * Amounts are illustrative sketches — not live catalog / not ARR claims.
 */
const PLANS: Plan[] = [
  // —— BizMate (Sea internal D-Day; SME = roadmap) ——
  {
    id: "bizmate-sea-seat",
    appId: "bizmate",
    name: "Sea seat · pilot",
    nameVi: "Ghế Sea · pilot",
    priceDisplay: "0 ₫ / seat (cost-center nội bộ)",
    interval: "seat",
    features: [
      "HITL registry + money gate",
      "AUDIT JSONL blast-radius",
      "10 Sea pilot seats (week-2 sketch)",
    ],
    honestyNote: "Sea internal tooling — chargeback cost-center, không card checkout",
  },
  {
    id: "bizmate-codex-partnership",
    appId: "bizmate",
    name: "Codex partnership",
    nameVi: "Đối tác Codex",
    priceDisplay: "partnership sketch (fixture)",
    interval: "seat",
    features: [
      "Mate = creation-time only",
      "Runtime deterministic · zero-LLM money",
      "EM + human registry owner",
    ],
    honestyNote: "Partnership sketch — không phải SKU live / not live SKU",
  },
  {
    id: "bizmate-sme-pro",
    appId: "bizmate",
    name: "SME Pro",
    nameVi: "SME Pro (lộ trình)",
    priceDisplay: "199.000 ₫ / tháng (fixture)",
    interval: "month",
    features: [
      "Bà Lan sổ 1 tỷ · ND-141",
      "Voice → ledger HITL",
      "After week-2 Sea pilot",
    ],
    roadmapOnly: true,
    honestyNote: "Roadmap only — không bán D-Day / not D-Day sell",
  },

  // —— Bookkeeper ——
  {
    id: "bookkeeper-free",
    appId: "bookkeeper",
    name: "Free",
    nameVi: "Miễn phí — nhật ký bán",
    priceDisplay: "0 ₫ / tháng (fixture)",
    interval: "month",
    features: ["Nhật ký bán (voice/sổ stub)", "YTD + cảnh báo ngưỡng 1B", "Citations demo"],
    honestyNote: "Fixture Free tier — không billing live",
  },
  {
    id: "bookkeeper-pro",
    appId: "bookkeeper",
    name: "Pro kê khai",
    nameVi: "Pro kê khai",
    priceDisplay: "99.000 ₫ / tháng (fixture · hypothesis)",
    interval: "month",
    features: [
      "Tất cả Free",
      "Hỗ trợ kê khai / e-invoice assist (fixture)",
      "Soft unlock khi vượt 1B",
    ],
    honestyNote: "Fixture Pro — sandbox/stub checkout only · chưa đo ARPU",
  },

  // —— Shield (family B2C; Sea = distribution only) ——
  {
    id: "shield-free",
    appId: "shield",
    name: "Free",
    nameVi: "Miễn phí",
    priceDisplay: "0 ₫ / tháng (fixture)",
    interval: "month",
    features: ["1 elder (ba/mẹ)", "Rule-based inbox scan", "Family alert on block"],
    honestyNote: "B2C family Free fixture — Sea = distribution wedge, not payer",
  },
  {
    id: "shield-family-care",
    appId: "shield",
    name: "Family Care",
    nameVi: "Chăm sóc gia đình",
    priceDisplay: "99.000 ₫ / tháng (fixture)",
    interval: "month",
    features: ["2 elders", "SMS alert to child payer", "Backup 30s demo path"],
    honestyNote: "B2C family Care fixture — sandbox checkout only; Sea ≠ payer",
  },
  {
    id: "shield-family-plus",
    appId: "shield",
    name: "Family Plus",
    nameVi: "Gia đình Plus",
    priceDisplay: "199.000 ₫ / tháng (fixture)",
    interval: "month",
    features: ["4 elders", "SMS alert + priority review queue", "Human override path"],
    honestyNote: "B2C family Plus fixture — sandbox checkout only; Sea ≠ payer",
  },

  // —— FloodOps ——
  {
    id: "floodops-site",
    appId: "floodops",
    name: "Per-site ops",
    nameVi: "Theo điểm / site",
    priceDisplay: "1.500.000 ₫ / site / tháng (fixture · internal)",
    interval: "seat",
    features: ["Per-site flood-day replan", "Internal budget path", "Audit JSONL"],
    honestyNote: "Ops org internal budget stub — không claim live SPX pay",
  },
  {
    id: "floodops-wave",
    appId: "floodops",
    name: "Per-wave ops seat",
    nameVi: "Theo sóng / wave",
    priceDisplay: "500.000 ₫ / wave (fixture · internal)",
    interval: "seat",
    features: ["Single-wave ops seat", "COD at-risk dashboard (fixture)", "Human refund gate"],
    honestyNote: "Per-wave ops seat fixture — Sea internal chargeback, không claim live SPX pay",
  },
];

export function listPlans(appId: AppId | string): Plan[] {
  return PLANS.filter((p) => p.appId === appId);
}

export function getPlan(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}

export function allPlans(): readonly Plan[] {
  return PLANS;
}
