# FloodOps · ROUND-5 Adv REPORT (UX / HUMAN HITL)

> Adv · FloodOps · 2026-09-26 Asia/Saigon  
> Tip baseline: `23ec3b4` · this ship tip: see git HEAD after commit  
> Judges covered: **Lee · Sidharth · Trần Tuấn Anh · Kyle · Son Lê**  
> Axes: D1–D4 (Orchestrator U1–U4). R1–R4 không đụng.

---

## Shared fix (all five judges)

| Field | Content |
|-------|---------|
| **Before** | OrdersTable **read-only** — `awaiting_human` HUMAN rows (ORD-1003 refund · ORD-1005 hold) visible but no Duyệt/Apply/Từ chối. D4 weak / Kyle initially FAIL on critical HUMAN loop. Ward column DOM text glued (`Hòa Hưngflooded`) — Lee noted as popup/`floodedflood` glue. |
| **After** | Row-level HITL: **Duyệt hoàn** (`propose_refund`) · **Ops duyệt** (hold/reschedule/reroute) · **Từ chối** → `POST /api/approve` → `resolveHumanAction` / `approveRefund` / `applyOpsAction` / `rejectHumanAction` · updates `data/orders.json` + `.audit/wave.jsonl` · UI refreshes status. Ward badge/popup/legend use spaced **`flooded · ngập`** / **`clear · khô`**. COD≠invoice + SANDBOX/STUB banners **kept**. |
| **Tip SHA** | `f785161` (`f785161a20cecae07c0bc62b28304d4801e38d94`) |
| **Prove** | `npm test -w @bizmate/floodops` **EXIT 0** (27/27) · `npm run demo:floodops` **EXIT 0** · `npm run build:web -w @bizmate/floodops` **EXIT 0** · `:3011` **HTTP 200** · smoke `POST /api/approve` ok |
| **How to re-use** | Commands below · `npm run worker -w @bizmate/floodops` to reset HUMAN queue · restart `npm run dev -w @bizmate/floodops` if `:3011` stale |
| **Honesty** | **Y** — SANDBOX/STUB · **COD ≠ invoice** · no live SPX · offline_stub seats · HUMAN decide only |

### Re-use commands (exact)

```bash
npm test -w @bizmate/floodops
npm run demo:floodops
npm run worker -w @bizmate/floodops
npm run build:web -w @bizmate/floodops
npm run dev -w @bizmate/floodops   # :3011
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3011/
# HITL smoke (after worker):
curl -s -X POST http://127.0.0.1:3011/api/approve \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"ORD-1003","verdict":"approve","actor":"ops-ui-demo"}'
```

### UI diff note

- `web/components/OrdersTable.tsx` — `"use client"` · HITL column · Duyệt hoàn / Ops duyệt / Từ chối · optimistic + `router.refresh()`
- `web/app/api/approve/route.ts` — POST approve|reject
- `src/audit.ts` — `applyOpsAction` · `rejectHumanAction` · `resolveHumanAction` (refund still `approveRefund`)
- `web/components/FloodMap.tsx` — popup + legend `flooded · ngập` (space separator)
- Badges: text node space before badge so DOM ≠ `Hòa Hưngflooded`

---

## 1) Lee Chon Cheng — was **CONDITIONAL** (TB 3.5)

| Field | Content |
|-------|---------|
| **Before** | D3/D4: HUMAN rows thiếu Duyệt/Apply · popup/`floodedflood` dính · COD≠invoice OK |
| **After** | HUMAN actionable · spaced `flooded · ngập` · honesty kept |
| **Prove** | test/demo/build:web EXIT 0 · :3011 200 · HITL CTA in DOM |
| **Honesty** | Y |
| **Re-score?** | Yes (D3/D4) |

Evidence: `docs/review/r5-form-lee.md` · `runs/r5-lee-ui-floodops.png`

---

## 2) Sidharth Sharma — was **CONDITIONAL** (TB 3.5)

| Field | Content |
|-------|---------|
| **Before** | D4: cannot complete HUMAN confirm/reject in UI |
| **After** | Confirm (**Duyệt hoàn** / **Ops duyệt**) + **Từ chối** (→ `proposed` + audit) |
| **Prove** | same · reject smoke ORD-1005 |
| **Honesty** | Y · COD≠invoice |
| **Re-score?** | Yes |

Evidence: `docs/review/r5-form-sidharth.md` · `runs/r5-sid-ui-floodops*.png`

---

## 3) Trần Tuấn Anh — was **CONDITIONAL** (TB 3.5)

| Field | Content |
|-------|---------|
| **Before** | P0: in-UI Duyệt/Xác nhận HUMAN missing (CLI-only approve) |
| **After** | In-UI Duyệt hoàn / Ops duyệt + success status flip |
| **Prove** | same |
| **Honesty** | Y |
| **Re-score?** | Yes |

Evidence: `docs/review/r5-form-tuananh.md`

---

## 4) Kyle Tran — was **FAIL** → amended **CONDITIONAL** (TB ~3.75)

| Field | Content |
|-------|---------|
| **Before** | Critical HUMAN flow broken — no row-level approve/replan/refund surface |
| **After** | Visible primary CTAs on HUMAN rows · refund/hold paths wired |
| **Prove** | same · closes Kyle P0 surface gap |
| **Honesty** | Y · COD≠invoice |
| **Re-score?** | Yes (D4 / critical-flow closure) |

Evidence: `docs/review/r5-form-kyle.md`

---

## 5) Son Lê — was **CONDITIONAL** (TB 3.5)

| Field | Content |
|-------|---------|
| **Before** | HUMAN `awaiting_human` thiếu Duyệt/Apply trên UI · D4=3 |
| **After** | Duyệt hoàn / Ops duyệt / Từ chối + status update |
| **Prove** | same |
| **Honesty** | Y · giữ COD≠invoice |
| **Re-score?** | Yes |

Evidence: `docs/review/r5-form-son.md`

---

## Board ask

Orchestrator: re-score FloodOps R5 for **Lee · Sid · TA · Kyle · Son** on tip after this REPORT. Adv pings Orchestrator only (not judges).
