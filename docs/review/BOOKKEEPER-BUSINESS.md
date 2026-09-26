# BOOKKEEPER-BUSINESS — BR1–BR3

> Adv · Bookkeeper · 2026-09-26 Asia/Saigon · Source: BUSINESS-READY.md + STACK-REBUILD  
> Consumes shared `@bizmate/billing` (BizMate scaffold). Demo-derived / fixture only — **no invented live ARR / ARPU**.

## Stack (STACK-REBUILD)

**Next.js App Router + Route Handlers / Server Actions + better-sqlite3** (not tRPC, not Prisma).  
Voice→ledger = regex stub labeled offline. HITL Duyệt/Từ chối = server actions over SQLite ledger.

## BR1 — Business model

| | |
|--|--|
| **Who pays** | **Tiểu thương** — persona **Bà Lan** (sạp vải chợ An Đông). Freemium → **Pro** near / crossing **1B** doanh thu/năm. **Không** phải cơ quan thuế (tax authority ≠ buyer). |
| **Value prop** | Voice/sổ (regex stub offline) → đề xuất ghi sổ + HITL Duyệt → SQLite ledger YTD + **cảnh báo ngưỡng 1B** (rule engine) + **citations** (NĐ/Luật fixture). Moment “vượt 1B” = unlock Pro kê khai. |
| **Unit economics (DEMO-DERIVED only)** | Seed `vendor-an-dong.json`: YTD 980tr → **3 Duyệt** (u1, u2, u3) + 1 no-sale no-op → **1 lần crossedThreshold** (u3) → soft paywall Pro. Seed counts only — **not** ARR/ARPU live. |
| **Distribution (week-2, ONE channel)** | **Nhóm tiểu thương chợ An Đông** — trust láng giềng, CAC thấp, khớp persona. Không pilot đại lý thuế / Shopee Seller Academy trong week-2. |

Pitch: *Bà Lan nói doanh thu → sổ có Duyệt + báo khi gần 1B; Pro giúp kê khai khi cần — không phải cổng thuế.*

## BR2 — Subscription / pricing

| Tier | `planId` (`@bizmate/billing`) | Giá (hypothesis, labeled) | Included |
|------|-------------------------------|---------------------------|----------|
| **Free** | `bookkeeper-free` | **0₫/tháng** (fixture) | Nhật ký bán, YTD, cảnh báo 1B, citations |
| **Pro kê khai** | `bookkeeper-pro` | **99.000₫/tháng** *(fixture · hypothesis — chưa đo ARPU)* | Free + kê khai / e-invoice assist (fixture) |

Reflected in: `fixtures/pro-ke-khai-upsell.json`, Next UI Free/Pro card, README tiers, `listPlans("bookkeeper")`.

## BR3 — Payment path

- Package: **`@bizmate/billing`** — `honestyBanner` · `createCheckout` · `stubCharge` · `listPlans`
- Modes: `offline_stub` \| `stripe_test` \| `vn_sandbox` — **never live**
- CLI: on `crossedThreshold` → `stubCharge` + `createCheckout({ mode: "stripe_test" })`; print honesty + session/charge (labeled)
- UI: **“Mở Pro (sandbox)”** server action → honesty + stub/stripe_test session
- **NEVER** claim live billing / live tax portal

## Prove

```bash
npm run build -w @bizmate/contracts
npm run build -w @bizmate/billing
npm test -w @bizmate/bookkeeper
npm run demo:bookkeeper   # EXIT 0 + honesty + billing path + SQLite
# optional: npm run build -w @bizmate/bookkeeper
```

See also: `docs/review/BOOKKEEPER-STACK-PROVE.md`.
