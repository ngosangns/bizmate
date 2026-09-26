# BizMate STACK-REBUILD prove packet

> Adv · BizMate · 2026-09-26 Asia/Saigon  
> Baseline: `fd56e9a` · Tip: **`124e0f7`** (`124e0f7569c1db7e8b64492301a426198b03e0ad`)  
> Docs: `docs/review/BIZMATE-STACK.md`

## Stack pick (summary)

- **Web = Vite** (not Next) — lower D-Day migrate risk; story mode + billing panel already work.
- Runtime = deterministic Node · Mate CLI evolve · EM money HITL · `demo:offline` who-pays · audit JSONL · honesty stubs labeled.
- Keep: `apps/{mate,judge,em,runtime,web}` + `packages/{contracts,billing,core}`.

## Commands + EXIT evidence (do not invent)

| Command | EXIT | Evidence |
|---------|------|----------|
| `npm run demo:offline` | **0** | `docs/review/runs/bizmate-stack-demo-offline.txt` — ends `demo PASSED` · Who pays Sea internal · cost-center stub · `EM blocked auto-done on money task` |
| `npm test -w @bizmate/billing` | **0** | `docs/review/runs/bizmate-stack-tests.txt` — 10 tests |
| `npm test -w @bizmate/core` | **0** | same — 2 tests |
| `npm test -w @bizmate/mate` | **0** | same — 4 tests |
| `npm test -w @bizmate/judge` | **0** | same — 2 tests |
| `npm test -w @bizmate/em` | **0** | same — 17 tests |
| `npm test -w @bizmate/runtime` | **0** | same — 12 tests |
| `npm run build -w @bizmate/billing` | **0** | `docs/review/runs/bizmate-stack-build-billing.txt` |
| `npm run build -w @bizmate/web` | **0** | `docs/review/runs/bizmate-stack-build-web.txt` — Vite production build |
| `npm run mate:generate -- --domain sales --id wf-stack-cli-sales` | **0** | `docs/review/runs/bizmate-stack-mate-cli.txt` (`GEN_EXIT:0`) |
| `npm run mate:evolve -- --id wf-stack-cli-sales --feedback "stack rebuild"` | **0** | same (`EVOLVE_EXIT:0`, generation 1) |

Root `package.json` `build` already chains `@bizmate/billing` before core/mate (no change required).

## Light evolve (this tip)

- Docs: `BIZMATE-STACK.md` (Vite pick + prose architecture + keep/migrate notes)
- Web polish: footer `stack: Vite + Node runtime` in `apps/web/src/main.ts` + `.stack-footer` CSS
- Mate CLI: confirmed working (no code fix needed)
- **No** Next migration · **No** Bookkeeper/Shield/FloodOps rewrites · **No** live payment/tax claim

## Honesty

Sandbox / stub / fixture labeled. SME Pro = roadmapOnly. D-Day payer = Sea internal tooling (cost-center).
