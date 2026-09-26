# Bookkeeper — UI-POLISH + R4 build-race prove

> Adv · Bookkeeper · 2026-09-26 Asia/Saigon · P0 UI-POLISH + Son Lê R4 CONDITIONAL  
> App: `@bizmate/bookkeeper` (Next App Router + SQLite) · Protocol: `docs/review/UI-POLISH.md`  
> Feat tip: **`53c147f`**

## Stack pick

| Lib | Role |
|-----|------|
| **Tailwind CSS 3** + postcss + autoprefixer | Utility styling · `tailwind.config.ts` content `./src/**/*.{ts,tsx}` |
| **clsx** + **tailwind-merge** | `src/lib/utils.ts` → `cn()` at `@/lib/utils` (**created before** UI imports) |
| **class-variance-authority** + **@radix-ui/react-slot** / **separator** | shadcn-style Button/Badge/Separator |
| **Hand-rolled Progress** | No `@radix-ui/react-progress` (avoids orphan dep) |
| **Card / Alert / Textarea** | `src/components/ui/*` |

## Race fix (Son R4 must-fix)

| Item | Detail |
|------|--------|
| Root cause | ENV `next dev --port 3010` and `next build` both used `.next/` → `pages-manifest` / `next-font-manifest` ENOENT after “Compiled successfully” |
| Fix | `distDir: process.env.BIZMATE_NEXT_DIST \|\| ".next"` · build/start set `BIZMATE_NEXT_DIST=.next-build` · `.gitignore` `.next-build/` |
| Dev | Unchanged default `.next` for hot reload |

## UI redesign (kept domain)

- HITL **Duyệt** / **Từ chối** (large buttons)
- YTD + 1B **Progress** bar
- Proposal card + threshold Alert
- Free / Pro fixture + honesty Alert (sandbox/stub only)
- Vietnamese Bà Lan · Sạp An Đông
- Domain lib / SQLite / CLI demo unchanged

## Prove commands (EXIT 0)

```bash
rm -rf apps/bookkeeper/.next-build   # optional; build script already rm -rf
npm run build -w @bizmate/bookkeeper # MUST EXIT 0 (isolated .next-build)
npm test -w @bizmate/bookkeeper      # 16/16
npm run demo:bookkeeper -- --reset   # EXIT 0
npm run start -w @bizmate/bookkeeper
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3010/   # 200
```

### Observed (this tip)

| Check | Result |
|-------|--------|
| build | EXIT **0** · `.next-build/BUILD_ID` present |
| test | EXIT **0** · 16/16 |
| demo --reset | EXIT **0** |
| start + curl `/` | **HTTP 200** · markers: Sạp An Đông · Duyệt · Từ chối · YTD · Free/Pro |
| start + curl `/api/health` | **HTTP 200** |

## Status

**Done (Adv claim)** — tip `53c147f` · Son REPORT: `BOOKKEEPER-R4-REPORT-SON.md` · matrix stamp in `UI-POLISH.md`.
