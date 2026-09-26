import {
  BLACKLIST_VERSION,
  DOMAIN_BLACKLIST,
  SCRIPT_PATTERNS,
  SHADOW_DAYS,
  TRUSTED_CONTACTS,
  addCalendarDays,
  blacklistDomainsHash,
  isPatternInShadow,
  isTrustedContact,
  shadowedPatternIds,
  urlHitsBlacklist,
} from "./blacklist.js";

export type RiskLevel = "safe" | "warn" | "block";
export type ShieldMode = "enforce" | "shadow";

export interface IncomingMessage {
  id: string;
  channel: string;
  from: string;
  body: string;
  meta?: {
    senderSpoof?: boolean;
    /** Fixture / upstream detector stub — never live ML in this offline build. */
    deepfakeScore?: number;
    knownContactMismatch?: boolean;
    qrBlacklisted?: boolean;
  };
}

export interface ReasonCode {
  id: string;
  machineLabel: string;
  /** Soft script reason that is still inside the per-pattern 7-day shadow window. */
  shadowSoft?: boolean;
}

/** Plain VN sentences for elders — no jargon like "Domain blacklist" or "Deepfake score 97%". */
const ELDER_PLAIN: Record<string, string> = {
  "domain-blacklist": "tin có đường link giả mạo, đừng bấm vào.",
  "script-bank-urgent-link": "tin giả ngân hàng, thúc giục bấm link.",
  "script-family-emergency-money": "ai đó đang giả làm người thân xin tiền gấp.",
  "script-qr-refund": "mã QR hoàn tiền này không đáng tin.",
  "script-fake-cskh-bank": "ai đó giả làm tổng đài ngân hàng gọi xác minh.",
  "script-fake-police-prosecutor": "ai đó giả làm công an hoặc viện kiểm sát xin tiền.",
  "script-otp-share-request": "đừng bao giờ chia sẻ mã OTP hay mã xác thực.",
  "sender-spoof": "người gửi có dấu hiệu giả mạo.",
  "qr-blacklist": "mã QR nằm trong danh sách nguy hiểm.",
  "deepfake": "giọng nói hoặc hình ảnh có dấu hiệu giả mạo.",
  "contact-mismatch": "giọng nói không khớp với người thân trong danh bạ.",
};

export interface ShieldVerdict {
  messageId: string;
  risk: RiskLevel;
  reasons: string[];
  action: "allow" | "flag" | "block";
  elderExplanation: string;
  familyAlert?: string;
  /** LLM would only draft explanation; risk is rule-derived */
  explanationDraftSource: "template";
  blacklistVersion: string;
  blacklistHash?: string;
  /** Present when deepfakeScore was considered — always fixture/stub offline. */
  detector?: "fixture";
  mode?: ShieldMode;
  /** Pattern ids that matched while still inside the SHADOW_DAYS window. */
  shadowPatternIds?: string[];
}

export interface AuditEntry {
  at: string;
  messageId: string;
  action: ShieldVerdict["action"];
  risk: RiskLevel;
  reasons: string[];
  blacklistVersion: string;
  blacklistHash?: string;
  detector?: "fixture";
  mode?: ShieldMode;
  note?: string;
  shadowPatternIds?: string[];
}

export interface JudgeOptions {
  /**
   * Default "enforce". In "shadow", would-be blocks become flag + note.
   * Per-pattern calendar: SCRIPT_PATTERNS with introducedAt inside SHADOW_DAYS
   * do not count toward the soft→block threshold (see isPatternInShadow).
   * Global mode: "shadow" still forces every would-block → flag.
   */
  mode?: ShieldMode;
}

/** Module-level append-only audit log. */
export const auditLog: AuditEntry[] = [];

export function clearAuditLog(): void {
  auditLog.length = 0;
}

export function recordAudit(verdict: ShieldVerdict, note?: string): void {
  auditLog.push({
    at: new Date().toISOString(),
    messageId: verdict.messageId,
    action: verdict.action,
    risk: verdict.risk,
    reasons: [...verdict.reasons],
    blacklistVersion: verdict.blacklistVersion,
    blacklistHash: verdict.blacklistHash,
    detector: verdict.detector,
    mode: verdict.mode,
    note,
    shadowPatternIds: verdict.shadowPatternIds
      ? [...verdict.shadowPatternIds]
      : undefined,
  });
}

function elderPlainReasons(codes: ReasonCode[]): string[] {
  return codes
    .map((c) => ELDER_PLAIN[c.id])
    .filter((s): s is string => Boolean(s));
}

/**
 * Hard-block policy (rules/blacklist only — never LLM):
 *   blacklist URL hit OR qrBlacklisted OR deepfakeScore >= 0.9
 *   OR (non-shadow reasons).length >= 2
 * Shadowed SCRIPT_PATTERNS still appear in reasons but do NOT count toward
 * the soft→block threshold; if they would have been the tipping driver,
 * action stays flag with a note.
 * Single soft reason → warn/flag.
 *
 * Allowlist policy:
 *   If isTrustedContact(from) AND no hard-block signals
 *   (URL blacklist / QR blacklist / deepfake / senderSpoof / contactMismatch),
 *   ignore soft SCRIPT reasons → allow.
 *   Hard-block signals still block even when the display name is trusted (spoof).
 *
 * Global shadow mode:
 *   Hard-block outcomes become flag with reason/note "shadow: would_block".
 */
export function judgeMessage(
  msg: IncomingMessage,
  options: JudgeOptions = {}
): ShieldVerdict {
  const mode: ShieldMode = options.mode ?? "enforce";
  const codes: ReasonCode[] = [];
  const blHash = blacklistDomainsHash();
  const firedShadowIds: string[] = [];

  const hit = urlHitsBlacklist(msg.body);
  if (hit) {
    codes.push({ id: "domain-blacklist", machineLabel: `Domain blacklist: ${hit}` });
  }

  const softScriptCodes: ReasonCode[] = [];
  for (const p of SCRIPT_PATTERNS) {
    if (p.re.test(msg.body)) {
      const inShadow = isPatternInShadow(p.shadowUntil);
      if (inShadow) {
        firedShadowIds.push(p.id);
        softScriptCodes.push({
          id: `script-${p.id}`,
          machineLabel: `${p.label} (shadow: pattern ${p.id} <${SHADOW_DAYS}d)`,
          shadowSoft: true,
        });
      } else {
        softScriptCodes.push({
          id: `script-${p.id}`,
          machineLabel: p.label,
        });
      }
    }
  }

  if (msg.meta?.senderSpoof) {
    codes.push({ id: "sender-spoof", machineLabel: "Sender spoof detected" });
  }
  if (msg.meta?.qrBlacklisted) {
    codes.push({ id: "qr-blacklist", machineLabel: "QR on blacklist" });
  }

  const deepfakePresent = msg.meta?.deepfakeScore !== undefined;
  const deepfakeHit = (msg.meta?.deepfakeScore ?? 0) >= 0.9;
  if (deepfakeHit) {
    const pct = ((msg.meta!.deepfakeScore! * 100).toFixed(0));
    codes.push({
      id: "deepfake",
      // Honesty: fixture/stub — never claim live ML
      machineLabel: `Deepfake score ${pct}% [detector: fixture]`,
    });
  }
  if (msg.meta?.knownContactMismatch) {
    codes.push({
      id: "contact-mismatch",
      machineLabel: "Voice/contact mismatch với danh bạ tin cậy",
    });
  }

  const hardSignal =
    Boolean(hit) ||
    Boolean(msg.meta?.qrBlacklisted) ||
    deepfakeHit ||
    Boolean(msg.meta?.senderSpoof) ||
    Boolean(msg.meta?.knownContactMismatch);

  // Allowlist: trusted + no hard-block signals → drop soft script reasons
  const trusted = isTrustedContact(msg.from);
  if (!(trusted && !hardSignal)) {
    codes.push(...softScriptCodes);
  }

  const enforceableCodes = codes.filter((c) => !c.shadowSoft);
  const hardSignalBlock =
    Boolean(hit) || Boolean(msg.meta?.qrBlacklisted) || deepfakeHit;
  // Soft threshold uses only non-shadow reasons (hard meta + old patterns)
  const softThresholdBlock = enforceableCodes.length >= 2;
  const wouldBlock = hardSignalBlock || softThresholdBlock;
  // If shadow soft reasons were counted, would we tip into block?
  const wouldBlockIfShadowCounted =
    hardSignalBlock || codes.length >= 2;

  let risk: RiskLevel = "safe";
  let action: ShieldVerdict["action"] = "allow";
  let auditNote: string | undefined;

  if (wouldBlock) {
    if (mode === "shadow") {
      risk = "warn";
      action = "flag";
      auditNote = "shadow: would_block";
      codes.push({ id: "shadow-would-block", machineLabel: "shadow: would_block" });
    } else {
      risk = "block";
      action = "block";
    }
  } else if (codes.length >= 1) {
    risk = "warn";
    action = "flag";
    // Shadowed pattern(s) would have been sole/tipping soft→block driver
    if (
      firedShadowIds.length > 0 &&
      wouldBlockIfShadowCounted &&
      !wouldBlock
    ) {
      auditNote = `shadow: pattern tipping (${firedShadowIds.join(",")}) — not enforce`;
      codes.push({
        id: "shadow-pattern-tipping",
        machineLabel: auditNote,
      });
    }
  }

  const plain = elderPlainReasons(codes);
  const elderExplanation =
    action === "allow"
      ? "Tin này trông bình thường."
      : plain.length > 0
        ? `Ba/mẹ ơi, ${plain.join(" ")} Đừng bấm link hay chuyển tiền. Con đã được báo.`
        : "Ba/mẹ ơi, tin này có dấu hiệu lừa đảo. Đừng bấm link hay chuyển tiền. Con đã được báo.";

  const machineReasons = codes.map((c) => c.machineLabel);
  // TA-S3: familyAlert = one everyday VN sentence; no hash/version/jargon
  const familyAlert =
    action === "allow"
      ? undefined
      : action === "block"
        ? "Con ơi, Shield vừa chặn một tin nguy hiểm gửi cho ba/mẹ — hãy kiểm tra giúp."
        : "Con ơi, Shield vừa cảnh báo một tin đáng ngờ gửi cho ba/mẹ — hãy xem giúp.";

  const shadowPatternIds =
    firedShadowIds.length > 0 ? [...firedShadowIds] : undefined;

  const verdict: ShieldVerdict = {
    messageId: msg.id,
    risk,
    reasons: machineReasons,
    action,
    elderExplanation,
    familyAlert,
    explanationDraftSource: "template",
    blacklistVersion: BLACKLIST_VERSION,
    blacklistHash: blHash,
    detector: deepfakePresent ? "fixture" : undefined,
    mode,
    shadowPatternIds,
  };

  recordAudit(verdict, auditNote);
  return verdict;
}

/**
 * Human caregiver override. Returns a new verdict; appends to audit log.
 * risk/action updated; reasons append "Human override: …".
 */
export function applyHumanOverride(
  verdict: ShieldVerdict,
  decision: "allow" | "block",
  by: string
): ShieldVerdict {
  const note = `Human override: ${decision} by ${by}`;
  const next: ShieldVerdict = {
    ...verdict,
    action: decision === "allow" ? "allow" : "block",
    risk: decision === "allow" ? "safe" : "block",
    reasons: [...verdict.reasons, note],
    elderExplanation:
      decision === "allow"
        ? "Tin này đã được người thân xác nhận an toàn."
        : "Người thân đã xác nhận đây là tin nguy hiểm. Đừng bấm link hay chuyển tiền.",
    familyAlert:
      decision === "allow"
        ? undefined
        : "Con ơi, người thân đã xác nhận tin này nguy hiểm — đừng để ba/mẹ bấm link.",
    explanationDraftSource: "template",
  };
  recordAudit(next, note);
  return next;
}

export {
  BLACKLIST_VERSION,
  DOMAIN_BLACKLIST,
  SCRIPT_PATTERNS,
  SHADOW_DAYS,
  TRUSTED_CONTACTS,
  addCalendarDays,
  blacklistDomainsHash,
  isPatternInShadow,
  isTrustedContact,
  shadowedPatternIds,
};
