# Shield — Lá chắn tin nhắn lừa đảo cho người cao tuổi

> **Stage posture:** Shield is a **30s backup** demo (not the hero). Lead with FloodOps / Bookkeeper / BizMate unless GTM is crystal-clear.

## Who pays (ONE payer)

**Primary payer = family (B2C).** Con/cháu trả subscription bảo vệ ba/mẹ — child pays for parents’ shield.

Sea T&S / Shopee buyer protection is a **distribution partner** only (surface for fake QR refund / phishing adjacent to buyer trust). **Not** the paying customer. Do not pitch three payers.

## Vấn đề

Người lớn tuổi ở Việt Nam thường nhận SMS / Zalo / QR giả mạo ngân hàng, công an, hoặc người thân xin tiền. Họ khó phân biệt link độc, OTP lừa, và giọng deepfake. Shield chặn / cảnh báo **trước khi** họ bấm link hoặc chuyển tiền, rồi báo cho người thân trong gia đình (payer).

Offline demo one-liner: *Buyer-trust adjacent — fake QR hoàn tiền / phishing; family pays; no live SPX claim.*

## Mô hình tin cậy (trust model)

- **Phán quyết rủi ro = luật + blacklist thôi**, không dùng LLM để quyết block/allow.
- LLM (nếu có sau này) chỉ được soạn lời giải thích — `explanationDraftSource` luôn là `"template"` trong bản offline này.
- **Hard block** khi: URL trúng blacklist, QR blacklist, deepfake ≥ 0.9, hoặc ≥ 2 lý do mềm.
- **Một lý do mềm** → cảnh báo (`flag` / `warn`).
- **Allowlist**: tên trong `TRUSTED_CONTACTS` mà **không** có tín hiệu hard-block → bỏ qua script mềm (cho phép). Tên tin cậy bị spoof + hard signal vẫn **block**.
- Giải thích cho ông bà bằng tiếng Việt giản dị (không jargon). Family alert giữ nhãn kỹ thuật cho người chăm sóc.
- Có **audit log** append-only (`blacklistVersion` + optional hash) và **human override** để người thân đảo quyết định.
- **Shadow mode** (`mode: "shadow"`): mọi would-block → `flag` + reason/note `shadow: would_block` (vẫn deterministic). Dùng để A/B trước khi enforce.

## Honesty — deepfake & on-device

- `deepfakeScore` trong fixture / `msg.meta` là **upstream detector stub**, không phải live ML. Engine gắn `detector: "fixture"` trên verdict + audit; machine reason ghi `[detector: fixture]`. Demo in `deepfakeScore=fixture (upstream detector stub)`.
- Elder copy luôn tiếng Việt thường, **không** lộ jargon / “Deepfake score 97%” / “fixture”.
- On-device / PII: rules chạy local trên tin nhắn; không gửi nội dung lên cloud trong bản offline này.

## False-positive SLA + shadow policy

| Target | Policy |
|--------|--------|
| Trusted-contact false-block | **<1%** mục tiêu; soft script hits trên allowlist → **allow**; hard spoof vẫn block |
| Human path | Mọi flag/block có **human override** (con/cháu đảo → allow) |
| New pattern ids | **Shadow / flag 7 ngày** trước khi promote sang enforce hard-block (xem `JudgeOptions.mode`; comment trong engine) |

## Versioned blacklist

- `BLACKLIST_VERSION` (semver, hiện `0.1.0`) export từ `blacklist.ts`.
- Mọi `AuditEntry` + `ShieldVerdict` mang `blacklistVersion` (+ `blacklistHash` ngắn của domain list).
- Demo AUDIT SUMMARY in version + hash.

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

## Script demo 90 giây (backup slot)

1. Header: family payer + buyer-trust adjacent (no live SPX).
2. STEP qua inbox — chỉ 🚫 blacklist/deepfake-fixture/QR, ✅ tin con, ⚠️ CSKH, OTP.
3. AUDIT SUMMARY (version + counts).
4. HUMAN OVERRIDE: false positive → allow.
5. RESET REPLAY — clear + chạy lại inbox.
6. Nhấn mạnh: ông bà thấy VN plain; deepfake = fixture stub.

## Khoảng trống còn lại

- Chưa nối kênh thật (SMS gateway / Zalo OA / QR scanner on-device).
- Deepfake = fixture meta stub — chưa có model phát hiện giọng.
- Blacklist thủ công; chưa sync threat-intel (có semver + hash để audit).
- Chưa có UI / push notification thật tới người thân.
- Chưa persistence audit (in-memory module log).
- Chưa cover đa ngôn ngữ ngoài tiếng Việt.
- 7-day shadow cho pattern mới = **policy documented**; runtime chưa calendar-gate từng pattern id (chỉ có `mode: "shadow"` toàn cục).
