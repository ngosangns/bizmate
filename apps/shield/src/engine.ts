import {
  DOMAIN_BLACKLIST,
  SCRIPT_PATTERNS,
  urlHitsBlacklist,
} from "./blacklist.js";

export type RiskLevel = "safe" | "warn" | "block";

export interface IncomingMessage {
  id: string;
  channel: string;
  from: string;
  body: string;
  meta?: {
    senderSpoof?: boolean;
    deepfakeScore?: number;
    knownContactMismatch?: boolean;
    qrBlacklisted?: boolean;
  };
}

export interface ShieldVerdict {
  messageId: string;
  risk: RiskLevel;
  reasons: string[];
  action: "allow" | "flag" | "block";
  elderExplanation: string;
  familyAlert?: string;
  /** LLM would only draft explanation; risk is rule-derived */
  explanationDraftSource: "template";
}

export function judgeMessage(msg: IncomingMessage): ShieldVerdict {
  const reasons: string[] = [];

  const hit = urlHitsBlacklist(msg.body);
  if (hit) reasons.push(`Domain blacklist: ${hit}`);

  for (const p of SCRIPT_PATTERNS) {
    if (p.re.test(msg.body)) reasons.push(p.label);
  }

  if (msg.meta?.senderSpoof) reasons.push("Sender spoof detected");
  if (msg.meta?.qrBlacklisted) reasons.push("QR on blacklist");
  if ((msg.meta?.deepfakeScore ?? 0) >= 0.9) {
    reasons.push(`Deepfake score ${(msg.meta!.deepfakeScore! * 100).toFixed(0)}%`);
  }
  if (msg.meta?.knownContactMismatch) {
    reasons.push("Voice/contact mismatch với danh bạ tin cậy");
  }

  let risk: RiskLevel = "safe";
  let action: ShieldVerdict["action"] = "allow";
  if (reasons.length === 1) {
    risk = "warn";
    action = "flag";
  }
  if (reasons.length >= 2 || hit || msg.meta?.qrBlacklisted) {
    risk = "block";
    action = "block";
  }
  // deepfake alone is enough to block
  if ((msg.meta?.deepfakeScore ?? 0) >= 0.9) {
    risk = "block";
    action = "block";
  }

  const elderExplanation =
    action === "allow"
      ? "Tin này trông bình thường."
      : `Ba/mẹ ơi, tin này có dấu hiệu lừa đảo: ${reasons.join("; ")}. Đừng bấm link hay chuyển tiền. Con đã được báo.`;

  const familyAlert =
    action === "allow"
      ? undefined
      : `[Shield] ${msg.channel} từ "${msg.from}": ${reasons.join("; ")}`;

  return {
    messageId: msg.id,
    risk,
    reasons,
    action,
    elderExplanation,
    familyAlert,
    explanationDraftSource: "template",
  };
}

export { DOMAIN_BLACKLIST, SCRIPT_PATTERNS };
