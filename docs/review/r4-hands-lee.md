# ROUND-4 HANDS-ON — Judge · Lee Chon Cheng (ops / stack-fit)

> Tip monorepo `55758e1` (chứa rebuild Mate `124e0f7` · BK `37cfd0c` · Shield `d751cef` · FO `6e4542c`) · 2026-09-26 Asia/Saigon  
> **Không docs-only.** Tech R1 / Business R2 / Hands-on R3 **không đụng**.

## Board

| App | Demo | Build/UI | Edge | Verdict |
|-----|------|----------|------|---------|
| BizMate | EXIT 0 | Vite web OK | HITL money + who-pays STUB | **PASS** |
| Bookkeeper | EXIT 0 | Next build OK | Từ chối→Duyệt · 1B paywall | **PASS** |
| Shield | EXIT 0 | PWA+SW OK | BLOCK tip · Care sandbox | **PASS** |
| FloodOps | EXIT 0 · worker OK | **`build:web` FAIL** | COD escalate · COD≠invoice | **CONDITIONAL** |

**Lee R4: 3 PASS · 1 CONDITIONAL · 0 FAIL**

## Chi tiết

### BizMate — **PASS**
- `npm run demo:offline` → PASSED · HITL trước persist · who-pays Sea seat + STUB · audit JSONL
- `npm run build -w @bizmate/web` OK
- Log: `docs/review/runs/r4-lee-bizmate.txt`

### Bookkeeper — **PASS**
- `demo:bookkeeper -- --reset` EXIT 0 · SQLite · refuse×3 → Duyệt · CẢNH BÁO 1B + soft Pro · STUB/SANDBOX
- Next App Router build OK
- Log: `docs/review/runs/r4-lee-bookkeeper.txt`

### Shield — **PASS**
- `demo:shield` EXIT 0 · rule engine · family alert · Stripe TEST Care
- PWA build → `sw.js` + manifest
- Log: `docs/review/runs/r4-lee-shield.txt`

### FloodOps — **CONDITIONAL**
- **Ops demo/worker PASS:** `demo:floodops -- --reset` EXIT 0 · HUMAN COD 2.5M → awaiting_human · COD≠invoice · tsc + worker OK · zero LLM hot path
- **Stack gap (R4 bar):** `npm run build:web -w @bizmate/floodops` (`next build ./web`) → EXIT 1  
  `Cannot find module '.../web/.next/server/pages/_app.js'` sau compile (App Router-only, không có `pages/`)
- **Fix P0 (Adv · FloodOps):** sửa packaging Next dashboard để `build:web` green (App Router export path / không require pages `_app`). Demo CLI giữ nguyên.
- Log: `docs/review/runs/r4-lee-floodops.txt` · `r4-lee-builds.txt`

## Ops takeaway vs R3

HITL / human-before-high-money / stub honesty / deterministic engines **giữ**. Không crash demo · không fake live. Gap mới = FO Next UI packaging — chặn “mở UI control tower” trên stack rebuild, không chặn replan CLI.

---

## Adv · FloodOps RESPONSE (R4 CONDITIONAL → fix)

- **Before:** `next build ./web` → EXIT 1 · `_app.js` missing  
- **After:** `rm -rf web/.next && cd web && next build` → EXIT 0 · `:3011` HTTP 200  
- **Packet:** `docs/review/FLOODOPS-R4-REPORT.md` (×5 judges + UI-POLISH)  
- **Re-use:** `npm run build:web -w @bizmate/floodops` · `npm test -w @bizmate/floodops` · `npm run demo:floodops` · `npm run worker -w @bizmate/floodops` · `npm run dev -w @bizmate/floodops`
