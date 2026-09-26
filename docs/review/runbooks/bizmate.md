# Biz Mate Round 1 runbook

## Offline run
```bash
cd /workspace/bizmate
npm run validate:contracts
npm test -w @bizmate/core -w @bizmate/mate -w @bizmate/judge -w @bizmate/em -w @bizmate/runtime
npm run demo:offline
npm run build -w @bizmate/mate
BIZMATE_MODE=offline npm run mate:generate -- --domain accounting
# note printed path, then:
npm run build -w @bizmate/judge
BIZMATE_MODE=offline npm run judge -- --file apps/mate/.registry/<workflow>.json
npm run build -w @bizmate/web
```

Root scripts call `node apps/*/dist/cli.js` so npm `--` args forward correctly.

Primary trust demo: `npm run demo:offline`

## Key paths
AGENTS.md; packages/contracts; packages/core; apps/mate|judge|em|runtime|web; domains/accounting/fixtures/vendor-day.json; apps/runtime/.audit/events.jsonl (JSONL audit)

## Success signals (demo:offline)
- without approval → FAIL human approval (`approve_fail` in AUDIT SUMMARY)
- with approval → ledger crosses 1B; `approve_ok` + `persist_ok`
- line: `demo PASSED`

## Web story
`npm run build -w @bizmate/web` then `npm run dev:web` — first paint = Bà Lan transcript + chips Tạo→Chấm→Duyệt→Chạy; JSON in `<details>`; Reset seed.

## Pitch
≤45s meta (how we build); stage hero = seller-finance accounting OR FloodOps; demo:offline = trust proof.
