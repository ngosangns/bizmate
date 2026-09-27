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
import { attachAiDrafts } from "./ai-explain.js";
import {
  createCheckout,
  honestyBanner,
  listPlans,
  type BillingMode,
} from "@bizmate/billing";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inbox = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../fixtures/scam-inbox.json"), "utf8")
);

/** Kyle-S2: `--once` skips RESET REPLAY; default keeps full reset loop. */
const ONCE = process.argv.includes("--once");
/** BR3: `--subscribe` emphasizes checkout CTA (BILLING section always prints). */
const SUBSCRIBE = process.argv.includes("--subscribe");
const BILLING_MODE: BillingMode = process.argv.includes("--offline-stub")
  ? "offline_stub"
  : "stripe_test";

function printHeader(): void {
  console.log(`\n🛡️  Shield demo — hộp thư của ${inbox.elderName}`);
  // TA-S1 P0 — MUST be first opener (family/buyer; NEVER seller KPI)
  console.log(`30s backup · ba/mẹ mua Shopee`);
  // Sid-S1 / S1
  console.log(`backup 30s · family B2C`);
  console.log(`STAGE: 30s backup only — not hero; not seller KPI`);
  console.log(`buyer-trust QR / phishing adjacent (no live SPX)`);
  // Son-S1 — detector: fixture above-the-fold (before any machine reasons)
  console.log(`detector: fixture`);
  // Sid-S1 / S2 — mandatory honesty (also printed per-message on m2)
  console.log(`deepfakeScore=fixture`);
  console.log(
    `HONESTY: deepfakeScore = fixture meta (not a live detector)`
  );
  // Son-S3 — do not claim Mate codegen for Shield
  console.log(
    `ENGINE: rule engine + fixture score — not Mate codegen (Codex = contracts/audit only)`
  );
  console.log(
    `AI: explanation draft + triage assist (overridesVerdict=false) · risk/action = rules only`
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
  // Kyle-S2
  console.log(
    ONCE
      ? `CLI: --once (single pass; skip RESET REPLAY)`
      : `CLI: default (RESET REPLAY on); pass --once to skip`
  );
  console.log();
}

type LiveCounts = { allow: number; flag: number; block: number };

function runInboxPass(
  label: string,
  messages: IncomingMessage[]
): ShieldVerdict[] {
  console.log(`—— ${label} ——`);
  const verdicts: ShieldVerdict[] = [];
  const live: LiveCounts = { allow: 0, flag: 0, block: 0 };
  const total = messages.length;
  for (let i = 0; i < total; i++) {
    const m = messages[i];
    const step = i + 1;
    const v = attachAiDrafts(m, judgeMessage(m));
    verdicts.push(v);
    live[v.action]++;
    const icon = v.action === "block" ? "🚫" : v.action === "flag" ? "⚠️" : "✅";
    // Kyle-S3 — STEP pill with live running counts (not only SUMMARY)
    console.log(
      `STEP ${step}/${total} · ${v.action}  ${icon}  live allow=${live.allow} flag=${live.flag} block=${live.block}`
    );
    // Son-S1 / Lee-S1 — fixture callout on deepfake (m2) before any machine clutter
    if (m.meta?.deepfakeScore !== undefined || v.detector) {
      console.log(
        `   detector: fixture${
          m.meta?.deepfakeScore !== undefined
            ? ` (deepfakeScore stub value=${m.meta.deepfakeScore})`
            : ""
        }`
      );
    }
    // R7 — AI draft + triage (labels honest; does not override rule)
    console.log(`   🤖 AI đang đề xuất · ${v.aiExplanation.meta.labelVi}`);
    console.log(`   💬 ${v.aiExplanation.elderVi}`);
    if (v.aiExplanation.familyVi) console.log(`   📱 ${v.aiExplanation.familyVi}`);
    console.log(
      `   triage score=${v.triageAssist.score} · overridesVerdict=${v.triageAssist.overridesVerdict} · ${v.triageAssist.meta.labelVi}`
    );
    console.log(`   ${v.triageAssist.rationaleVi}`);
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

function printAuditSummary(verdicts: ShieldVerdict[]): void {
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
  // Kyle-S1 — machine reasons[] only in AUDIT (not cluttered inline on STEPs)
  console.log(`  —— machine reasons (AUDIT only) ——`);
  for (const v of verdicts) {
    const shadow =
      v.shadowPatternIds?.length
        ? ` | shadowPatternIds=${v.shadowPatternIds.join(",")}`
        : "";
    console.log(
      `  ${v.messageId}: ${v.action} (${v.risk}) — ${
        v.reasons.join("; ") || "clean"
      }${shadow}`
    );
  }
}


function printBillingSection(): void {
  console.log("—— BILLING (BR2/BR3 · packaging only) ——");
  console.log("  Buyer: family B2C (child pays). Sea = distribution only — not payer.");
  console.log("  Source: @bizmate/billing listPlans(\"shield\") + fixtures/family-plans.json");
  console.log("  Unit economics: fixture prices only — no invented live ARR/ARPU.");
  console.log();
  console.log("  —— pricing table (fixture) ——");
  const plans = listPlans("shield");
  for (const p of plans) {
    console.log(
      `  · ${p.name} (${p.id}) — ${p.priceDisplay} — ${p.features.join("; ")}`
    );
  }
  console.log();
  const planId = "shield-family-care";
  const mode = BILLING_MODE;
  console.log(
    SUBSCRIBE
      ? `  CTA: --subscribe → createCheckout(${planId}, mode=${mode})`
      : `  CTA: demo subscribe (Family Care) → createCheckout(${planId}, mode=${mode})`
  );
  console.log(`  ${honestyBanner(mode)}`);
  const checkout = createCheckout({
    appId: "shield",
    planId,
    mode,
  });
  console.log(`  honestyBanner: ${checkout.honestyBanner}`);
  console.log(
    `  sessionId=${checkout.sessionId}  ok=${checkout.ok}  stub=${checkout.stub}`
  );
  if (checkout.url) console.log(`  url=${checkout.url}`);
  else console.log(`  url=(none · offline stub)`);
  console.log(`  detail: ${checkout.detail}`);
  console.log(
    `  demoSubscribeCount=1 (this CTA) · plan=${planId} · NOT live payment`
  );
  console.log();
}

clearAuditLog();
printHeader();

const messages = inbox.messages as IncomingMessage[];
const verdicts = runInboxPass(
  `INBOX PASS 1 (${messages.length} messages)`,
  messages
);

printAuditSummary(verdicts);

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

if (ONCE) {
  console.log("\n—— --once: skip RESET REPLAY ——");
  console.log(
    `  Re-run without --once (or: npm run demo:shield) for full RESET loop.\n`
  );
} else {
  console.log("\n—— RESET ——");
  console.log(
    `  To restart the 90s demo: clear auditLog + re-judge the same fixture (done below).`
  );
  console.log(
    `  CLI: npm run demo:shield   |  npm run demo -w @bizmate/shield -- --once\n`
  );

  clearAuditLog();
  const replay = runInboxPass("RESET REPLAY (inbox from scratch)", messages);
  printAuditSummary(replay);
  console.log();
}

printBillingSection();
