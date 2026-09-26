import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { judgeMessage } from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inbox = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../fixtures/scam-inbox.json"), "utf8")
);

console.log(`\n🛡️  Shield demo — hộp thư của ${inbox.elderName}`);
console.log(`Family alert → ${inbox.familyContact}\n`);

for (const m of inbox.messages) {
  const v = judgeMessage(m);
  const icon = v.action === "block" ? "🚫" : v.action === "flag" ? "⚠️" : "✅";
  console.log(`${icon} [${m.channel}] ${m.from}`);
  console.log(`   ${m.body.slice(0, 80)}${m.body.length > 80 ? "…" : ""}`);
  console.log(`   → ${v.action.toUpperCase()} (${v.risk}): ${v.reasons.join("; ") || "clean"}`);
  if (v.familyAlert) console.log(`   📱 ${v.familyAlert}`);
  console.log(`   💬 ${v.elderExplanation}\n`);
}
