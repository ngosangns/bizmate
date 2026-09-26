# ROUND-4 — HANDS-ON (rebuilt stacks)

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User lock**  
> **Bắt buộc sau STACK-REBUILD 4/4 Verified.** Judge phải **dùng app đã rebuild** như user thật (UI/PWA/demo/billing), không docs-only.  
> Tech R1 · Business R2 · Hands-on R3 giữ riêng — vòng này = stack-fit UX trên tip mới.

## Judging kit (t19)

| File | Role |
|------|------|
| [`ROUND-4-RUBRIC.md`](./ROUND-4-RUBRIC.md) | Criteria C1–C5 · scale 1–5 · PASS / CONDITIONAL / FAIL map |
| [`ROUND-4-CHECKLISTS.md`](./ROUND-4-CHECKLISTS.md) | Per-app hands-on: happy + edge + billing honesty |
| [`ROUND-4-FEEDBACK-FORM.md`](./ROUND-4-FEEDBACK-FORM.md) | Scores · notes · verdict · must-fix · Adv REPORT |
| [`ROUND-4-ENV.md`](./ROUND-4-ENV.md) | VM/judge ports · smoke matrix · ENV gate |
| [`UI-POLISH.md`](./UI-POLISH.md) | Parallel P0 polish tracking (4 Advs) |

## STACK GATE (prerequisite)

**MET** · `docs/review/STACK-REBUILD.md` · 4/4 Orchestrator Verified.

## ENV GATE (prerequisite)

**MET · GREEN** · `docs/review/ROUND-4-ENV.md` · tip `be24bb6` · 2026-09-26 19:06 ICT.  
4 demos + builds EXIT 0 · UIs :5173 / :5174 / :3010 / :3011 HTTP 200. **Full UI walk (C2)** open.

## Per-app tip + how to use

| App | Stack | Tip | Use path (happy + 1 edge) |
|-----|-------|-----|---------------------------|
| BizMate | Vite + TS monorepo | `02ad24c` / `124e0f7` | `npm run demo:offline` · optional `npm run build -w @bizmate/web` / `dev:web` · HITL money + who-pays |
| Bookkeeper | Next + better-sqlite3 | `55758e1` / `37cfd0c` | `npm run demo:bookkeeper -- --reset` · Next UI `npm run dev -w @bizmate/bookkeeper` (:3010) · Từ chối→Duyệt · 1B paywall |
| Shield | PWA + SW (+ Vite) | `76c6a8c` / `d751cef` | `npm run demo:shield` / `--once` · PWA `npm run build -w @bizmate/shield` · BLOCK tip · Care sandbox |
| FloodOps | Next + Leaflet + worker | `73cac83` / `6e4542c` | `npm run demo:floodops` · `npm run worker -w @bizmate/floodops` · Next UI `dev` (:3011) · HUMAN+COD · COD≠invoice |

Pull tip per app (or latest main containing all four) before scoring. Honesty: stub/sandbox labeled; no fake live SPX/tax/pay.

## Protocol loop (Pstack/User P0)

```
USE (checklist) → score FEEDBACK-FORM → route Adv (if CONDITIONAL/FAIL)
    → Adv fix + REPORT (before/after · tip SHA) → judge re-use → re-score
    → repeat until gate
```

1. **ENV** — follow `ROUND-4-ENV.md` (green for full UI; PENDING = CLI/demo+build OK).
2. Judge **USE** rebuilt apps — tick `ROUND-4-CHECKLISTS.md` (happy + edge + billing honesty).
3. Judge **score** per `ROUND-4-RUBRIC.md` → fill `ROUND-4-FEEDBACK-FORM.md` → matrix + optional `r4-hands-<judge>.md`.
4. **CONDITIONAL/FAIL** → Orchestrator route Adv → **fix** → tip + prove.
5. Adv **REPORT** (form § Adv REPORT: before/after · tip SHA · how to re-use) — not silent.
6. Judges **score the report** (C4) + re-use app if needed → new form pass.
7. Loop until **≥4/5 PASS · 0 FAIL** per app (use-score + report-score as required).

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
Also: UI-POLISH P0 parallel — `docs/review/UI-POLISH.md` (ENV HOLD remains).

## GATE STATUS

_OPEN_ — **ENV GREEN** (`ROUND-4-ENV.md` · tip `be24bb6`). Full UI walk open. FloodOps Lee CONDITIONAL (`build:web`) chờ Adv. TA/Kyle/Son còn. Gate ≥4/5 PASS · 0 FAIL.

### Sidharth filed
`docs/review/r4-hands-sidharth.md` — **4/4 PASS** trên HEAD `55758e1` (demo+build EXIT 0 ×4). Runs `r4-sid-*.txt`.

### Lee filed
`docs/review/r4-hands-lee.md` — BizMate/Bookkeeper/Shield **PASS**; FloodOps **CONDITIONAL** (`build:web` Next `_app.js` missing). Tip `55758e1`. Tech R1/R2/R3 không đụng.
