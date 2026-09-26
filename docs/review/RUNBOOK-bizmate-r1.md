# Biz Mate Round 1 runbook (from Adv · BizMate)

## Offline run
```bash
cd /workspace/bizmate
npm run validate:contracts
npm test -w @bizmate/core -w @bizmate/mate -w @bizmate/judge -w @bizmate/em -w @bizmate/runtime
npm run demo:offline

# After: npm run build -w @bizmate/mate && npm run build -w @bizmate/judge
# Root scripts call dist CLIs directly (args after `--` forward correctly):
BIZMATE_MODE=offline npm run mate:generate -- --domain accounting
BIZMATE_MODE=offline npm run judge -- --file apps/mate/.registry/<wf>.json
# Equivalent: node apps/mate/dist/cli.js generate --domain accounting
#             node apps/judge/dist/cli.js --file <wf.json>

npm run build -w @bizmate/web   # or: npm run dev:web
```
Primary: `npm run demo:offline`

## Key paths
AGENTS.md; packages/contracts; packages/core; apps/mate|judge|em|runtime|web; domains/accounting/fixtures/vendor-day.json

## Success signals (demo:offline)
without approval → FAIL human approval; with approval → ledger crosses 1B; demo PASSED

## CLI success signals
- mate:generate → `"ok": true` + registry path
- judge on that file → `"passed": true` (score 100 offline template)
- missing-approve fixture → passed false / exit 1

## Known gaps
Prep skeleton; SLM stub; no multi-tenant; web polish in progress (Kyle CONDITIONAL)
