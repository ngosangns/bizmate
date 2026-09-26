# BUSINESS-READY — P0 packaging (post tech/domain)

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User P0**  
> Tech PASS + domain prove **giữ**. Iteration này = **business packaging**, không re-score tech.

## Shared billing (Pstack)

Ưu tiên **một** `packages/billing` dùng chung 4 app:
- Sandbox Stripe test **và/hoặc** VN sandbox pattern
- Offline stub mode với **honesty label** bắt buộc
- Apps consume package — **không** mỗi app một stub lệch API/copy

Owner gợi ý: Adv · BizMate scaffold package; 3 Adv kia wire vào. Parallel OK nếu contract ổn định sớm (`createCheckout` / `stubCharge` + `honestyBanner`).

## Gate

Mỗi app (BizMate · Bookkeeper · Shield · FloodOps) phải ship:

| # | Requirement | Bar |
|---|-------------|-----|
| BR1 | **Business model** | Doc + pitch/UI: who pays (buyer), value prop, unit economics sketch **demo-derived only** (no invented live ARR/ARPU) |
| BR2 | **Subscription / pricing** | Tiers hoặc usage plan documented **và** reflected in product UI/fixtures where relevant |
| BR3 | **Payment path** | Working **sandbox** checkout (Stripe test / VN sandbox pattern) **hoặc** clear **offline stub** labeled stub. Prefer sandbox over fake “live”. Honesty line bắt buộc nếu sandbox/stub |

**Done criteria:** Adv push → Orchestrator verify (demo EXIT 0 + paths exist) → row Done trong bảng dưới. Ping Orchestrator khi xong; **không** ping judge từ Adv.

## Status

| App | Adv | SHA | BR1 | BR2 | BR3 | Overall |
|-----|-----|-----|-----|-----|-----|---------|
| BizMate | Adv · BizMate | 6a43e29 | Done | Done | Done | Done |
| Bookkeeper | Adv · Bookkeeper | _(pending push)_ | Done | Done | Done | Done |
| Shield | Adv · Shield | `becd861` | Done | Done | Done | Adv Done — Orchestrator verify |
| FloodOps | Adv · FloodOps | — | Open | Open | Open | Open |

## Per-app hints (reuse domain GTM, không duplicate fiction)

### BizMate
- Buyer: Sea internal tooling (đã Sid-B1) — SME = roadmap only.
- Pricing: internal seat / Codex partnership sketch; reflect on web or pitch card.
- Payment: Sea budget ≠ card checkout — OK stub “internal chargeback / cost center” **labeled**, hoặc Stripe test nếu muốn show SaaS path for SME roadmap.

### Bookkeeper
- Buyer: tiểu thương / Bà Lan freemium→Pro near 1B (Sid-K2 soft paywall).
- Pricing: Free vs Pro tiers in UI/fixtures.
- Payment: Stripe test **or** VN sandbox stub on Pro unlock; label honesty.

### Shield
- Buyer: family B2C (backup 30s) — Sea = distribution wedge, not payer.
- Pricing: monthly family plan fixture + UI.
- Payment: Stripe test / stub labeled on subscribe CTA.

### FloodOps
- Buyer: ops org / Express-analog internal budget (champion org) — not claim live SPX pay.
- Pricing: per-site / per-wave ops seat sketch.
- Payment: internal stub **or** sandbox; COD at-risk ≠ payment of product.

## Deliverables per Adv

1. `docs/review/<APP>-BUSINESS.md` (or section in existing pitch) covering BR1–BR3.
2. Code/UI/fixtures for pricing + payment path as above.
3. Re-run app demo (EXIT 0) + ping Orchestrator with SHA + before/after.
4. Do **not** invent live metrics; demo-derived / fixture only.

## Prove log

_(Orchestrator fills after each Adv Done.)_

## Adv note — Shield (2026-09-26 Asia/Saigon)

- BR1: `docs/review/SHIELD-BUSINESS.md` (buyer = family B2C; Sea distribution only; unit economics fixture/demo only).
- BR2: `listPlans("shield")` Free / Family Care 99k / Family Plus 199k + `apps/shield/fixtures/family-plans.json` + demo pricing table.
- BR3: demo BILLING section `createCheckout` (`stripe_test` default) + always `honestyBanner`; dep `@bizmate/billing@0.1.0`.
- Consumed shared `packages/billing` (did not rewrite package API). Shield plan tiers filled to match BR2 matrix.
- Prove: `npm run test -w @bizmate/billing` · `npm run test -w @bizmate/shield` · `npm run demo:shield` → EXIT 0.
- SHA: `becd861` (Adv push; Orchestrator verify).
