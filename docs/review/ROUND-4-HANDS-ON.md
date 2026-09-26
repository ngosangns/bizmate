# ROUND-4 — HANDS-ON (rebuilt stacks)

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User lock**  
> **Bắt buộc sau STACK-REBUILD 4/4 Verified.** Judge phải **dùng app đã rebuild** như user thật (UI/PWA/demo/billing), không docs-only.  
> Tech R1 · Business R2 · Hands-on R3 giữ riêng — vòng này = stack-fit UX trên tip mới.

## STACK GATE (prerequisite)

**MET** · `docs/review/STACK-REBUILD.md` · 4/4 Orchestrator Verified.

## ENV GATE (prerequisite)

_PENDING_ · `docs/review/ROUND-4-ENV.md` — VM/judge environment. **Không chấm hands-on UI until Orchestrator marks ENV green.**


## Kit (Pstack/User — incoming)

Expect under `docs/review/` (paths land when Pstack pushes):

| Doc | Role |
|-----|------|
| `ROUND-4-RUBRIC.md` | Scoring rubric for rebuilt stacks |
| `ROUND-4-CHECKLISTS.md` | Per-app use checklists |
| `ROUND-4-FEEDBACK-FORM.md` | Judge fill **after** use |
| `ROUND-4-ENV.md` | VM/judge env — **HOLD until green** |

**Flow:** ENV green → USE (checklist) → fill FEEDBACK-FORM → Orchestrator routes CONDITIONAL/FAIL → Adv fix → Adv **REPORT** → judge re-score form + app → loop to gate.

## Per-app tip + how to use

| App | Stack | Tip | Use path (happy + 1 edge) |
|-----|-------|-----|---------------------------|
| BizMate | Vite + TS monorepo | `02ad24c` / `124e0f7` | `npm run demo:offline` · optional `npm run build -w @bizmate/web` / `dev:web` · HITL money + who-pays |
| Bookkeeper | Next + better-sqlite3 | `55758e1` / `37cfd0c` | `npm run demo:bookkeeper -- --reset` · Next UI `npm run dev -w @bizmate/bookkeeper` (:3010) · Từ chối→Duyệt · 1B paywall |
| Shield | PWA + SW (+ Vite) | `76c6a8c` / `d751cef` | `npm run demo:shield` / `--once` · PWA `npm run build -w @bizmate/shield` · BLOCK tip · Care sandbox |
| FloodOps | Next + Leaflet + worker | `73cac83` / `6e4542c` | `npm run demo:floodops` · `npm run worker -w @bizmate/floodops` · Next UI `dev` (:3011) · HUMAN+COD · COD≠invoice |

Pull tip per app (or latest main containing all four) before scoring. Honesty: stub/sandbox labeled; no fake live SPX/tax/pay.

## Protocol (Pstack/User P0)

1. **ENV green** — follow `docs/review/ROUND-4-ENV.md` (VM/judge env).
2. Judge **USE** rebuilt apps as real users (Next UI / PWA / Vite / demos / billing) — happy + 1 edge.
3. Judge **fill** `ROUND-4-FEEDBACK-FORM.md` (when landed) + score PASS/CONDITIONAL/FAIL → matrix + optional `r4-hands-<judge>.md`.
4. CONDITIONAL/FAIL → Orchestrator route Adv → **fix** → tip + prove.
5. Adv **REPORT** to judges (before/after · tip · how to re-use) — not silent.
6. Judges **score the report** too (clarity / honesty / re-use path) + re-use app if needed.
7. Loop until **≥4/5 PASS · 0 FAIL** per app on both use-score and report-score as required.

## Score matrix

| App | Sidharth | Lee | Tuấn Anh | Kyle | Son Lê | Aggregate |
|-----|----------|-----|----------|------|--------|-----------|
| BizMate | **PASS** | **PASS** | — | — | — | — |
| Bookkeeper | **PASS** | **PASS** | — | — | — | — |
| Shield | **PASS** | **PASS** | — | — | — | — |
| FloodOps | **PASS** | **CONDITIONAL** (`build:web`) | — | — | — | — |

## Routed CONDITIONAL / FAIL

| App | Judge | Status | Fix | Tip after |
|-----|-------|--------|-----|-----------|
| FloodOps | Lee | **CONDITIONAL** | `build:web` Next `./web` missing `.next/server/pages/_app.js` (App Router packaging) | _pending Adv_ |

Routed → Adv · FloodOps · 2026-09-26 19:03 ICT. After fix: tip + prove + **REPORT** Lee (before/after) → Lee re-use.
Also: UI-POLISH P0 parallel — `docs/review/UI-POLISH.md` (env HOLD remains).

## GATE STATUS

_OPEN (partial)_ — Sidharth CLI/demo+build filed. **ENV** (`ROUND-4-ENV.md`) vẫn PENDING cho full UI walk; panel khác chờ ENV green hoặc chạy demo+build như Sidharth.

### Sidharth filed
`docs/review/r4-hands-sidharth.md` — **4/4 PASS** trên HEAD `55758e1` (demo+build EXIT 0 ×4). Runs `r4-sid-*.txt`.

### Lee filed
`docs/review/r4-hands-lee.md` — BizMate/Bookkeeper/Shield **PASS**; FloodOps **CONDITIONAL** (`build:web` Next `_app.js` missing). Tip `55758e1`. Tech R1/R2/R3 không đụng.
