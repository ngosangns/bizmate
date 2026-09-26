# BizMate — UI-POLISH prove

> Adv · BizMate · 2026-09-26 Asia/Saigon · P0 UI-POLISH  
> App: `@bizmate/web` (Vite SPA) · Protocol: `docs/review/UI-POLISH.md`

## Stack pick

| Lib | Role | Why |
|-----|------|-----|
| **Tailwind CSS 3** | Utility styling | Required by P0; works natively with Vite + PostCSS |
| **postcss** + **autoprefixer** | Build pipeline | Standard Tailwind Vite setup |
| **shadcn-style primitives** (hand-rolled) | Button · Card · Badge · Alert | `apps/web/src/ui/*` — class builders mirroring shadcn/ui patterns (CVA-like variants, focus rings, tokens) |
| **CSS variables** (shadcn dark zinc) | Design tokens | `--background` / `--primary` / `--ok` / `--warn` etc. — same pattern as shadcn `globals.css` |

### Why **not** React + shadcn CLI

1. **Stack already locked (STACK-REBUILD):** Vite + vanilla TypeScript SPA — story mode, HITL, billing panel all client-side fixtures. See `BIZMATE-STACK.md`.
2. **shadcn CLI targets React** (Radix React primitives). A React migrate on D-Day calendar risks breaking offline theater for zero domain win.
3. **Hand-roll matches protocol:** UI-POLISH explicitly allows “hand-roll Radix-based primitives matching shadcn patterns if CLI awkward.” We mirror visual + a11y (focus-visible rings, Alert roles) without React.
4. **Radix:** not installed as React deps; Alert/Badge/Button/Card APIs match shadcn class contracts so a future React port can swap 1:1.

## What changed

- Added Tailwind + PostCSS + Autoprefixer to `@bizmate/web`
- New `src/ui/{cn,button,badge,card,alert,index}.ts`
- Restyled story UI: typography, spacing, color system, focus states, mobile (`sm:` breakpoints)
- **Kept domain honesty:** Bà Lan persona, who-pays Sea, Giá panel, Stripe TEST / offline_stub banners, HITL Duyệt/Thu hồi/Chạy, audit metrics, Sales = backup domain label, EM money block line, blast-radius, seed badges
- Footer now labels: `stack: Vite + Tailwind + shadcn-style · Node runtime …`

## Unchanged (honesty / runtime)

- `@bizmate/billing` + `@bizmate/contracts` / `@bizmate/core` money path
- `runner.ts` / `samples.ts` logic
- No live payment / tax / frontier SLM claims
- Other apps (bookkeeper / shield / floodops) untouched

## Prove commands

```bash
npm run build -w @bizmate/web          # EXIT 0
npm run demo:offline                   # EXIT 0
# optional UI path for judges:
npm run dev:web                        # http://localhost:5173
```

## Judge path

Open `npm run dev:web` → story: Bà Lan → **Duyệt** → **Chạy sổ kế toán** → ledger above-fold + Giá panel honesty banners.

## Status

**Done (Adv claim)** — tip SHA filed in `UI-POLISH.md` BizMate row after push.
