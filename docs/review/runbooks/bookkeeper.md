# Runbook — Bookkeeper (offline)

## Prep
```bash
cd /workspace/bizmate
npm install   # if needed
npm run build -w @bizmate/contracts   # after schema changes
```

## Run
```bash
npm run demo:bookkeeper
npm run demo:bookkeeper -- --reset    # ↺ reload seed YTD 980tr + full story
npm run demo:ui -w @bizmate/bookkeeper
# or open apps/bookkeeper/ui/index.html / npx serve apps/bookkeeper/ui
```

Optional:
```bash
npm test -w @bizmate/bookkeeper
npm run validate:contracts
```

No API key. Offline only. No live tax / e-invoice portal.

## Success (exit 0)
1. Banner: Bà Lan — sạp vải chợ An Đông, YTD hiện tại 980.000.000₫
2. Buyer one-liner + **Week-2 kênh: nhóm tiểu thương chợ An Đông**
3. Each sale bước: `Bạn nói:` → `Đề xuất ghi sổ:` → **HITL** `Từ chối ghi sổ khi chưa Duyệt` → `Người duyệt: Bà Lan → Duyệt` → `Đã duyệt · YTD mới`
4. “hôm nay không bán” → no-op (không ghi sổ)
5. Large sale → cảnh báo 1B + **Pro kê khai** soft paywall (fixture)
6. Sửa sai / idempotent: same id different amounts → reject
7. YTD after ≈ 1.006.110.000₫
8. Tax Q&A + e-invoice summary + citation **đoạn/excerpt**
9. **WEEK-2 METRICS (hypothesis on this seed)**: Duyệt · Từ chối-before-Duyệt · cảnh báo 1B · citation hits · YTD final · remainingExemption
10. **AUDIT**: at least one `approve_rejected` + `approve_committed` + `idempotency_conflict`
11. `--reset`: `↺ Reset seed · YTD về 980.000.000₫`

## Week-2 metric names (seed counts — not production KPIs)
- `approveCount` / số lần Duyệt
- `refuseBeforeDuyetCount` / số lần Từ chối-before-Duyệt
- `thresholdWarningCount` / số lần cảnh báo gần/vượt 1B
- `citationHits`
- `finalYtdVnd` / YTD final
- `remainingExemptionVnd` / YTD gap to 1B

## Key paths
- `apps/bookkeeper/src/{demo,agent,rules,parse-utterance,metrics,audit}.ts`
- `apps/bookkeeper/ui/index.html`
- `apps/bookkeeper/fixtures/{vendor-an-dong,e-invoice-sample,pro-ke-khai-upsell}.json`
- `packages/core/src/money.ts` (1B threshold)
- `packages/contracts/schemas/ledger-proposal.v0.1.schema.json`

## Fix note
See `docs/review/BOOKKEEPER-FIX.md`.
