# BizMate R6 PLAN — CONDITIONAL (TA + Kyle)

> Baseline tip `ea96d04` · port `:5173` · Orchestrator route only. Soft FO (ICT/rejected) **out of scope**. R1–R5 docs untouched.

## Judge map

| Source | Verdict | P0 must-fix |
|--------|---------|-------------|
| Trần Tuấn Anh | CONDITIONAL (TB ~4.0, S1=3) | Split `apps/web/src/main.ts` god-file; shared browser run path (dedupe `runner.ts` vs runtime); vitest HITL (refuse without Duyệt / persist with Duyệt) |
| Kyle Tran | CONDITIONAL (TB 3.83, S2/S3=3) | Split ops-rail/pricing/ledger out of `main.ts`; smoke/vitest approve→Chạy→crossed-1B via run path |
| Sidharth / Lee | PASS | Soft backlog only (already aligned with split/dedupe) |

## Concrete changes

### 1. Split `apps/web/src/main.ts` (~814 LOC)

| New module | Owns |
|------------|------|
| `apps/web/src/hitl/ops-rail.ts` | `#ops-rail` HTML: Duyệt / Thu hồi / Chạy, chip row, run-feedback banner, compact metrics |
| `apps/web/src/ui/pricing-panel.ts` | Who-pays / Sea pilot / money CTAs panel |
| `apps/web/src/ui/ledger-panel.ts` | Above-fold ledger + demo-derived metrics tiles |
| `apps/web/src/ui/stage-details.ts` | Persona / transcript / blast / stage honesty (`<details>`) |
| `apps/web/src/state.ts` | Domain, approved, busy, audit, lastResult, lastRunMs |
| `apps/web/src/main.ts` | Thin: mount `#app`, `render()`, event wire, `runWithProgress` / reset |

Keep existing `apps/web/src/ui/{button,cn,card,badge,alert}.ts`. CSS / `index.html` critical style unchanged (R5 baseline).

### 2. Shared run path (dedupe `runner.ts`)

| Before | After |
|--------|-------|
| `runner.ts` re-implements accounting/sales compute+approve+persist | Thin adapter: call `@bizmate/runtime` `executeWorkflow(workflow, event, { approved })` with fixtures from `samples.ts` |
| Duplicate money/HITL logic | Single source: `apps/runtime/src/handlers/*` + `engine.ts` |

`RunResult` shape kept for UI (`ok`, `approved`, `steps`, `summary`). Map `ExecutionResult.finalState` → `summary` as needed. Add `@bizmate/runtime` workspace dep on `@bizmate/web`.

### 3. HITL smoke vitest

| File | Cases |
|------|-------|
| `apps/web/src/__tests__/hitl-smoke.test.ts` | (1) `runDomain("accounting", false)` → `ok===false`, no persist step success, approve error; (2) `runDomain("accounting", true)` → `ok===true`, persist step ok, `summary` shows crossedExemption for vendor-day fixture; (3) optional sales approve gate |

Scripts: `"test": "vitest run"` on `@bizmate/web`. Prove: `npm test -w @bizmate/web`, `npm run build -w @bizmate/web`, `curl :5173` → 200, page still has `ops-rail` + `bizmate-critical`.

## Out of scope

- Soft FO ICT/rejected UI
- Editing R1–R5 review docs
- Ping judges (Orchestrator only)
- Claiming live payment / tax API

## Ship checklist

1. This PLAN committed (or same tip as code)
2. Tip on `apps/web/**` (+ runtime dep wire if needed) — BizMate-only
3. `docs/review/BIZMATE-R6-REPORT.md` with tip SHA + prove log
4. Ping **Review Orchestrator** for PASS_VERIFY → re-score ×5
