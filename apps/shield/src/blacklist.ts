/** Deterministic scam pattern + blacklist — verdict never from LLM. */

/** Semver of this blacklist snapshot — bump when DOMAIN_BLACKLIST changes. */
export const BLACKLIST_VERSION = "0.1.0";

/** New SCRIPT_PATTERNS stay soft/shadow this many calendar days before counting toward hard-block. */
export const SHADOW_DAYS = 7;

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

/** Add calendar days to an ISO date YYYY-MM-DD → YYYY-MM-DD. */
export function addCalendarDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * True while local calendar date of `now` is strictly before `shadowUntil` (YYYY-MM-DD).
 * Call with pattern.shadowUntil (= introducedAt + SHADOW_DAYS).
 */
export function isPatternInShadow(
  shadowUntil: string,
  now: Date = new Date()
): boolean {
  const parts = shadowUntil.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return false;
  const [y, m, d] = parts;
  const until = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return today.getTime() < until.getTime();
}

export interface ScriptPattern {
  id: string;
  re: RegExp;
  label: string;
  /** ISO date YYYY-MM-DD when pattern entered the list. */
  introducedAt: string;
  /** ISO date YYYY-MM-DD = introducedAt + SHADOW_DAYS. In shadow while now < shadowUntil. */
  shadowUntil: string;
}

function pattern(
  id: string,
  re: RegExp,
  label: string,
  introducedAt: string
): ScriptPattern {
  return {
    id,
    re,
    label,
    introducedAt,
    shadowUntil: addCalendarDays(introducedAt, SHADOW_DAYS),
  };
}

export const SCRIPT_PATTERNS: ScriptPattern[] = [
  // Mature (≥8d before 2026-09-26) → shadowUntil in the past → enforce (demo m1/m2/m3)
  pattern(
    "bank-urgent-link",
    /(khóa|khoá).*(link|xác minh)|xác minh ngay/i,
    "SMS ngân hàng giả — thúc giục bấm link",
    "2026-09-01"
  ),
  pattern(
    "family-emergency-money",
    /(tai nạn|cấp cứu|bắt cóc).*(chuyển|nộp|gửi).*(triệu|đồng)/i,
    "Mạo danh người thân xin tiền khẩn",
    "2026-09-01"
  ),
  pattern(
    "qr-refund",
    /quét qr.*(hoàn tiền|nhận quà)/i,
    "QR hoàn tiền giả",
    "2026-09-10"
  ),
  // New (within last 7d of 2026-09-26) → shadowUntil in the future → soft/shadow
  pattern(
    "fake-cskh-bank",
    /(cskh|chăm sóc khách hàng).*(vietcombank|agribank|bidv|techcombank|mb ?bank|tpbank|vietinbank)|ngân hàng.*(hỗ trợ|xác minh|khóa tài khoản)/i,
    "Giả mạo CSKH / ngân hàng hỗ trợ",
    "2026-09-24"
  ),
  pattern(
    "fake-police-prosecutor",
    /(công an|viện kiểm sát|điều tra).*(phối hợp|xin tiền|chuyển khoản|nộp tiền|tạm giữ)/i,
    "Giả mạo công an / viện kiểm sát xin tiền hoặc phối hợp điều tra",
    "2026-09-01"
  ),
  pattern(
    "otp-share-request",
    /(chia sẻ|gửi|cho|cung cấp).*(otp|mã xác thực|mã otp)|otp.*(chia sẻ|gửi lại|cho tôi|để xác minh)/i,
    "Yêu cầu chia sẻ OTP / mã xác thực",
    "2026-09-25"
  ),
];

/** Pattern ids currently inside the shadow window (now < shadowUntil). */
export function shadowedPatternIds(now: Date = new Date()): string[] {
  return SCRIPT_PATTERNS.filter((p) =>
    isPatternInShadow(p.shadowUntil, now)
  ).map((p) => p.id);
}

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
