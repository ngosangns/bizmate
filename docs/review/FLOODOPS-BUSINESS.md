# FloodOps — BUSINESS-READY (BR1–BR3)

> Adv · FloodOps · 2026-09-26 Asia/Saigon  
> Source: BUSINESS-READY.md + Sid/Lee FloodOps domain · **no invented ARR/ARPU** · **no live SPX pay claim**

Shared payment contract: `@bizmate/billing` (`packages/billing`).

---

## BR1 — Business model

### Who pays (D-Day)

| Field | Answer |
|-------|--------|
| **Buyer** | **Ops org / Express-analog internal budget** (champion org) — Sea last-mile / SPX-style **control tower** cost center |
| **Champion** | Night-shift ops lead → escalate hoàn → supervisor Duyệt hoàn |
| **What they buy** | Flood-day replan seat (per-site / per-wave): auto small moves + human money gate + audit JSONL |
| **Not the payer** | Seller app store · shop An Đông · buyer end-customer · **not** a live SPX commercial SKU |

### Value prop

Ca mưa: wards ngập → COD **at-risk** nếu không replan. FloodOps = rule engine offline (zero-LLM hot path) dời giao / chuyển tuyến / giữ / escalate hoàn → **COD at-risk avoided** + giảm phí 2 chiều lãng phí khi hoàn sai.

### Unit economics sketch (**demo-derived only** — fixture `hcm-flood-day.json`)

| Signal | Demo-derived value | Use in economics sketch |
|--------|--------------------|-------------------------|
| **COD at-risk** (no replan) | **3.850.000₫** = Σ COD đơn trên ward `flooded` (ORD-1001+1003+1005+1006+1007) | Value prop numerator — deterministic fixture metric |
| **Phí 2 chiều** (ORD-1003 hoàn) | **75.000₫** = `25_000 + 2% × 2.500.000` (`estimateRoundTripFeeVnd`) | Cost of wrong/late refund path — why human gate |
| Wave shape | 7 orders · 2 flooded wards · 1 `propose_refund` human | Ops seat capacity sketch (not ARR) |

**Explicit:**

- **COD at-risk ≠ product payment.** It is an ops loss/avoidance metric from the fixture, **not** what FloodOps charges the buyer.
- **No live SPX pay claim.** Analogy last-mile only; payment path = Sea internal stub / sandbox.
- **No invented ARR / ARPU / CAC / conversion %.**

Pitch one-liner: *Ops lead ca mưa — replan COD ward ngập offline; Sea budget trả seat, không claim SPX live pay.*

---

## BR2 — Subscription / pricing

Tiers (fixtures in `@bizmate/billing` → `listPlans("floodops")`) **and** printed in demo + README:

| Plan id | Name | Price display (fixture) | Notes |
|---------|------|-------------------------|--------|
| `floodops-site` | Per-site ops | 1.500.000 ₫ / site / tháng (fixture · internal) | D-Day primary — internal budget |
| `floodops-wave` | Per-wave ops seat | 500.000 ₫ / wave (fixture · internal) | Optional wave-scoped seat |

Honesty on each plan: ops org internal budget stub — **không claim live SPX pay**.

Reflected in:

- `apps/floodops/src/demo.ts` — prints `listPlans("floodops")`
- `apps/floodops/README.md` — Pricing section
- `@bizmate/billing` `plans.ts`

**Không claim** live subscribers / WTP survey.

---

## BR3 — Payment path

Wire: `apps/floodops` depends on `@bizmate/billing` `0.1.0`.

| Path | Mode | When |
|------|------|------|
| **Sea / Express-analog internal** (primary) | `offline_stub` via `createCheckout({ appId:"floodops", planId:"floodops-site", mode:"offline_stub" })` or `stubCharge` | Cost-center chargeback — **labeled STUB** |
| Optional secondary | `stripe_test` `createCheckout` | Fake Checkout URL — **labeled SANDBOX · not live** (SaaS sketch only) |

Demo prints `honestyBanner` + checkout/charge result. **COD at-risk is never treated as a charge amount for the product.**

Honesty example:

```
⚠️ STUB · Offline stub / cost-center nội bộ — không gọi cổng thanh toán / offline stub only
```

---

## Prove

```bash
npm run build -w @bizmate/billing
npm test -w @bizmate/floodops
npm run demo:floodops   # EXIT 0 + listPlans + honesty + offline_stub
```
