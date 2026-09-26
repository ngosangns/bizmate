/** Deterministic scam pattern + blacklist — verdict never from LLM. */

export const DOMAIN_BLACKLIST = [
  "vcb-secure-login.xyz",
  "napas-verify.ru",
  "shopee-hoan-tien.tk",
];

export const SCRIPT_PATTERNS: { id: string; re: RegExp; label: string }[] = [
  {
    id: "bank-urgent-link",
    re: /(khóa|khoá).*(link|xác minh)|xác minh ngay/i,
    label: "SMS ngân hàng giả — thúc giục bấm link",
  },
  {
    id: "family-emergency-money",
    re: /(tai nạn|cấp cứu|bắt cóc).*(chuyển|nộp|gửi).*(triệu|đồng)/i,
    label: "Mạo danh người thân xin tiền khẩn",
  },
  {
    id: "qr-refund",
    re: /quét qr.*(hoàn tiền|nhận quà)/i,
    label: "QR hoàn tiền giả",
  },
];

export function urlHitsBlacklist(text: string): string | null {
  const lower = text.toLowerCase();
  for (const d of DOMAIN_BLACKLIST) {
    if (lower.includes(d)) return d;
  }
  return null;
}
