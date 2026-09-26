# Runbook — Bookkeeper (STACK-REBUILD · Next + SQLite)

## Prep
```bash
cd /workspace/bizmate
npm install   # if needed
npm run build -w @bizmate/contracts   # after schema / pull
npm run build -w @bizmate/billing
# npm run build -w @bizmate/core      # if money helpers changed
```

## Stack
- **Next.js App Router** + **Route Handlers** + **Server Actions** (HITL Duyệt / Từ chối)
- **better-sqlite3** ledger at `apps/bookkeeper/data/bookkeeper.db` (gitignored)
- Not tRPC / not Prisma (workspace friction)

## Run
```bash
npm run demo:bookkeeper
npm run demo:bookkeeper -- --reset    # ↺ reload seed YTD 980tr + wipe SQLite + full story
npm run demo:ui -w @bizmate/bookkeeper   # Next dev :3010
npm run dev -w @bizmate/bookkeeper
```

Optional:
```bash
npm test -w @bizmate/bookkeeper
npm run build -w @bizmate/bookkeeper
npm run validate:contracts
```

No API key. Offline only. No live tax / e-invoice portal.

## Success (exit 0)
1. Banner: Bà Lan — sạp vải chợ An Đông, YTD hiện tại 980.000.000₫
2. Buyer one-liner + **Week-2 kênh: nhóm tiểu thương chợ An Đông**
3. Each sale bước: `Bạn nói:` → `Đề xuất` → **HITL** `Từ chối` (unverified draft) → `Người duyệt Bà Lan → Duyệt` → `Đã duyệt · YTD mới`
4. “hôm nay không bán” → no-op (không ghi sổ)
5. Large sale → cảnh báo 1B + **Pro kê khai** soft paywall (fixture)
6. Sửa sai / idempotent: same id different amounts → reject
7. YTD after ≈ 1.006.110.000₫
8. Tax Q&A + e-invoice summary + citation **đoạn/excerpt**
9. **WEEK-2 METRICS (hypothesis on this seed)**
10. **AUDIT**: at least one `approve_rejected` + `approve_committed` + `idempotency_conflict`
11. `--reset`: `↺ RESET (top) · seed YTD về 980.000.000₫` + SQLite line
12. SQLite: `better-sqlite3 · offline` persisted line

## Week-2 metric names (seed counts — not production KPIs)
- `approveCount` / số lần Duyệt
- `refuseBeforeDuyetCount` / số lần Từ chối-before-Duyệt
- `thresholdWarningCount` / số lần cảnh báo gần/vượt 1B
- `citationHits`
- `finalYtdVnd` / YTD final
- `remainingExemptionVnd` / YTD gap to 1B

## Key paths
- `apps/bookkeeper/src/lib/{demo,agent,rules,parse-utterance,metrics,audit,ledger-db,session}.ts`
- `apps/bookkeeper/src/actions/hitl.ts` — server actions
- `apps/bookkeeper/src/app/` — Next UI + `/api/health`
- `apps/bookkeeper/data/bookkeeper.db` — SQLite (gitignored)
- `apps/bookkeeper/fixtures/{vendor-an-dong,e-invoice-sample,pro-ke-khai-upsell}.json`
- `packages/core/src/money.ts` (1B threshold)
- `packages/contracts/schemas/ledger-proposal.v0.1.schema.json`

## Fix note
See `docs/review/BOOKKEEPER-FIX.md`. Prove: `docs/review/BOOKKEEPER-STACK-PROVE.md`.
