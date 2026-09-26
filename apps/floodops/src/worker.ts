/**
 * Event-driven FloodOps worker (sandbox).
 * Consumes flood events from fixture → runWave → persist orders.json + audit JSONL.
 * Zero-LLM hot path. NOT a live SPX / carrier queue consumer.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  approveRefund,
  defaultAuditJsonlPath,
  persistWaveActions,
} from "./audit.js";
import {
  codAtRiskVnd,
  runWave,
  summarizeEvents,
  type FloodEvent,
  type Order,
} from "./engine.js";
import { buildWaveState, defaultStatePath, writeWaveState } from "./state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const autoApprove = process.argv.includes("--approve-refund");
const waveIdArg = process.argv.find((a) => a.startsWith("--wave="));
const waveId = waveIdArg?.slice("--wave=".length) || "hcm-flood-day";

const fixturePath = path.join(__dirname, "../fixtures/hcm-flood-day.json");
const data = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as {
  city: string;
  wards: Parameters<typeof runWave>[1];
  orders: Order[];
  policy: Parameters<typeof runWave>[2];
  events: FloodEvent[];
};

const auditPath = defaultAuditJsonlPath();
const statePath = defaultStatePath();

console.log("⚙️  FloodOps worker — event-driven replan (sandbox · stub)");
console.log("────────────────────────────────────────────────────────");
console.log(`   fixture: ${fixturePath}`);
console.log(`   waveId:  ${waveId}`);
console.log(`   state:   ${statePath}`);
console.log(`   audit:   ${auditPath}`);
console.log(
  "   Honesty: NOT live SPX / NOT live payment · JSONL audit + JSON order state\n"
);

const summary = summarizeEvents(data.events);
console.log("① Consume events");
for (const a of summary.floodAlerts) {
  console.log(`   ⚠️  flood_alert ${a.wardId} · ${a.floodCm}cm`);
}
if (summary.courierCancelWardIds.length) {
  console.log(`   🚫 courier_cancel: ${summary.courierCancelWardIds.join(", ")}`);
}
if (summary.motorcycleAlleyWardIds.length) {
  console.log(
    `   🛵 local_knowledge: ${summary.motorcycleAlleyWardIds.join(", ")}`
  );
}
console.log("");

const actions = runWave(data.orders, data.wards, data.policy, data.events);
persistWaveActions(actions, { waveId, auditPath });

if (autoApprove) {
  const refund = actions.find((a) => a.kind === "propose_refund");
  if (refund && refund.status === "awaiting_human") {
    approveRefund(actions, refund.orderId, "ops-worker-auto-demo", { auditPath });
    console.log(
      `② Human gate demo: approved ${refund.orderId} (flag --approve-refund)\n`
    );
  }
}

const state = buildWaveState({
  waveId,
  city: data.city,
  wards: data.wards,
  orders: data.orders,
  events: data.events,
  policy: data.policy,
  actions,
});
writeWaveState(state, statePath);

const atRisk = codAtRiskVnd(data.orders, data.wards);
const human = actions.filter((a) => a.requiresHuman).length;
const auto = actions.length - human;

console.log("③ Persist");
console.log(`   orders.json written · ${actions.length} actions`);
console.log(
  `   COD at-risk (fixture): ${atRisk.toLocaleString("vi-VN")}₫ · auto=${auto} · human=${human}`
);
console.log(`   ${state.honestyBanner}`);
console.log("\n✅ worker EXIT 0 — dashboard can read data/orders.json\n");
