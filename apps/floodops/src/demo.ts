import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  approveRefund,
  defaultAuditJsonlPath,
  persistWaveActions,
  resetAuditFile,
} from "./audit.js";
import {
  buildAuditLog,
  codAtRiskVnd,
  runWave,
  summarizeEvents,
  type FloodEvent,
} from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reset = process.argv.includes("--reset");
const auditPath = defaultAuditJsonlPath();

if (reset) {
  resetAuditFile(auditPath);
  console.log("↺ --reset: đã xóa audit JSONL — demo replay từ đầu\n");
}

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../fixtures/hcm-flood-day.json"), "utf8")
) as {
  city: string;
  wards: Parameters<typeof runWave>[1];
  orders: Parameters<typeof runWave>[0];
  policy: Parameters<typeof runWave>[2];
  events: FloodEvent[];
};

const events = summarizeEvents(data.events);
const actions = runWave(data.orders, data.wards, data.policy, data.events);
persistWaveActions(actions, { waveId: "hcm-flood-day", auditPath });

const atRisk = codAtRiskVnd(data.orders, data.wards);
const auto = actions.filter((a) => !a.requiresHuman);
const human = actions.filter((a) => a.requiresHuman);

console.log(`\n🌧️  FloodOps — ${data.city} flood-day replan (offline fixture)`);
console.log("────────────────────────────────────────────────────────");
console.log(
  "Buyer nội bộ (persona): last-mile ops lead / control tower SPX-style"
);
console.log(
  `   Tuần-2 metric (fixture estimate): COD at-risk nếu không replan = ${atRisk.toLocaleString("vi-VN")}₫`
);
console.log(
  "   (deterministic từ đơn trên ward ngập — không phải KPI live SPX)\n"
);

console.log("① Cảnh báo / alerts");
for (const a of events.floodAlerts) {
  console.log(`   ⚠️  ${a.wardId} · ${a.floodCm}cm`);
}
if (events.courierCancelWardIds.length) {
  console.log(
    `   🚫 courier_cancel: ${events.courierCancelWardIds.join(", ")}`
  );
}
console.log("");

console.log("② Hành động / actions (AUTO vs HUMAN)");
// Flash HUMAN rows first (Kyle 30s hook), then AUTO
const ordered = [
  ...actions.filter((a) => a.requiresHuman),
  ...actions.filter((a) => !a.requiresHuman),
];
for (const a of ordered) {
  const tag = a.requiresHuman ? "👤 HUMAN" : "🤖 AUTO ";
  console.log(`${tag}  ${a.orderId} → ${a.kind}`);
  console.log(`         ${a.reason}`);
  console.log(`         impact: ${a.impactEstimate} · ${a.status}`);
}
console.log("");

// Human approve control — Duyệt hoàn on ORD-1003 (Sidharth / Tuấn Anh)
const refundTarget = actions.find(
  (a) => a.kind === "propose_refund" && a.status === "awaiting_human"
);
if (refundTarget) {
  const before = refundTarget.status;
  approveRefund(actions, refundTarget.orderId, "ops-lead-demo", { auditPath });
  console.log("②b Duyệt hoàn (human approve)");
  console.log(
    `   ✅ ops-lead-demo duyệt ${refundTarget.orderId}: ${before} → ${refundTarget.status}`
  );
  console.log("");
}

const audit = buildAuditLog(actions);
console.log("③ Audit (JSONL persist)");
console.log(
  `   ${audit.length} entries · ${auto.length} auto · ${human.length} needs human`
);
console.log(`   file: ${auditPath}`);
for (const e of audit) {
  console.log(
    `   · ${e.orderId} | ${e.kind} | human=${e.requiresHuman} | ${e.status}`
  );
}
console.log("");
console.log(
  "Story: alerts → rule engine (COD/SLA/clear wards) → auto apply hoặc escalate → human duyệt hoàn → audit."
);
console.log(
  "Analogy only: last-mile flood replan like SPX ops — no live Shopee Express API."
);
console.log("Replay: npm run demo:floodops -- --reset\n");
