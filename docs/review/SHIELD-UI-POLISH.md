# Shield — UI-POLISH prove packet

> Adv · Shield · 2026-09-26 Asia/Saigon  
> Matrix: [`UI-POLISH.md`](./UI-POLISH.md)  
> Baseline tip: `be24bb6` · Stack tip Verified: `d751cef` · **UI-POLISH tip: `52972a1`** (filled after push)

## Stack picks

| Pick | Choice | Why |
|------|--------|-----|
| CSS | **Tailwind CSS v3.4** + PostCSS + autoprefixer | Matches monorepo (`apps/web`); Vite PWA builds clean; elder utilities in theme |
| Components | **Local shadcn-like class builders** (`web/src/ui.ts`) | Vanilla Vite TS (no React) — button / badge / card helpers; Radix runtime not required |
| Full shadcn CLI | **Not used** | No React tree; Tailwind + a11y markup achieves polish target |
| SW / manifest / icons | **Kept** | `public/sw.js`, `manifest.webmanifest`, icon-192/512 unchanged |
| Dev server | **Vite `:5174` · `host: true` · `strictPort: true`** | Binds `0.0.0.0` so both `localhost` and `127.0.0.1` return HTTP 200 (fixes ::1-only refusal) |

## Polish delivered

- Elder-first layout: large type (`text-elder*`), high contrast forest theme, Vietnamese headlines
- Verdict cards BLOCK/FLAG/ALLOW with color semantics + `aria-label` / focus rings / keyboard focus
- Sticky honesty strip: `detector: fixture` · `local-sw-stub` · Stripe TEST / SANDBOX
- Family Care pricing from `@bizmate/billing` `listPlans("shield")` + SANDBOX subscribe CTA
- Local notification button labeled **SW stub**
- Skip-link + section headings for a11y
- First paint no longer blocked on `serviceWorker.ready` (timeout + render-first)

## Dev / PWA how-to

```bash
npm run dev -w @bizmate/shield
# → http://localhost:5174/  and  http://127.0.0.1:5174/
# vite.config.ts: server.host: true, port: 5174, strictPort: true

npm run build -w @bizmate/shield && npm run preview -w @bizmate/shield
```

## Keep (non-negotiable — unchanged)

- Rule/blacklist engine deterministic — never LLM for risk
- Honesty banners (fixture detector · SW stub · sandbox Care)
- `@bizmate/contracts` + `@bizmate/billing` shared (no fork)
- CLI demo + vitest paths

## Prove commands

```bash
cd /workspace/bizmate
npm run test -w @bizmate/shield
npm run demo -w @bizmate/shield -- --once
npm run build -w @bizmate/shield   # tsc + vite PWA (Tailwind)
```

| Command | EXIT | Notes |
|---------|------|-------|
| `npm run test -w @bizmate/shield` | **0** | 24/24 |
| `npm run demo -w @bizmate/shield -- --once` | **0** | allow=1 flag=2 block=3 + BILLING honesty |
| `npm run build -w @bizmate/shield` | **0** | tsc + vite `web/dist/` with Tailwind CSS |

Evidence: `docs/review/runs/shield-ui-polish-52972a1.txt`  
Screenshot (optional): `docs/review/runs/shield-ui-polish-preview.png`

## Docs touched

- `apps/shield/web/**` — Tailwind + UI redesign + **vite `host: true` / `strictPort: true`**
- `apps/shield/package.json` — tailwindcss / postcss / autoprefixer
- `apps/shield/README.md` — UI polish + host note
- `docs/review/UI-POLISH.md` — Shield row Done (Adv claim)
- `docs/review/SHIELD-UI-POLISH.md` — this packet
