import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BLACKLIST_VERSION,
  SHADOW_DAYS,
  applyHumanOverride,
  auditLog,
  blacklistDomainsHash,
  clearAuditLog,
  judgeMessage,
  shadowedPatternIds,
  type IncomingMessage,
  type ShieldVerdict,
} from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inbox = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../fixtures/scam-inbox.json"), "utf8")
);

function printHeader(): void {
  console.log(`\n🛡️  Shield demo — hộp thư của ${inbox.elderName}`);
  // TA-S1 P0 — MUST be first opener (family/buyer; NEVER seller KPI)
  console.log(`30s backup · ba/mẹ mua Shopee`);
  // Sid-S1 / S1
  console.log(`backup 30s · family B2C`);
  console.log(`STAGE: 30s backup only — not hero; not seller KPI`);
  console.log(`buyer-trust QR / phishing adjacent (no live SPX)`);
  // Sid-S1 / S2 — mandatory honesty (also printed per-message on m2)
  console.log(`deepfakeScore=fixture`);
  console.log(
    `HONESTY: deepfakeScore = fixture meta (not a live detector)`
  );
  // Sid-S2 — Sea wedge = distribution surface, NOT payer
  console.log(
    `Sea wedge: Shopee Buyer Protection surface for fake QR hoàn tiền (distribution only; payer = family).`
  );
  console.log(
    `Payer: family B2C (con trả cho ba/mẹ). Sea/Shopee = distribution only — fake QR refund / phishing adjacent; no live SPX.`
  );
  console.log(`Family alert → ${inbox.familyContact}`);
  if (inbox.trustedContacts?.length) {
    console.log(`Trusted contacts → ${inbox.trustedContacts.join(", ")}`);
  }
  const shadowIds = shadowedPatternIds();
  console.log(
    `Per-pattern shadow (${SHADOW_DAYS}d window, now < shadowUntil): ${
      shadowIds.length ? shadowIds.join(", ") : "(none)"
    }`
  );
  console.log();
}

function runInboxPass(
  label: string,
  messages: IncomingMessage[]
): ShieldVerdict[] {
  console.log(`—— ${label} ——`);
  const verdicts: ShieldVerdict[] = [];
  const total = messages.length;
  for (let i = 0; i < total; i++) {
    const m = messages[i];
    const step = i + 1;
    const v = judgeMessage(m);
    verdicts.push(v);
    const icon = v.action === "block" ? "🚫" : v.action === "flag" ? "⚠️" : "✅";
    console.log(`STEP ${step}/${total}  ${icon} [${m.channel}] ${m.from}`);
    console.log(`   ${m.body.slice(0, 80)}${m.body.length > 80 ? "…" : ""}`);
    if (m.meta?.deepfakeScore !== undefined) {
      // Lee-S1 — unmistakable fixture callout on m2
      console.log(
        `   deepfakeScore=fixture (upstream detector stub) value=${m.meta.deepfakeScore}`
      );
    }
    console.log(
      `   → ${v.action.toUpperCase()} (${v.risk}): ${v.reasons.join("; ") || "clean"}`
    );
    if (v.detector) console.log(`   detector: ${v.detector}`);
    if (v.shadowPatternIds?.length) {
      console.log(`   shadowPatternIds: ${v.shadowPatternIds.join(", ")}`);
    }
    if (v.familyAlert) console.log(`   📱 ${v.familyAlert}`);
    console.log(`   💬 ${v.elderExplanation}`);
    // TA-S2 — buyer VN tip after blocking fake QR hoàn tiền (m3)
    if (
      v.action === "block" &&
      (m.id === "m3" || (m.meta?.qrBlacklisted && /hoàn tiền/i.test(m.body)))
    ) {
      console.log(
        `   Tip buyer: Đừng quét QR hoàn tiền từ shipper lạ — mở app Shopee để kiểm tra đơn.`
      );
    }
    console.log();
  }
  return verdicts;
}

function printAuditSummary(): void {
  const counts = { allow: 0, flag: 0, block: 0 };
  for (const e of auditLog) {
    counts[e.action]++;
  }
  console.log("—— AUDIT SUMMARY ——");
  // Lee-S1 / TA-S3 — version/hash + deepfake=fixture ONLY here (not in familyAlert/elder)
  console.log(
    `  AUDIT: blacklistVersion=${BLACKLIST_VERSION}  hash=${blacklistDomainsHash()}  deepfake=fixture`
  );
  console.log(
    `  allow=${counts.allow}  flag=${counts.flag}  block=${counts.block}  (total entries=${auditLog.length})`
  );
}

clearAuditLog();
printHeader();

const messages = inbox.messages as IncomingMessage[];
const verdicts = runInboxPass(`INBOX PASS 1 (${messages.length} messages)`, messages);

printAuditSummary();

// Example human override on a blocked message (false-positive story path)
const blocked = verdicts.find((v) => v.action === "block");
if (blocked) {
  console.log("\n—— HUMAN OVERRIDE EXAMPLE (false positive → allow) ——");
  console.log(`  Before: ${blocked.messageId} → ${blocked.action} (${blocked.risk})`);
  console.log(`    reasons: ${blocked.reasons.join("; ")}`);
  const overridden = applyHumanOverride(blocked, "allow", "Con gái Hương");
  console.log(`  After:  ${overridden.messageId} → ${overridden.action} (${overridden.risk})`);
  console.log(`    reasons: ${overridden.reasons.join("; ")}`);
  console.log(`    💬 ${overridden.elderExplanation}`);
  // Lee-S3 — FP SLA line after override
  console.log(
    `FP SLA: trusted-contact false-block target <1%; override = human decide`
  );
}

console.log("\n—— RESET ——");
console.log(
  `  To restart the 90s demo: clear auditLog + re-judge the same fixture (done below).`
);
console.log(`  CLI: npm run demo:shield   (idempotent offline replay)\n`);

clearAuditLog();
runInboxPass("RESET REPLAY (inbox from scratch)", messages);
printAuditSummary();
console.log();
