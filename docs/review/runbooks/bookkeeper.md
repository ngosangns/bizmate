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
```

Optional:
```bash
npm test -w @bizmate/bookkeeper
npm run validate:contracts
```

No API key. Offline only.

## Success (exit 0)
1. Banner: Bà Lan — sạp vải chợ An Đông, YTD hiện tại 980.000.000₫
2. Buyer one-liner (hypothesis freemium→paid) visible
3. Each bước: `Bạn nói:` → `Đề xuất ghi sổ:` → **HITL** `Từ chối ghi sổ khi chưa Duyệt` → `Người duyệt: Bà Lan → Duyệt` → `Đã duyệt · YTD mới`
4. Large sale → cảnh báo vượt ngưỡng miễn thuế 1 tỷ (tiếng Việt)
5. YTD after ≈ 1.006.110.000₫
6. Tax Q&A: còn 0₫; “rule engine, không phải LLM”; `Căn cứ:` titles (ND / Luật demo)
7. With `--reset`: line `↺ Reset seed · YTD về 980.000.000₫` then full story again

## Week-2 metrics (planned, not live)
% parsed · time-to-approve · threshold alerts acknowledged — see BOOKKEEPER-FIX.md.

## Key paths
- `apps/bookkeeper/src/{demo,agent,rules,parse-utterance}.ts`
- `apps/bookkeeper/fixtures/vendor-an-dong.json`
- `packages/core/src/money.ts` (1B threshold)
- `packages/contracts/schemas/ledger-proposal.v0.1.schema.json`

## Fix note
See `docs/review/BOOKKEEPER-FIX.md` if older judge packets still cite demo FAIL.
