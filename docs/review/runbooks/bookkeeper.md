# Runbook — Bookkeeper (offline)

## Prep
```bash
cd /workspace/bizmate
npm install   # if needed
```

## Run
```bash
npm run demo:bookkeeper
```

Optional: `npm test -w @bizmate/bookkeeper`

No API key. Offline only.

## Success (exit 0)
1. Banner: Bà Lan — sạp vải chợ An Đông, YTD trước 980.000.000₫
2. Two small sales approve and raise YTD
3. Large sale → `⚠️ Vượt ngưỡng miễn thuế 1 tỷ — cần human approve`
4. YTD after ≈ 1.006.110.000₫
5. Tax Q&A: còn 0₫; “rule engine, không phải LLM”; Citations: ND-141-2026, LUAT-09-2026

## Key paths
- `apps/bookkeeper/src/{demo,agent,rules,parse-utterance}.ts`
- `apps/bookkeeper/fixtures/vendor-an-dong.json`
- `packages/core/src/money.ts` (1B threshold)

## Fix note
See `docs/review/BOOKKEEPER-FIX.md` if older judge packets still cite demo FAIL.
