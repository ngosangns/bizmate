# FloodOps — điều phối đơn ngày ngập / flood-day last-mile replan

**Domain-fit stack (STACK-REBUILD):** Next.js App Router **ops dashboard** + Leaflet HCMC ward map + event-driven **Node worker** + deterministic TS engine. Order state = **JSON** (`data/orders.json`, sandbox) + immutable audit **JSONL** (`.audit/wave.jsonl`).

> **Không** gọi live Shopee Express / SPX API. Fixture `hcm-flood-day.json` là analogy last-mile (đơn COD + phường ngập) — cùng pattern ops SPX quan tâm, nhưng chạy 100% offline / sandbox.

## Stack

| Layer | Tech | Role |
|-------|------|------|
| Engine | Pure TS (`src/engine.ts`) | `replanOrder` / `runWave` — zero-LLM hot path |
| Audit | JSONL (`src/audit.ts`) | `persistWaveActions` · `approveRefund` · `--replay` |
| Worker | Node + tsx (`src/worker.ts`) | Consume fixture events → replan → write state + audit |
| State | JSON file (`data/orders.json`) | Sandbox order/wave snapshot for dashboard |
| Dashboard | Next.js App Router (`web/`) | Map (Leaflet) · orders table · billing seats |
| Billing | `@bizmate/billing` | `listPlans("floodops")` · `createCheckout(offline_stub)` |

## Buyer nội bộ (GTM persona)

| Role | Why |
|------|-----|
| **Last-mile ops lead / control tower** (Sea/SPX-style nội bộ) | Người chịu trách nhiệm ca mưa: dời giao, chuyển tuyến, duyệt hoàn COD |

**Tuần-2 metrics (fixture estimate, không phải KPI live):**
- **COD at-risk avoided** = Σ COD của đơn trên ward `flooded` nếu không replan (deterministic từ fixture).
- **% human queue** = số action `requiresHuman` / tổng action trong wave.

Ai trả tiền? Internal cost-avoidance (COD loss + phí 2 chiều) — champion = ops lead, không phải seller app store.

## Pricing / subscription (BR2)

| Plan id | Name | Price (fixture) | Notes |
|---------|------|-----------------|--------|
| `floodops-site` | Per-site ops | 1.500.000 ₫ / site / tháng (fixture · internal) | D-Day primary — Sea / Express-analog **internal budget** |
| `floodops-wave` | Per-wave ops seat | 500.000 ₫ / wave (fixture · internal) | Optional wave-scoped seat |

Source of truth: `@bizmate/billing` → `listPlans("floodops")`. Demo section ④ + dashboard billing panel print tiers + honesty.

**Payment (BR3):** primary = `createCheckout({ appId:"floodops", planId:"floodops-site", mode:"offline_stub" })` / `stubCharge`. Optional secondary = `stripe_test`. **COD at-risk ≠ product payment.** No live SPX pay claim. See `docs/review/FLOODOPS-BUSINESS.md`.

## COD / SLA policy

| COD (VND) | Clear wards? | Action | Human? |
|-----------|--------------|--------|--------|
| Ward `clear` | — | `noop` | no |
| `<= autoRescheduleMaxCodVnd` | yes | `reschedule` | **yes if SLA ≤2h** |
| `auto < COD < refund` | yes | `reroute_clear_ward` | **yes if SLA ≤2h** |
| `>= refundRequiresHumanAboveVnd` | any | `propose_refund` | **yes (never auto)** |
| flooded, no clear / courier cancel blocking reschedule | — | `hold` | **yes if SLA ≤2h** |

Default fixture: auto ≤ **500_000**, refund ≥ **1_000_000**.

**Lee rule:** mọi đơn trên ward flooded với `slaHoursLeft <= 2` → `requiresHuman: true` + `status: awaiting_human` (kể cả reschedule/hold/reroute).

## Run

```bash
# from monorepo root
npm run demo:floodops                 # CLI story §①–④ · EXIT 0
npm run demo:floodops -- --reset      # xóa audit JSONL
npm run demo:floodops -- --replay     # đọc Duyệt ORD-1003 từ JSONL
npm test -w @bizmate/floodops         # vitest engine/audit/billing
npm run worker -w @bizmate/floodops   # one wave → data/orders.json + audit
npm run dev -w @bizmate/floodops      # Next ops dashboard :3011
```

Demo story (90s): **honesty/schema → ① alerts → ② actions (HUMAN+COD) → ②b Duyệt/replay + phí 2 chiều → ②c Shop An Đông → ③ audit → ④ pricing/billing**.

Dashboard: honesty banners (sandbox/stub · COD≠invoice) · Leaflet flooded/clear wards · orders + HUMAN badges · billing seats panel.

## Shopee Express relevance (analogy only)

Sea last-mile ops care about rain/flood disruption, COD risk, and courier drop-offs. FloodOps shows the **same decision shape** (auto small moves, human on money) without claiming a live SPX integration.

## Layout

```
apps/floodops/
  fixtures/hcm-flood-day.json
  fixtures/policy-v2-candidate.json
  data/orders.json           # runtime state (gitignored · sandbox)
  .audit/wave.jsonl          # append-only audit
  src/engine.ts              # replanOrder, runWave, …
  src/audit.ts               # persistWaveActions, approveRefund
  src/state.ts               # JSON wave state read/write
  src/worker.ts              # event-driven Node worker
  src/demo.ts                # offline CLI story
  src/__tests__/
  web/                       # Next.js App Router ops dashboard
    app/page.tsx             # map + orders + billing
    app/api/state|billing
    components/FloodMap.tsx  # Leaflet
  README.md
```

## Post-hackathon roadmap (not built)

| Item | Intent | Status |
|------|--------|--------|
| **Live flood feed** | Ingest ward flood alerts behind `FloodEvent` | Roadmap |
| **Hub capacity** | Cap auto-reschedule/reroute by hub capacity | Roadmap |
| **Multi-wave throttle** | Stagger auto actions across waves | Roadmap |
| **SQLite option** | Swap `data/orders.json` for better-sqlite3 | Roadmap (JSON chosen for D-Day) |

Still **no live SPX / Shopee Express API** in this repo.
