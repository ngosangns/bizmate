import {
  BLACKLIST_VERSION,
  DOMAIN_BLACKLIST,
  SCRIPT_PATTERNS,
  TRUSTED_CONTACTS,
  blacklistDomainsHash,
  isTrustedContact,
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
}

export interface JudgeOptions {
  /**
   * Default "enforce". In "shadow", would-be blocks become flag + note.
   * Policy: new SCRIPT_PATTERNS / blacklist entries stay shadow/flag for 7 days
   * before promote to enforce (documented SLA; this flag is the runtime switch).
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
  });
}

function elderPlainReasons(codes: ReasonCode[]): string[] {
  return codes
    .map((c) => ELDER_PLAIN[c.id])
    .filter((s): s is string => Boolean(s));
}

/**
 * Hard-block policy (rules/blacklist only — never LLM):
 *   blacklist URL hit OR qrBlacklisted OR deepfakeScore >= 0.9 OR reasons.length >= 2
 * Single soft reason → warn/flag.
 *
 * Allowlist policy:
 *   If isTrustedContact(from) AND no hard-block signals
 *   (URL blacklist / QR blacklist / deepfake / senderSpoof / contactMismatch),
 *   ignore soft SCRIPT reasons → allow.
 *   Hard-block signals still block even when the display name is trusted (spoof).
 *
 * Shadow mode:
 *   Hard-block outcomes become flag with reason/note "shadow: would_block" — still deterministic.
 */
export function judgeMessage(
  msg: IncomingMessage,
  options: JudgeOptions = {}
): ShieldVerdict {
  const mode: ShieldMode = options.mode ?? "enforce";
  const codes: ReasonCode[] = [];
  const blHash = blacklistDomainsHash();

  const hit = urlHitsBlacklist(msg.body);
  if (hit) {
    codes.push({ id: "domain-blacklist", machineLabel: `Domain blacklist: ${hit}` });
  }

  const softScriptCodes: ReasonCode[] = [];
  for (const p of SCRIPT_PATTERNS) {
    if (p.re.test(msg.body)) {
      softScriptCodes.push({
        id: `script-${p.id}`,
        machineLabel: p.label,
      });
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

  // Block if: URL hit OR qr blacklist OR deepfake OR >= 2 reasons
  const wouldBlock =
    Boolean(hit) ||
    Boolean(msg.meta?.qrBlacklisted) ||
    deepfakeHit ||
    codes.length >= 2;

  let risk: RiskLevel = "safe";
  let action: ShieldVerdict["action"] = "allow";
  let shadowNote: string | undefined;

  if (wouldBlock) {
    if (mode === "shadow") {
      risk = "warn";
      action = "flag";
      shadowNote = "shadow: would_block";
      codes.push({ id: "shadow-would-block", machineLabel: "shadow: would_block" });
    } else {
      risk = "block";
      action = "block";
    }
  } else if (codes.length === 1) {
    risk = "warn";
    action = "flag";
  }

  const plain = elderPlainReasons(codes);
  const elderExplanation =
    action === "allow"
      ? "Tin này trông bình thường."
      : plain.length > 0
        ? `Ba/mẹ ơi, ${plain.join(" ")} Đừng bấm link hay chuyển tiền. Con đã được báo.`
        : "Ba/mẹ ơi, tin này có dấu hiệu lừa đảo. Đừng bấm link hay chuyển tiền. Con đã được báo.";

  const machineReasons = codes.map((c) => c.machineLabel);
  const familyAlert =
    action === "allow"
      ? undefined
      : `[Shield] ${msg.channel} từ "${msg.from}": ${machineReasons.join("; ")}`;

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
  };

  recordAudit(verdict, shadowNote);
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
        : `[Shield] Human override BLOCK by ${by} on ${verdict.messageId}`,
    explanationDraftSource: "template",
  };
  recordAudit(next, note);
  return next;
}

export {
  BLACKLIST_VERSION,
  DOMAIN_BLACKLIST,
  SCRIPT_PATTERNS,
  TRUSTED_CONTACTS,
  blacklistDomainsHash,
  isTrustedContact,
};
