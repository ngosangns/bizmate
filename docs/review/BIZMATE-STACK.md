# BizMate — STACK-REBUILD pick

> Adv · BizMate · 2026-09-26 Asia/Saigon · P0 STACK-REBUILD  
> Baseline tip: `fd56e9a` · Prove: `docs/review/BIZMATE-STACK-PROVE.md`

## Stack chosen: **Vite + TypeScript monorepo** (not Next.js)

| Layer | Choice | Why |
|-------|--------|-----|
| Web UI | **Vite 5** (`apps/web`) | Already production-proven for story mode + billing panel; SPA is enough for offline demo theater |
| Runtime | Deterministic **Node** (`apps/runtime`) | Money path zero-LLM; audit JSONL; who-pays + cost-center on `demo:offline` |
| Agent CO | `mate` / `judge` / `em` CLIs | Evolve Mate CLI; EM money HITL; Judge offline heuristics labeled |
| Shared | `packages/{contracts,billing,core}` | Contracts schema, Sea seat fixtures, money helpers |

### Why **not** Next.js for D-Day

1. **Lower migrate risk** — story UI + BR2/BR3 billing panel already work on Vite; a Next App Router move would burn D-Day calendar for zero domain win.
2. **Current story mode works** — persona / transcript / HITL approve / offline run are client-side fixtures; no SSR/RSC requirement.
3. **Billing panel works** — `@bizmate/billing` already wired into Vite app (`listPlans`, `stubCharge`, Stripe TEST honesty banners).
4. **Runtime stays Node** — Next would not replace the deterministic engine; splitting web into Next while runtime stays CLI adds surface without clearing honesty stubs.

Bookkeeper / FloodOps may still pick Next for *their* domains; BizMate keeps Vite.

## Architecture (prose diagram)

```
┌─ packages/contracts ─ schemas Workflow / EmTask / Verdict
┌─ packages/core ────── money · mode · propose→verify→decide
┌─ packages/billing ─── listPlans · stubCharge · honestyBanner (Sea seat D-Day)
│
├─ apps/mate ──── CLI generate / evolve → .registry/*.json
├─ apps/judge ─── score workflows (offline heuristics labeled)
├─ apps/em ────── board + policy: money/accounting → HITL (no auto-done)
├─ apps/runtime ─ executeWorkflow · audit JSONL · demo:offline (who-pays)
└─ apps/web ───── Vite SPA: story UI + pricing panel + stack footer
```

Flow: **Mate proposes** → **Judge scores** → **Human approves (HITL)** → **Runtime persists** (deterministic) → audit JSONL. EM refuses auto-done on money tasks. Web mirrors the offline seed for stage; footer labels `stack: Vite + Node runtime`.

## Keep list (evolve, not rip-and-replace)

- Monorepo workspaces: `apps/{mate,judge,em,runtime,web}` + `packages/{contracts,billing,core}`
- Root `package.json` `build` already includes `@bizmate/billing` (before core/mate/…)
- `npm run mate:generate` / `mate:evolve` → `apps/mate/dist/cli.js`
- `npm run demo:offline` → who-pays Sea internal + cost-center stub + EM money HITL proof line
- Audit JSONL under `apps/runtime/.audit/` (gitignored)
- Honesty stubs labeled (Stripe TEST / offline_stub / SME roadmapOnly)
- Web stays Vite — **no** Next migration

## Out of scope (this Adv)

- Do **not** rewrite Bookkeeper / Shield / FloodOps
- Do **not** claim live payment / tax authority / frontier SLM
- SME Pro = roadmap fixture only; D-Day payer = Sea internal tooling

## Migrate notes

| Item | Action |
|------|--------|
| Web → Next | **Skipped** (documented above) |
| Billing in root build | Already present — verify on prove |
| Mate CLI | Confirmed `generate` / `evolve` EXIT 0 |
| Web polish | Footer `stack: Vite + Node runtime` for stack-fit clarity |
| Docs | This file + `BIZMATE-STACK-PROVE.md` + BizMate row in `STACK-REBUILD.md` |

## Status

**Done (Adv claim)** — Orchestrator verifies via prove packet.
