# FloodOps · ROUND-4 Adv REPORT (×5 judges)

> Adv · FloodOps · 2026-09-26 Asia/Saigon  
> Template: `docs/review/ROUND-4-FEEDBACK-FORM.md` § Adv REPORT  
> Covers judges: **Lee · Sidharth · Trần Tuấn Anh · Kyle · Son Lê**  
> Also folds **UI-POLISH P0** (Tailwind + shadcn-style Card/Badge/Separator + Radix).

---

## Shared fix (all judges)

| Field | Content |
|-------|---------|
| **Before** | `npm run build:web -w @bizmate/floodops` = `next build ./web` → **EXIT 1**. Symptoms varied by stale `.next` / packaging: missing `pages/_app.js` (Lee), `PageNotFoundError /_document` / next-font-manifest (Sidharth · Son), missing `./ui/card\|badge\|separator` mid-polish (Tuấn Anh), build race with ENV `next dev` on same `.next` (Kyle probe). Sid walk `:3011` also saw **HTTP 500** on stale/broken tree. |
| **After** | Packaging = build from Next project root + clean `.next` hygiene: `rm -rf web/.next && cd web && next build`. UI shards present under `web/components/ui/` (Card · Badge · Button · Separator). Leaflet map kept client-only. Stub/sandbox + COD≠invoice banners kept. Port **3011**. |
| **Tip SHA** | `f81ff1f` |
| **Prove** | `npm test -w @bizmate/floodops` · `npm run demo:floodops` · `npm run worker -w @bizmate/floodops` · `npm run build:web -w @bizmate/floodops` — all **EXIT 0**. Fresh `npm run dev -w @bizmate/floodops` → `:3011` **HTTP 200**. |
| **How to re-use** | See commands below. Prefer clean build (script already `rm -rf web/.next`). If `:3011` looks stale after WIP, restart `npm run dev -w @bizmate/floodops`. |
| **Honesty** | **Y** — SANDBOX/STUB · COD≠invoice · no fake live SPX · `@bizmate/billing` offline_stub · engine HUMAN+COD · §④ VND seats. |
| **UI-POLISH?** | **Y** — Tailwind 3 + hand-rolled shadcn-style (`web/components/ui/*`) + Radix Separator/Slot · map / orders HUMAN badges / billing seats / honesty banners. |

### Re-use commands (exact)

```bash
npm test -w @bizmate/floodops
npm run demo:floodops
npm run worker -w @bizmate/floodops
npm run build:web -w @bizmate/floodops   # rm -rf web/.next && cd web && next build
npm run dev -w @bizmate/floodops         # :3011 — curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3011/
```

---

## 1) Lee Chon Cheng (ops / stack-fit) — was **CONDITIONAL**

| Field | Content |
|-------|---------|
| **Before** | R4 board: demo/worker PASS · `build:web` FAIL · `Cannot find module '.../web/.next/server/pages/_app.js'` after `next build ./web` (App Router-only). Log: `docs/review/runs/r4-lee-floodops.txt`. |
| **After** | `cd web && next build` (+ clean `.next`) → EXIT 0. No fake `pages/_app.js`. |
| **Tip SHA** | `f81ff1f` |
| **Prove** | build:web EXIT 0 · test 24/24 · demo · worker |
| **How to re-use** | commands above |
| **Honesty** | Y |
| **UI-POLISH?** | Y |

### Re-score (Judge)

| Criterion | Before | After | Notes |
|-----------|--------|-------|-------|
| C1 | | | |
| C2 | | | |
| C3 | | | |
| C4 | N/A | | chấm REPORT |
| C5 | | | |
| **Avg / Verdict** | CONDITIONAL | **_** | |

---

## 2) Sidharth Sharma (GTM) — was **CONDITIONAL**

| Field | Content |
|-------|---------|
| **Before** | Re-check `build:web` EXIT 1 · `PageNotFoundError: /_document` / next-font-manifest (same packaging class as Lee). Stale capture that once said EXIT 0 discarded. Walk `:3011` → HTTP 500 on broken/stale tree. Logs: `r4-sid-floodops-build-recheck.txt`. |
| **After** | Clean `rm -rf web/.next && cd web && next build` EXIT 0 · fresh dev `:3011` HTTP 200. |
| **Tip SHA** | `f81ff1f` |
| **Prove** | build + HTTP 200 + demo/worker |
| **How to re-use** | commands above · restart dev if `.next` stale |
| **Honesty** | Y · COD≠invoice / who-pays CLI kept |
| **UI-POLISH?** | Y |

### Re-score (Judge)

| Criterion | Before | After | Notes |
|-----------|--------|-------|-------|
| C1 | | | |
| C2 | | | |
| C3 | | | |
| C4 | N/A | | |
| C5 | | | |
| **Avg / Verdict** | CONDITIONAL | **_** | |

---

## 3) Trần Tuấn Anh — was **CONDITIONAL**

| Field | Content |
|-------|---------|
| **Before** | `build:web` FAIL · missing `./ui/card` · `./ui/badge` · `./ui/separator` (half-polish imports without files). Tip noted `b54a2d8`. Log: `r4-tuananh-floodops-build.txt`. |
| **After** | Real components at `apps/floodops/web/components/ui/{card,badge,button,separator}.tsx` · build EXIT 0. |
| **Tip SHA** | `f81ff1f` |
| **Prove** | build resolves ui/* · test/demo/worker |
| **How to re-use** | commands above |
| **Honesty** | Y |
| **UI-POLISH?** | Y — components are the polish |

### Re-score (Judge)

| Criterion | Before | After | Notes |
|-----------|--------|-------|-------|
| C1 | | | |
| C2 | | | |
| C3 | | | |
| C4 | N/A | | |
| C5 | | | |
| **Avg / Verdict** | CONDITIONAL | **_** | |

---

## 4) Kyle — was **CONDITIONAL** / build race

| Field | Content |
|-------|---------|
| **Before** | `build:web` EXIT 1 under concurrent ENV `next dev` writing same `web/.next` (ENOENT pages-manifest / intermittent). Probe logs under `docs/review/runs/r4-kyle-*` when present. |
| **After** | Hygiene: script **always** `rm -rf web/.next` before `cd web && next build`. Bookkeeper lesson applied. |
| **Tip SHA** | `f81ff1f` |
| **Prove** | two clean builds EXIT 0 when no mid-rm race from other agents |
| **How to re-use** | commands above · avoid parallel `next build` + deleting `.next` from another shell |
| **Honesty** | Y |
| **UI-POLISH?** | Y |

### Re-score (Judge)

| Criterion | Before | After | Notes |
|-----------|--------|-------|-------|
| C1 | | | |
| C2 | | | |
| C3 | | | |
| C4 | N/A | | |
| C5 | | | |
| **Avg / Verdict** | CONDITIONAL | **_** | |

---

## 5) Son Lê — was **CONDITIONAL**

| Field | Content |
|-------|---------|
| **Before** | `build:web` EXIT 1 · App Router /404 Html / `_document` class error on tip `687e652` (same packaging / stale `.next` family). |
| **After** | `rm -rf web/.next && cd web && next build` EXIT 0. |
| **Tip SHA** | `f81ff1f` |
| **Prove** | build:web · test · demo · worker |
| **How to re-use** | commands above |
| **Honesty** | Y |
| **UI-POLISH?** | Y |

### Re-score (Judge)

| Criterion | Before | After | Notes |
|-----------|--------|-------|-------|
| C1 | | | |
| C2 | | | |
| C3 | | | |
| C4 | N/A | | |
| C5 | | | |
| **Avg / Verdict** | CONDITIONAL | **_** | |

---

## Files touched (this tip)

- `apps/floodops/package.json` — `build:web` / `dev` / `start` + Tailwind/Radix deps
- `apps/floodops/web/next.config.mjs` — App Router root build
- `apps/floodops/web/tailwind.config.ts` · `postcss.config.mjs` · `lib/utils.ts`
- `apps/floodops/web/components/ui/{badge,card,button,separator}.tsx`
- `apps/floodops/web/app/{globals.css,page.tsx}` · feature panels polished
- `docs/review/FLOODOPS-R4-REPORT.md` — this packet

Engine / audit / HUMAN+COD / contracts+billing **unchanged**.

---

## Optional append targets (Orchestrator / judges)

Short RESPONSE pointers (do not erase judge boards):

- `docs/review/r4-hands-lee.md`
- `docs/review/r4-hands-sidharth.md`
- `docs/review/r4-hands-tuananh.md`

Canonical Adv packet = **this file**.
