# Shield — Lá chắn tin nhắn lừa đảo cho người cao tuổi

> **Stage posture:** `30s backup · ba/mẹ mua Shopee` / `backup 30s · family B2C`. Shield is a **30s backup** demo (not the hero; not seller KPI). Lead with FloodOps / Bookkeeper / BizMate unless GTM is crystal-clear.

## Stack choice — PWA + Service Worker (+ Vite), NOT Expo

| Option | Why / why not |
|--------|----------------|
| **PWA + SW + Vite (chosen)** | Family installs to home screen; local notifications via Service Worker + Notification API; **monorepo proves `demo` + `test` EXIT 0 in Node/CI without Expo Go / iOS-Android simulator**. Rule engine stays pure TS shared by CLI demo and PWA UI. |
| React Native / Expo | Better native push ceramics later — but needs Expo Go / simulator for prove path; breaks Offline/CI EXIT 0 gate for this hackathon track. |

Prove packet: [`docs/review/SHIELD-STACK.md`](../../docs/review/SHIELD-STACK.md) · matrix: [`docs/review/STACK-REBUILD.md`](../../docs/review/STACK-REBUILD.md).

### Layout

```
apps/shield/
  src/engine.ts blacklist.ts   # shared rule core (CLI + PWA)
  src/detector-stub.ts         # optional on-device ML stub — always labeled fixture
  src/notify.ts                # local SW / Notification payload builders
  src/demo.ts                  # offline CLI scam-inbox + billing (judges prove path)
  web/                         # Vite PWA (elder/family UI + SW)
    public/sw.js               # local notification stub (NOT remote push)
    public/manifest.webmanifest
  fixtures/                    # scam-inbox + family-plans
```

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

- **Not Mate codegen:** Shield is a **rule engine + fixture score** (blacklist / patterns / meta stubs). Codex leverage = contracts + audit schema — **do not claim** Mate generated Shield verdicts or policy in this demo.

- Demo opener bắt buộc (above-the-fold): `detector: fixture` + `deepfakeScore=fixture` + `HONESTY: deepfakeScore = fixture meta (not a live detector)`.
- `deepfakeScore` trong fixture / `msg.meta` là **upstream detector stub**, không phải live ML. Engine gắn `detector: "fixture"` trên verdict + audit; machine reason ghi `[detector: fixture]`. Demo in `deepfakeScore=fixture (upstream detector stub)` trên m2.
- Optional module `src/detector-stub.ts` = same honesty contract for PWA UI.
- Elder / familyAlert copy luôn tiếng Việt thường, **không** lộ jargon / “Deepfake score 97%” / “fixture”.
- On-device / PII: rules chạy local trên tin nhắn; không gửi nội dung lên cloud trong bản offline này.
- **Local notifications** = Service Worker + Notification API stub (`honesty: local-sw-stub`) — **not** a remote push gateway / FCM.

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

## Chạy demo offline (CLI — judges / Orchestrator prove path)

```bash
npm run demo -w @bizmate/shield
# hoặc
npm run demo:shield
npm run test -w @bizmate/shield

# Kyle-S2 — single pass (skip RESET REPLAY)
npm run demo -w @bizmate/shield -- --once
```

- **Default:** in **STEP 1..N** với live counts, rồi **RESET REPLAY** (clear auditLog + re-judge cùng fixture).
- **`--once`:** một inbox pass + AUDIT + override; **bỏ** RESET REPLAY (tránh scroll 2×N trên pitch 30s).
- **Kyle-S1:** mỗi STEP = icon + pill + 💬 một câu elder; machine `reasons[]` chỉ trong **AUDIT SUMMARY**.
- **Kyle-S3:** pill `STEP k/N · block|flag|allow` + `live allow=… flag=… block=…` chạy theo từng tin.

## Chạy PWA (family UI + local notifications)

```bash
# Dev (Vite on :5174)
npm run dev -w @bizmate/shield

# Production build (tsc rule core + vite PWA)
npm run build -w @bizmate/shield
npm run preview -w @bizmate/shield
```

PWA UI: scam-inbox demo, elder VN copy, human override, Family Care sandbox checkout, **Bật thông báo local** → SW shows notification on BLOCK/FLAG (labeled `local-sw-stub`).

Install: open preview URL → browser “Add to Home Screen” / Install app (manifest present).

## Script demo ~30s backup slot

1. Opener: `30s backup · ba/mẹ mua Shopee` + `backup 30s · family B2C` + `detector: fixture` + honesty + Sea wedge + ENGINE not-Mate-codegen (no seller KPI).
2. STEP qua inbox — pill live counts; 💬 1 câu elder; 🚫 blacklist/deepfake-fixture/QR, ✅ tin con, ⚠️ CSKH/OTP (shadow flag).
3. After m3 QR block: Tip buyer VN.
4. AUDIT SUMMARY (version + hash + deepfake=fixture + machine reasons[]).
5. HUMAN OVERRIDE + FP SLA line.
6. RESET REPLAY (skip with `--once`).

## Business / pricing / payment honesty (BR1–BR3)

Full write-up: [`docs/review/SHIELD-BUSINESS.md`](../../docs/review/SHIELD-BUSINESS.md).

| Item | Fact |
|------|------|
| **Buyer** | Family B2C — child pays for elders. Sea = **distribution only**, not payer. |
| **Plans** | `listPlans("shield")` → Free (1 elder) / Family Care **99k₫/mo** (2 elders + SMS) / Family Plus **199k₫/mo** (4 elders + priority). Fixture only. |
| **Fixture** | `fixtures/family-plans.json` mirrors billing catalog. |
| **Payment** | `@bizmate/billing` `createCheckout` (`stripe_test` or `offline_stub`). **Always** print `honestyBanner`. Never live payment. |
| **Unit economics** | Demo-derived fixture prices + `demoSubscribeCount=1` only — **no invented ARR/ARPU**. |
| **Risk engine** | Unchanged — rule-based. Billing is packaging only. |

```bash
npm run demo:shield
npm run demo -w @bizmate/shield -- --subscribe --once
# optional offline stub mode:
npm run demo -w @bizmate/shield -- --subscribe --once --offline-stub
```

Demo ends with a **BILLING** section (pricing table + sandbox checkout CTA + honesty banner).

## Khoảng trống còn lại

- Chưa nối kênh thật (SMS gateway / Zalo OA / QR scanner on-device).
- Deepfake = fixture meta stub — chưa có model phát hiện giọng.
- Blacklist thủ công; chưa sync threat-intel (có semver + hash để audit).
- Local SW notifications only — chưa remote push / FCM.
- Chưa persistence audit (in-memory module log).
- Chưa cover đa ngôn ngữ ngoài tiếng Việt.
