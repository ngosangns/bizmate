import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runWave } from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../fixtures/hcm-flood-day.json"), "utf8")
);

console.log(`\n🌧️  FloodOps demo — ${data.city}`);
console.log("Events:", data.events.map((e: { type: string }) => e.type).join(", "));
console.log("");

const actions = runWave(data.orders, data.wards, data.policy);
for (const a of actions) {
  const tag = a.requiresHuman ? "👤 HUMAN" : "🤖 AUTO";
  console.log(`${tag} ${a.orderId} → ${a.kind}`);
  console.log(`     ${a.reason}`);
  console.log(`     impact: ${a.impactEstimate} · ${a.status}\n`);
}
