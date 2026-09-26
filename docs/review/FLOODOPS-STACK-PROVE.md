# FLOODOPS-STACK-PROVE — STACK-REBUILD

> Adv · FloodOps · 2026-09-26 11:56 Asia  
> Baseline tip: `fd56e9a` · Prove tip: `83c02fd`  
> Orchestrator owns `STACK-REBUILD.md` status matrix — this is the prove packet only.

## Stack chosen (one-liner)

**Next.js App Router ops dashboard + Leaflet HCMC ward map + event-driven Node worker + JSON order state (`data/orders.json`) + immutable audit JSONL** — engine stays pure TS (zero-LLM); billing via `@bizmate/billing` seats (`listPlans` / `createCheckout(offline_stub)`).

Pick note: **JSON** for order state (sandbox-labeled) over SQLite for D-Day pragmatism; SQLite optional on roadmap. Audit remains append-only JSONL.

## Commands + EXIT 0 evidence

```bash
npm test -w @bizmate/floodops          # EXIT 0 · 24 tests
npm run demo:floodops                  # EXIT 0 · §①–④ story
npm run worker -w @bizmate/floodops    # EXIT 0 · writes data/orders.json
npm run build:web -w @bizmate/floodops # EXIT 0 · Next production build
npm run dev -w @bizmate/floodops       # Next dashboard :3011 (manual)
```

Evidence (this run):

| Command | Exit | Notes |
|---------|------|-------|
| `npm test -w @bizmate/floodops` | **0** | 24/24 passed (engine · audit · billing BR2/BR3) |
| `npm run demo:floodops` | **0** | HUMAN+COD · Duyệt hoàn · Shop An Đông · §④ VND seats |
| `npm run worker -w @bizmate/floodops` | **0** | events → runWave → `data/orders.json` + audit append |
| `npm run build:web -w @bizmate/floodops` | **0** | routes: `/`, `/api/state`, `/api/billing` |

## What was kept vs new

### Kept (no regress)

- HUMAN+COD escalate (Lee: SLA≤2h on flooded → human; high COD `propose_refund` always human)
- §④ VND `priceDisplay` from `@bizmate/billing` (`floodops-site` 1.500.000₫ · `floodops-wave` 500.000₫)
- Immutable audit JSONL + `approveRefund` / `--replay`
- Deterministic engine in TS — `src/engine.ts`, `src/audit.ts`
- Fixture `fixtures/hcm-flood-day.json` (+ policy-v2 candidate)
- All vitest cases green; demo CLI EXIT 0
- Honesty: no fake live SPX / payment gateway; stub/sandbox labeled CLI + UI
- SPX relevance = analogy only

### New (STACK-REBUILD)

| Piece | Path |
|-------|------|
| Node worker | `apps/floodops/src/worker.ts` |
| JSON wave state | `apps/floodops/src/state.ts` → `data/orders.json` |
| Next.js dashboard | `apps/floodops/web/` (App Router) |
| Leaflet map | `web/components/FloodMap.tsx` |
| Orders + HUMAN badges | `web/components/OrdersTable.tsx` |
| Billing seats panel | `web/components/BillingPanel.tsx` |
| API | `/api/state`, `/api/billing` |
| Scripts | `worker`, `dev`, `build:web` |

## Architecture

```
apps/floodops/
  src/engine.ts + audit.ts   # pure replan + JSONL
  src/worker.ts              # event → runWave → persist
  src/demo.ts                # judge CLI story
  src/state.ts               # orders.json R/W
  web/                       # Next ops UI + Leaflet
  data/orders.json           # sandbox state (gitignored)
  .audit/wave.jsonl
  fixtures/hcm-flood-day.json
```

## Docs touched

- `apps/floodops/README.md` — stack layout + run commands
- `docs/review/FLOODOPS-BUSINESS.md` — dashboard + worker note; BR1–BR3 honesty kept
- `docs/review/FLOODOPS-STACK-PROVE.md` — this file

**Not edited:** `docs/review/STACK-REBUILD.md` status matrix (Orchestrator-owned).

## Blockers

None for P0 shape. Optional later: better-sqlite3 swap for `data/orders.json`; live flood feed remains roadmap.
