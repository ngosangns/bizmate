# Shield — Lá chắn tin nhắn lừa đảo cho người cao tuổi

> **Stage posture:** `30s backup · ba/mẹ mua Shopee` / `backup 30s · family B2C`. Shield is a **30s backup** demo (not the hero; not seller KPI). Lead with FloodOps / Bookkeeper / BizMate unless GTM is crystal-clear.

## Who pays (ONE payer)

**Primary payer = family (B2C).** Con/cháu trả subscription bảo vệ ba/mẹ — child pays for parents’ shield.

**Sea wedge:** Shopee Buyer Protection surface for fake QR hoàn tiền (**distribution only; payer = family**). Sea T&S / Shopee buyer protection is a **distribution partner** only — fake QR refund / phishing adjacent to buyer trust. **Not** the paying customer. Do not pitch three payers. **Forbidden:** seller opener / seller KPI framing.

## Vấn đề

Người lớn tuổi ở Việt Nam thường nhận SMS / Zalo / QR giả mạo ngân hàng, công an, hoặc người thân xin tiền. Họ khó phân biệt link độc, OTP lừa, và giọng deepfake. Shield chặn / cảnh báo **trước khi** họ bấm link hoặc chuyển tiền, rồi báo cho người thân trong gia đình (payer).

Offline demo one-liner: *Buyer-trust adjacent — fake QR hoàn tiền / phishing; family pays; no live SPX claim.*

Buyer tip (after QR block): *Đừng quét QR hoàn tiền từ shipper lạ — mở app Shopee để kiểm tra đơn.*

## Mô hình tin cậy (trust model)

- **Phán quyết rủi ro = luật + blacklist thôi**, không dùng LLM để quyết block/allow.
- LLM (nếu có sau này) chỉ được soạn lời giải thích — `explanationDraftSource` luôn là `"template"` trong bản offline này.
- **Hard block** khi: URL trúng blacklist, QR blacklist, deepfake ≥ 0.9, hoặc ≥ 2 lý do **enforceable** (không tính pattern đang shadow).
- **Một lý do mềm** → cảnh báo (`flag` / `warn`).
- **Allowlist**: tên trong `TRUSTED_CONTACTS` mà **không** có tín hiệu hard-block → bỏ qua script mềm (cho phép). Tên tin cậy bị spoof + hard signal vẫn **block**.
- Giải thích cho ông bà (`elderExplanation`) + `familyAlert` = **tiếng Việt đời thường** (không jargon / hash / version). Version+hash chỉ in trong **AUDIT SUMMARY**.
- Có **audit log** append-only (`blacklistVersion` + optional hash) và **human override** để người thân đảo quyết định.
- **Global shadow mode** (`mode: "shadow"`): mọi would-block → `flag` + reason/note `shadow: would_block` (vẫn deterministic).

## Per-pattern shadow calendar (S3/S4 · Sid-S3 · Lee-S2)

Mỗi entry trong `SCRIPT_PATTERNS` mang:

| Field | Meaning |
|-------|---------|
| `introducedAt` | ISO `YYYY-MM-DD` khi pattern vào list |
| `shadowUntil` | `introducedAt + SHADOW_DAYS` (`SHADOW_DAYS = 7`) |

- Pattern **in shadow** while `now < shadowUntil` (`isPatternInShadow(shadowUntil)`).
- Shadow hit → reason label `shadow: pattern <id> <7d`; **FLAG only, never BLOCK** từ những pattern đó.
- Hard signals (URL blacklist, `qrBlacklisted`, deepfake ≥ 0.9) vẫn **BLOCK**.
- Mature patterns (`shadowUntil` in the past) vẫn count toward soft→block threshold — demo m1/m2/m3 giữ block.
- Demo header in pattern ids đang trong cửa sổ 7 ngày.

## Honesty — deepfake & on-device

- Demo opener bắt buộc: `deepfakeScore=fixture` + `HONESTY: deepfakeScore = fixture meta (not a live detector)`.
- `deepfakeScore` trong fixture / `msg.meta` là **upstream detector stub**, không phải live ML. Engine gắn `detector: "fixture"` trên verdict + audit; machine reason ghi `[detector: fixture]`. Demo in `deepfakeScore=fixture (upstream detector stub)` trên m2.
- Elder / familyAlert copy luôn tiếng Việt thường, **không** lộ jargon / “Deepfake score 97%” / “fixture”.
- On-device / PII: rules chạy local trên tin nhắn; không gửi nội dung lên cloud trong bản offline này.

## False-positive SLA + shadow policy

| Target | Policy |
|--------|--------|
| Trusted-contact false-block | **<1%** mục tiêu; soft script hits trên allowlist → **allow**; hard spoof vẫn block |
| Human path | Mọi flag/block có **human override** (con/cháu đảo → allow); demo prints `FP SLA: trusted-contact false-block target <1%; override = human decide` |
| New pattern ids | **Shadow / flag 7 ngày** (`shadowUntil`) trước khi promote sang enforce hard-block |

## Versioned blacklist

- `BLACKLIST_VERSION` (semver, hiện `0.1.0`) export từ `blacklist.ts`.
- Mọi `AuditEntry` + `ShieldVerdict` mang `blacklistVersion` (+ `blacklistHash` ngắn của domain list).
- Demo **AUDIT SUMMARY** in `blacklistVersion` + `hash` + `deepfake=fixture` (Lee-S1). Không đưa hash/version vào familyAlert / elderExplanation (TA-S3).

## Contract

Schema: `packages/contracts/schemas/shield-verdict.v0.1.schema.json` (required fields khớp `ShieldVerdict`).

## Chạy demo offline

```bash
npm run demo -w @bizmate/shield
# hoặc
npm run demo:shield
npm run test -w @bizmate/shield
```

Demo in **STEP 1..N**, rồi **RESET REPLAY** (clear auditLog + re-judge cùng fixture) để 90s demo restart offline.

## Script demo ~30s backup slot

1. Opener: `30s backup · ba/mẹ mua Shopee` + `backup 30s · family B2C` + honesty + Sea wedge (no seller KPI).
2. STEP qua inbox — 🚫 blacklist/deepfake-fixture/QR, ✅ tin con, ⚠️ CSKH/OTP (shadow flag).
3. After m3 QR block: Tip buyer VN.
4. AUDIT SUMMARY (version + hash + deepfake=fixture).
5. HUMAN OVERRIDE + FP SLA line.
6. RESET REPLAY.

## Khoảng trống còn lại

- Chưa nối kênh thật (SMS gateway / Zalo OA / QR scanner on-device).
- Deepfake = fixture meta stub — chưa có model phát hiện giọng.
- Blacklist thủ công; chưa sync threat-intel (có semver + hash để audit).
- Chưa có UI / push notification thật tới người thân.
- Chưa persistence audit (in-memory module log).
- Chưa cover đa ngôn ngữ ngoài tiếng Việt.
