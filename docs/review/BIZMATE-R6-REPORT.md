# Adv REPORT — BizMate (R6 CONDITIONAL · TA + Kyle)

> Adv · BizMate · 2026-09-27 Asia/Saigon · Round-6 CONDITIONAL fixes  
> Baseline tip: `ea96d04` · Code tip: `7829cb4` (`7829cb4610e938135a816d374588246f5e76af58`) · Orchestrator route only · **no judge ping**  
> Soft FO (ICT/rejected) **out of scope** · R1–R5 docs untouched

### App: BizMate (Vite + Tailwind vanilla TS · `:5173`)

| Field | Content |
|-------|---------|
| **Before** | Tip `ea96d04`. TA CONDITIONAL (~TB 4.0, S1=3): `main.ts` ~814 LOC god-file; browser `runner.ts` re-implements accounting/sales compute+persist (dupe vs `@bizmate/runtime`); no vitest HITL on web path. Kyle CONDITIONAL (TB 3.83, S2/S3=3): ops-rail/pricing/ledger still inlined in `main.ts`; no smoke that Duyệt→Chạy→crossed-1B goes through shared run path. |
| **After** | **(P0 split)** `main.ts` → thin mount/render/events (~276 LOC). New modules: `hitl/ops-rail.ts`, `ui/pricing-panel.ts`, `ui/ledger-panel.ts`, `ui/stage-details.ts`, `state.ts` (+ `format.ts` helpers). CSS classes (`ops-rail`, chips) + `index.html` `#bizmate-critical` unchanged. **(P0 shared runner)** `runner.ts` thin adapter: `executeWorkflow` from `@bizmate/runtime` with samples fixtures cast to Workflow/event; maps `ExecutionResult` → UI `RunResult`. Vite aliases stub `node:fs|path|url` for browser audit. **(P0 HITL vitest)** `apps/web/src/__tests__/hitl-smoke.test.ts` — accounting refuse/persist+cross-1B; sales block/ok. |
| **Tip SHA** | **canonical BizMate code tip** `7829cb4` (`7829cb4610e938135a816d374588246f5e76af58`) · this REPORT stamp is the following commit on `main`. Baseline: `ea96d04`. |
| **Prove** | See table — web tests **4/4** · web build EXIT 0 · runtime tests **12/12** · curl 127 + localhost **200** · page has `bizmate-critical` + `ops-rail` |
| **Honesty** | **Y** — STUB / SANDBOX · offline fixture · no live charge · Orchestrator-only (no judge ping) |

### How to re-use (exact)

```bash
cd /workspace/bizmate
npm run build -w @bizmate/runtime   # EXIT 0 (web depends on dist)
npm test -w @bizmate/web            # EXIT 0 · 4/4 HITL smoke
npm run build -w @bizmate/web       # EXIT 0
npm test -w @bizmate/runtime        # EXIT 0 · 12/12 regression
cd apps/web && npx vite preview --host --port 5173 --strictPort
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5173/   # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5173/    # 200
# HTML must contain id="bizmate-critical" and class/id ops-rail
# Walk: Duyệt → Chạy sổ → THÀNH CÔNG · crossed 1B; Thu hồi → Chạy → BỊ CHẶN
```

### Prove exits (Adv · 2026-09-27 Asia/Saigon)

| Command | Result |
|---------|--------|
| `npm run build -w @bizmate/runtime` | **EXIT 0** |
| `npm test -w @bizmate/web` | **EXIT 0** · **4 passed** (HITL smoke) |
| `npm run build -w @bizmate/web` | **EXIT 0** (tsc + vite; 35 modules) |
| `npm test -w @bizmate/runtime` | **EXIT 0** · **12/12** |
| `curl http://127.0.0.1:5173/` | **HTTP 200** · contains `bizmate-critical` + `ops-rail` |
| `curl http://localhost:5173/` | **HTTP 200** |

### P0 checklist (TA + Kyle)

| Judge | P0 | Status |
|-------|----|--------|
| TA | Split `main.ts` god-file | **Done** — ops-rail / pricing / ledger / stage-details / state |
| TA | Shared browser run path (dedupe runner vs runtime) | **Done** — `executeWorkflow` adapter |
| TA | Vitest HITL refuse without Duyệt / persist with Duyệt | **Done** — 4 tests |
| Kyle | Split ops-rail/pricing/ledger out of main | **Done** |
| Kyle | Smoke approve→Chạy→crossed-1B via run path | **Done** — vendor-day fixture `crossedExemption: true` |

### Out of scope (confirmed)

- Soft FO ICT/rejected UI
- Editing R1–R5 review docs
- Judge pings (Orchestrator only for PASS_VERIFY → re-score ×5)
- Live payment / tax API claims

### Re-score (Judge điền sau REPORT / Orchestrator)

| Judge | Before | After | Notes |
|-------|--------|-------|-------|
| Trần Tuấn Anh | CONDITIONAL ~4.0 (S1=3) | _ | tip `7829cb4` |
| Kyle Tran | CONDITIONAL 3.83 (S2/S3=3) | _ | tip `7829cb4` |
| Sidharth / Lee | PASS (soft backlog) | — | no P0 this round |

Honesty: **Y** · BizMate-only tip · no Soft FO · no judge ping from Adv.
