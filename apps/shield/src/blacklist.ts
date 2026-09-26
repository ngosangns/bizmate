/** Deterministic scam pattern + blacklist — verdict never from LLM. */

/** Semver of this blacklist snapshot — bump when DOMAIN_BLACKLIST changes. */
export const BLACKLIST_VERSION = "0.1.0";

export const DOMAIN_BLACKLIST = [
  "vcb-secure-login.xyz",
  "napas-verify.ru",
  "shopee-hoan-tien.tk",
  "agribank-hotro.online",
  "cong-an-dieutra.click",
];

/** Short hash of sorted domain list (deterministic, for audit). */
export function blacklistDomainsHash(): string {
  const sorted = [...DOMAIN_BLACKLIST].sort().join("\n");
  let h = 0;
  for (let i = 0; i < sorted.length; i++) {
    h = (Math.imul(31, h) + sorted.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

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
  {
    id: "fake-cskh-bank",
    re: /(cskh|chăm sóc khách hàng).*(vietcombank|agribank|bidv|techcombank|mb ?bank|tpbank|vietinbank)|ngân hàng.*(hỗ trợ|xác minh|khóa tài khoản)/i,
    label: "Giả mạo CSKH / ngân hàng hỗ trợ",
  },
  {
    id: "fake-police-prosecutor",
    re: /(công an|viện kiểm sát|điều tra).*(phối hợp|xin tiền|chuyển khoản|nộp tiền|tạm giữ)/i,
    label: "Giả mạo công an / viện kiểm sát xin tiền hoặc phối hợp điều tra",
  },
  {
    id: "otp-share-request",
    re: /(chia sẻ|gửi|cho|cung cấp).*(otp|mã xác thực|mã otp)|otp.*(chia sẻ|gửi lại|cho tôi|để xác minh)/i,
    label: "Yêu cầu chia sẻ OTP / mã xác thực",
  },
];

/** Allowlist — tên khớp fixture gia đình (ví dụ "Con gái Hương"). */
export const TRUSTED_CONTACTS = [
  "Con gái Hương",
  "Con trai Nam",
  "Cháu nội An",
];

export function isTrustedContact(from: string): boolean {
  const normalized = from.trim().toLowerCase();
  return TRUSTED_CONTACTS.some((c) => c.toLowerCase() === normalized);
}

export function urlHitsBlacklist(text: string): string | null {
  const lower = text.toLowerCase();
  for (const d of DOMAIN_BLACKLIST) {
    if (lower.includes(d)) return d;
  }
  return null;
}
