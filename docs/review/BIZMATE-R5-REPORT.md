# Adv REPORT — BizMate (R5 UX · Lee + Sid + TA + Kyle + Son)

> Adv · BizMate · 2026-09-26 Asia/Saigon · Round-5 UX  
> Tip before: `23ec3b4` (docs kit) · Judges: Lee CONDITIONAL 3.25 · Sidharth CONDITIONAL 3.25 · Tuấn Anh CONDITIONAL 3.5 · Kyle **CONDITIONAL** (was FAIL TB 1.75, amended by judge to CONDITIONAL / 0 FAIL panel) · Son CONDITIONAL (same theme)

### App: BizMate (Vite + Tailwind vanilla TS · `:5173`)

| Field | Content |
|-------|---------|
| **Before** | Tip `23ec3b4`. Lee: HITL below Giá/metrics; chips visually `TạoChấmDuyệtChạy`; Chạy feedback buried (persist_ok/Last run feel dead). Sid: who-pays / week-2 / money CTAs below fold; EM/Codex/blast noise dominates 30s GTM scan. TA: same HITL-below-eng/pricing for sạp scan. Kyle: **CONDITIONAL** (amended from FAIL) — CSS only via module JS inject (no `<link rel=stylesheet>` in HTML) + `::1`-only bind so headless/127.0.0.1 walks read unstyled/glued chips. Son: same fold/HITL theme. Shots: `docs/review/runs/r5-lee-ui-bizmate.png` · `r5-kyle-*.png` · forms `r5-form-*.md`. |
| **After** | **(Kyle P0 CSS)** Critical chip/ops tokens in `index.html` `<style id="bizmate-critical">`; production `vite build` emits `<link rel="stylesheet" href="/assets/*.css">`; `vite.config.ts` `server.host: true` + `preview.host: true` + `strictPort` on 5173; live serve via **`vite preview --host --port 5173`** so 127.0.0.1 and localhost both HTTP 200 with styled page. **(Lee)** Sticky `#ops-rail` above fold (Duyệt / Thu hồi / Chạy + compact metrics + run banner); chip-row + middot `.chip-sep` + stronger chip chrome; after Chạy: banner + `persist_ok`/`Last run` on ops metrics (`aria-live`) — blocked path bumps approve_fail and still updates Last run. **(Sid)** Who-pays Sea + week-2 **10 Sea pilot seats** + STUB/SANDBOX money CTAs on ops rail; EM board / blast-radius / long metrics / JSON moved into collapsed `<details>` dưới fold. **(TA)** Persona → chips → HITL/Chạy → result → then pricing; VN microcopy on compact metric tiles. **(Son)** Covered by same CSS+HITL fold tip — no extra P0. Honesty STUB/SANDBOX kept; EM counts 7/3 unchanged (in details only). |
| **Tip SHA** | `9387288` (`9387288e171afa27587710666b2c8e5d0574a5aa`) |
| **Prove** | See table below — build EXIT 0 · curl 127.0.0.1 + localhost **200** · CSS asset 200 with `.chip{…border:1.5px…}` · runtime tests 12/12 · headless dump-dom shows separated chips + HITL before Giá |
| **How to re-use** | See block below |
| **Honesty** | **Y** — STUB cost-center Sea · Stripe TEST SANDBOX · no live charge · offline fixture · Bà Lan story |

### How to re-use (exact)

```bash
cd /workspace/bizmate
npm run build -w @bizmate/web          # EXIT 0
# Prefer styled judge walk (CSS <link> in dist HTML):
cd apps/web && npx vite preview --host --port 5173 --strictPort
# (dev also ok after host:true: npm run dev:web)
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5173/   # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5173/    # 200
# Walk: open :5173 → Duyệt workflow → Chạy sổ kế toán
#   → banner THÀNH CÔNG · persist_ok increments · Last run shows ms (not —)
# Walk blocked: Thu hồi → Chạy → banner BỊ CHẶN · approve_fail +1 · Last run still ms
```

### Prove exits (Adv · 2026-09-26 Asia/Saigon)

| Command | Result |
|---------|--------|
| `npm run build -w @bizmate/web` | **EXIT 0** |
| `npm test -w @bizmate/runtime` | **EXIT 0** (12/12) |
| `curl http://127.0.0.1:5173/` | **HTTP 200** |
| `curl http://localhost:5173/` | **HTTP 200** |
| `curl …/assets/index-*.css` | **HTTP 200** · contains `.chip{…border:1.5px solid…}` |
| Headless dump-dom | Chips `Tạo · Chấm · Duyệt · Chạy` separate; `#ops-rail` before Giá; critical `<style>` + stylesheet `<link>` present |
| Chạy metrics | Verified in source: `runWithProgress` writes `persist_ok`/`approve_fail` + `lastRunMs` + `#run-feedback` + `#ops-metrics` aria-live; built JS contains `persist_ok +1` / `BỊ CHẶN` banners. Live CDP click walk not recorded this pass (tooling); re-use walk above is the judge path. |

### P0 checklist (all addressed)

| Judge | P0 | Status |
|-------|----|--------|
| Kyle | CSS load + host bind (chips/HITL readable in 30s) | **Done** — critical CSS + preview CSS link + `host: true` |
| Lee | HITL above fold | **Done** — sticky ops rail |
| Lee | Chip separators | **Done** — `.chip-sep` middots + chip chrome |
| Lee | Chạy → persist_ok / Last run visible | **Done** — ops metrics + banner |
| Sid | Who-pays / week-2 / money CTA above fold | **Done** — GTM strip on ops rail |
| Sid | Trim EM/Codex noise | **Done** — details dưới fold |
| TA | Persona → HITL/Chạy → then pricing/metrics | **Done** |
| Son | Same fold/CSS theme | **Done** (shared tip) |

### Kyle root cause (for re-score)

1. **CSS-via-JS only:** Dev HTML had no `<link rel=stylesheet>`; Tailwind arrived only after `main.ts` module ran → headless/slow first paint = unstyled glued `TạoChấmDuyệtChạy`.  
2. **IPv6-only bind:** Vite default listened `[::1]:5173` → `127.0.0.1:5173` failed.  
**Fix:** critical `<style>` in `index.html` + production preview with hashed CSS link + `server/preview.host: true`.

### Re-score (Judge điền sau REPORT)

| Judge | Before | After | Notes |
|-------|--------|-------|-------|
| Lee | 3.25 CONDITIONAL | _ | |
| Sidharth | 3.25 CONDITIONAL | _ | |
| Tuấn Anh | 3.5 CONDITIONAL | _ | |
| Kyle | CONDITIONAL (amended; was FAIL 1.75) | _ | |
| Son | CONDITIONAL | _ | |

Honesty: **Y** — no live payment claimed.
