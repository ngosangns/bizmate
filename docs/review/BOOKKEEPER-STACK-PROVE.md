# BOOKKEEPER-STACK-PROVE — STACK-REBUILD

> Adv · Bookkeeper · 2026-09-26 Asia/Saigon (ICT)

## Stack chosen

| Layer | Choice |
|-------|--------|
| UI | **Next.js App Router** |
| API | **Route Handlers + Server Actions** (not tRPC — less workspace friction) |
| Ledger | **better-sqlite3** (not Prisma — offline-first demo) |
| Voice→ledger | Regex stub, labeled offline |

Shared kept: `@bizmate/contracts` · `@bizmate/billing` · `@bizmate/core` money.

## Tip SHA

Pending commit — see git log after `feat(bookkeeper): STACK-REBUILD — Next.js App Router + SQLite ledger`.  
Baseline was `fd56e9a`.

## Prove commands (all EXIT 0)

```bash
cd /workspace/bizmate
npm run build -w @bizmate/contracts   # EXIT 0
npm run build -w @bizmate/billing     # EXIT 0
npm test -w @bizmate/bookkeeper       # EXIT 0 · 16 tests
npm run demo:bookkeeper -- --reset    # EXIT 0
npm run build -w @bizmate/bookkeeper  # EXIT 0 · Next production build
```

### Test summary
- `src/__tests__/bookkeeper.test.ts` — 10 tests (parse, threshold, HITL refuse, Ajv, idempotent verify, week-2 metrics, full demo lifecycle)
- `src/__tests__/ledger-hitl.test.ts` — 6 tests (SQLite seed/persist/reset, HITL refuse-before-approve, soft paywall honesty, screen state)

### Demo summary (`--reset`)
- ↺ RESET YTD 980.000.000₫ + SQLite `better-sqlite3 · offline`
- 3 Duyệt + 1 no-sale no-op + crossedThreshold on u3
- Final YTD 1.006.110.000₫
- WEEK-2 METRICS + AUDIT (`approve_rejected` · `approve_committed` · `idempotency_conflict`)
- Billing path: `stubCharge` + `createCheckout(stripe_test)` honesty · NEVER live

### Next build
- Routes: `/` (dynamic) · `/api/health` · App Router UI Bà Lan

## Paths changed (primary)
- `apps/bookkeeper/**` — rewrite in place (`@bizmate/bookkeeper`)
- `docs/review/BOOKKEEPER-BUSINESS.md` · `docs/review/runbooks/bookkeeper.md` · `docs/review/STACK-REBUILD.md` (Bookkeeper row)
- `docs/review/BOOKKEEPER-STACK-PROVE.md` (this file)
- Root `.gitignore` — `apps/bookkeeper/data/*.db`

## Honesty
- No live tax portal / SPX / payment gateway
- Stub/sandbox labeled in CLI + Next UI
