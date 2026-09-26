import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyReplayApproval,
  approveRefund,
  defaultAuditJsonlPath,
  findLatestHumanDecision,
  persistWaveActions,
  readAuditJsonl,
  resetAuditFile,
} from "./audit.js";
import {
  buildAuditLog,
  codAtRiskVnd,
  estimateRoundTripFeeVnd,
  runWave,
  summarizeEvents,
  type ActionKind,
  type FloodEvent,
  type Order,
  type ProposedAction,
} from "./engine.js";
import {
  createCheckout,
  honestyBanner,
  listPlans,
  stubCharge,
} from "@bizmate/billing";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reset = process.argv.includes("--reset");
const replay = process.argv.includes("--replay");
const auditPath = defaultAuditJsonlPath();

if (reset && replay) {
  console.log(
    "⚠️  --reset và --replay cùng lúc: reset xóa JSONL nên replay sẽ không có quyết định cũ.\n"
  );
}

if (reset) {
  resetAuditFile(auditPath);
  console.log("↺ --reset: đã xóa audit JSONL — demo replay từ đầu\n");
}

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../fixtures/hcm-flood-day.json"), "utf8")
) as {
  city: string;
  wards: Parameters<typeof runWave>[1];
  orders: Order[];
  policy: Parameters<typeof runWave>[2];
  events: FloodEvent[];
};

const events = summarizeEvents(data.events);
const actions = runWave(data.orders, data.wards, data.policy, data.events);

if (!replay) {
  persistWaveActions(actions, { waveId: "hcm-flood-day", auditPath });
}

const atRisk = codAtRiskVnd(data.orders, data.wards);
const auto = actions.filter((a) => !a.requiresHuman);
const human = actions.filter((a) => a.requiresHuman);

function shopStatusVi(a: ProposedAction): string {
  const kind: ActionKind = a.kind;
  if (kind === "propose_refund") {
    return a.status === "approved" ? "Đã duyệt hoàn" : "Chờ hoàn";
  }
  if (kind === "reschedule") return "Đã dời giao";
  if (kind === "reroute_clear_ward") return "Đã chuyển tuyến";
  if (kind === "hold") return "Đã giữ";
  return "Bình thường";
}

console.log(`\n🌧️  FloodOps — ${data.city} flood-day replan (offline fixture)`);
console.log("────────────────────────────────────────────────────────");
console.log(
  `💰 COD at-risk (ước tính fixture): ${atRisk.toLocaleString("vi-VN")}₫ — nếu không replan`
);
console.log(
  "   (deterministic Σ COD đơn trên ward ngập — không phải KPI live SPX)"
);
console.log(
  "Champion: night-shift ops lead → escalate hoàn → supervisor Duyệt hoàn (audit JSONL replay)"
);
console.log(
  "Buyer nội bộ (persona): last-mile ops lead / control tower SPX-style"
);
console.log(
  "Honesty: Real = offline fixture + pure TS replanOrder (zero LLM hot path)."
);
console.log(
  "         Stub = no live SPX · no SMS gateway · policy-v2 candidate not loaded."
);
console.log(
  "Schema: packages/contracts/schemas/flood-decision.v0.1.schema.json · refund never auto_applied"
);
console.log("Wave: ① alerts → ② actions → ②b Duyệt/replay → ②c Shop → ③ audit\n");

console.log("① Cảnh báo / alerts");
for (const a of events.floodAlerts) {
  console.log(`   ⚠️  ${a.wardId} · ${a.floodCm}cm`);
}
if (events.courierCancelWardIds.length) {
  console.log(
    `   🚫 courier_cancel: ${events.courierCancelWardIds.join(", ")}`
  );
}
if (events.motorcycleAlleyWardIds.length) {
  console.log(
    `   🛵 local_knowledge (ngách xe máy): ${events.motorcycleAlleyWardIds.join(", ")}`
  );
}
console.log("");

console.log("② Hành động / actions (AUTO vs HUMAN)");
const orderCod = new Map(data.orders.map((o) => [o.id, o.codVnd]));
const ordered = [
  ...actions.filter((a) => a.requiresHuman),
  ...actions.filter((a) => !a.requiresHuman),
];
for (const a of ordered) {
  const tag = a.requiresHuman ? "👤 HUMAN" : "🤖 AUTO ";
  const cod = orderCod.get(a.orderId);
  const codBit =
    a.requiresHuman && cod != null
      ? ` · COD ${cod.toLocaleString("vi-VN")}₫`
      : "";
  // Kyle-F1: HUMAN + COD on SAME line (ORD-1003 flash)
  console.log(`${tag}  ${a.orderId} → ${a.kind}${codBit}`);
  console.log(`         ${a.reason}`);
  console.log(`         impact: ${a.impactEstimate} · ${a.status}`);
  if (a.buyerNotifyVi) {
    console.log("         📱 Tin nhắn buyer (mẫu):");
    console.log(`         "${a.buyerNotifyVi}"`);
  }
}
console.log(
  "   (mẫu copy cho seller/ops — không gửi SMS live / không gateway)\n"
);

// ②b live approve OR Lee-F2 replay from JSONL
const refundTarget = actions.find((a) => a.kind === "propose_refund");
if (replay) {
  console.log("②b Replay Duyệt hoàn (từ JSONL · sau ~7 ngày)");
  const prior = findLatestHumanDecision(readAuditJsonl(auditPath), "ORD-1003");
  if (prior) {
    applyReplayApproval(actions, prior);
    console.log(
      `   📜 ORD-1003 · actor=${prior.actor ?? "?"} · ts=${prior.ts}`
    );
    console.log(
      `   ${prior.before?.status ?? "awaiting_human"} → ${prior.after?.status ?? "approved"} (đọc audit, không ghi quyết định mới)`
    );
    const fee =
      refundTarget?.roundTripFeeEstimateVnd ??
      estimateRoundTripFeeVnd(2_500_000);
    console.log(
      `   💸 Phí 2 chiều (ước tính): ${fee.toLocaleString("vi-VN")}₫`
    );
  } else {
    console.log(
      "   ⚠️  Chưa có human_decision ORD-1003 trong JSONL — chạy `npm run demo:floodops` trước (không --reset)."
    );
  }
  console.log("");
} else if (refundTarget && refundTarget.status === "awaiting_human") {
  const before = refundTarget.status;
  const fee =
    refundTarget.roundTripFeeEstimateVnd ??
    estimateRoundTripFeeVnd(2_500_000);
  approveRefund(actions, refundTarget.orderId, "ops-lead-demo", { auditPath });
  console.log("②b Duyệt hoàn (human approve)");
  console.log(
    `   ✅ ops-lead-demo duyệt ${refundTarget.orderId}: ${before} → ${refundTarget.status}`
  );
  console.log(
    `   💸 Phí 2 chiều (ước tính): ${fee.toLocaleString("vi-VN")}₫ — seller hiểu vì sao cần người duyệt`
  );
  console.log("");
}

// TA-F1 / Kyle-F3: Shop An Đông — exactly 3 lines
const shopPrefer = ["ORD-1001", "ORD-1007", "ORD-1003"];
const shopOrders = shopPrefer
  .map((id) => data.orders.find((o) => o.id === id && o.shopId === "shop-andong"))
  .filter((o): o is Order => o != null)
  .slice(0, 3);
const byOrder = new Map(actions.map((a) => [a.orderId, a]));
console.log("②c Shop An Đông (chủ shop — 3 dòng)");
for (const o of shopOrders) {
  const a = byOrder.get(o.id);
  if (!a) continue;
  const ward = data.wards.find((w) => w.id === o.wardId);
  console.log(
    `   · ${o.id} · ${ward?.name ?? o.wardId} · ${shopStatusVi(a)}`
  );
}
console.log("");

const audit = buildAuditLog(actions);
console.log("③ Audit (JSONL persist)");
console.log(
  `   ${audit.length} entries · ${auto.length} auto · ${human.length} needs human`
);
console.log(`   file: ${auditPath}${replay ? " (replay: không append wave mới)" : ""}`);
for (const e of audit) {
  console.log(
    `   · ${e.orderId} | ${e.kind} | human=${e.requiresHuman} | ${e.status}`
  );
}
console.log("");

// ④ BR2/BR3 — shared @bizmate/billing (Sea internal offline_stub primary)
const floodPlans = listPlans("floodops");
console.log("④ Pricing / billing (BR2 · BR3 · @bizmate/billing)");
console.log(
  "   Who pays: ops org / Express-analog internal budget (champion) — not live SPX pay."
);
console.log(
  `   Value sketch (fixture): COD at-risk ${atRisk.toLocaleString("vi-VN")}₫ ≠ product invoice (fixture estimate vs ops seat charge).`
);
console.log("   Plans listPlans(\"floodops\"):");
for (const p of floodPlans) {
  console.log(
    `   · ${p.id} · ${p.nameVi} · ${p.priceDisplay} · ${p.honestyNote}`
  );
}
const checkout = createCheckout({
  appId: "floodops",
  planId: "floodops-site",
  mode: "offline_stub",
});
console.log("   Primary path: createCheckout(offline_stub) — Sea internal");
console.log(`   ${checkout.honestyBanner}`);
console.log(
  `   → ok=${checkout.ok} · session=${checkout.sessionId} · stub=${checkout.stub}` +
    (checkout.costCenter ? ` · CC=${checkout.costCenter}` : "")
);
console.log(`   ${checkout.detail}`);
const charge = stubCharge({
  appId: "floodops",
  planId: "floodops-site",
  costCenter: "SEA-FLOODOPS-OPS",
  amountDisplay: "1.500.000 ₫ / site / tháng (fixture · internal)",
});
console.log(`   stubCharge: ${charge.honestyBanner}`);
console.log(
  `   → ${charge.chargeId} · CC=${charge.costCenter} · ${charge.detail}`
);
const stripeOpt = createCheckout({
  appId: "floodops",
  planId: "floodops-site",
  mode: "stripe_test",
});
console.log(
  `   Optional secondary: stripe_test · ${honestyBanner("stripe_test")}`
);
console.log(
  `   → session=${stripeOpt.sessionId}` +
    (stripeOpt.url ? ` · url=${stripeOpt.url}` : "")
);
console.log(
  "   Explicit: COD at-risk is ops avoidance metric — not a card charge for FloodOps.\n"
);

console.log(
  "Story: alerts → rule engine (COD/SLA/clear wards/local-knowledge) → auto apply hoặc escalate → human duyệt hoàn → audit."
);
console.log(
  "Analogy only: last-mile flood replan like SPX ops — no live Shopee Express API."
);
console.log(
  "Roadmap (chưa build / post-hackathon): live flood feed · hub capacity · multi-wave throttle."
);
console.log(
  "Policy evolve (offline): Mate propose JSON → Judge schema → human merge fixture; runtime zero-LLM."
);
console.log(
  "Flags: npm run demo:floodops -- --reset | --replay\n"
);
