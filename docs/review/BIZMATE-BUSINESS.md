# BizMate — BUSINESS-READY (BR1–BR3)

> Adv · BizMate · 2026-09-26 Asia/Saigon  
> Source: Sid-B1 / PITCH / AUDIT offline seed · **no invented ARR/ARPU**

Shared payment contract: `@bizmate/billing` (`packages/billing`).

---

## BR1 — Business model

### Who pays (D-Day)

| Field | Answer |
|-------|--------|
| **Buyer** | **Sea internal tooling** (seller-finance / ops budget) — Sid-B1 |
| **Signer** | Sea engineering / seller-finance ops owner |
| **What they buy** | Creation-time Mate + deterministic runtime + HITL registry gates |
| **Not D-Day** | SME / Bà Lan freemium→Pro = **roadmap only** (no “Sea hoặc SME” on stage) |

### Value prop

Chủ sạp / Sea seller-ops biết **vượt 1 tỷ trước khi bị phạt** — AI đề xuất → code kiểm → người quyết. Money path **zero-LLM**. Codex = creation-time only; runtime deterministic.

### Unit economics sketch (**demo-derived only**)

From last offline seed / `apps/runtime/.audit/events.jsonl` + pitch table (label: **demo-derived** — not field baseline, not ARR):

| Signal | Demo-derived value | Use in economics sketch |
|--------|--------------------|-------------------------|
| `approve_fail` | **1** per deny path (before Duyệt) | Trust gate works — unpaid “false persist” avoided |
| `approve_ok` | **1** per human approve | HITL cost = human minute, not model $ on money |
| `persist_ok` | **1** per ledger write | Successful unit of work for pilot KPI |
| Blast-radius | unpin `wf-accounting-vendor-day@0.1.0` → N from AUDIT | Rollback cost = unpin, not redeploy LLM |
| Hot-path | ms/step compute+persist on AUDIT SUMMARY | Latency budget for Sea pilot seats |

**Pilot sketch (week-2, from pitch card — not revenue claim):** 10 Sea pilot seats · metric candidates = time-to-ledger + `approve_fail→approve_ok` from AUDIT · exit = keep Sea-internal / kill / later SME roadmap.

**Explicit non-claims:** no live ARR, ARPU, CAC, conversion %, or WTP survey numbers.

---

## BR2 — Subscription / pricing

Documented tiers (fixtures in `@bizmate/billing` → `listPlans("bizmate")`) **and** reflected on web pricing panel:

| Plan id | Name | Price display (fixture) | Notes |
|---------|------|-------------------------|--------|
| `bizmate-sea-seat` | Sea seat · pilot | 0 ₫ / seat (cost-center nội bộ) | D-Day primary |
| `bizmate-codex-partnership` | Codex partnership | partnership sketch (fixture) | Mate creation-time · runtime deterministic |
| `bizmate-sme-pro` | SME Pro | 199.000 ₫ / tháng (fixture) | **roadmapOnly** — after week-2 |

UI: `apps/web` — panel **Giá / subscription** lists these tiers with honesty badges.

---

## BR3 — Payment path

Wire: `apps/web` imports `@bizmate/billing`.

| Path | Mode | When |
|------|------|------|
| Sea internal | `offline_stub` + `stubCharge` / `createCheckout(..., offline_stub)` | Cost-center `SEA-INTERNAL-TOOLING` — **labeled STUB** |
| SME roadmap demo | `stripe_test` `createCheckout` | Returns `cs_test_*` + fake Checkout URL — **labeled SANDBOX · not live** |

Default CTA preference on web: show **both** — Sea cost-center stub (primary payer) + Stripe test for SME roadmap tier. Honesty banner from `honestyBanner(mode)` always visible above CTAs.

---

## How other Advs import

```ts
import {
  honestyBanner,
  listPlans,
  createCheckout,
  stubCharge,
} from "@bizmate/billing";

// 1) npm run build -w @bizmate/billing
// 2) dependency: "@bizmate/billing": "0.1.0"
const plans = listPlans("bookkeeper"); // or shield | floodops
const banner = honestyBanner("stripe_test");
const session = createCheckout({
  appId: "bookkeeper",
  planId: plans[0].id,
  mode: "stripe_test",
});
```

See `packages/billing/README.md`.

---

## Prove

- `npm run build -w @bizmate/billing && npm run test -w @bizmate/billing`
- `npm run build -w @bizmate/web`
- `npm run demo:offline` → EXIT 0
