# Bookkeeper fix — demo PASS (2026-09-26)

## What was broken
1. **JSON fixture** `apps/bookkeeper/fixtures/vendor-an-dong.json` used numeric separators (`980_000_000`) → `JSON.parse` crash.
2. **`commitApproved`** created a fresh `createProposal(...)` (status `draft`) then called `markApproved` → `Can only approve a verified proposal`.
3. Demo never reached the 1B threshold hero moment (sales too small vs YTD).

Earlier Round-1 judge notes (Tuấn Anh / Kyle / Lee) citing demo FAIL refer to this pre-fix tree.

## What changed
| Path | Change |
|------|--------|
| `apps/bookkeeper/fixtures/vendor-an-dong.json` | Plain ints; added u3 sale that crosses 1B |
| `apps/bookkeeper/src/agent.ts` | `commitApproved` accepts verified proposal only; refuse draft |
| `apps/bookkeeper/src/demo.ts` | Pass verified proposal into commit; keep HITL narrative |
| `apps/bookkeeper/src/__tests__/bookkeeper.test.ts` | +approve-persist + refuse-draft (4 tests) |

Money threshold still from code: `packages/core/src/money.ts` → `EXEMPTION_THRESHOLD_VND = 1_000_000_000` (not LLM).

## Prove
```bash
cd /workspace/bizmate
npm test -w @bizmate/bookkeeper   # 4/4
npm run demo:bookkeeper           # exit 0
```

### Success signals
- YTD 980.000.000₫ → … → u3 flags `⚠️ Vượt ngưỡng miễn thuế 1 tỷ`
- After approve: YTD **1.006.110.000₫**
- Tax Q&A cites `ND-141-2026`, `LUAT-09-2026`; numbers from rule engine

Runbook: `docs/review/runbooks/bookkeeper.md`  
Orchestrator re-run log: `docs/review/runs/demo-bookkeeper.log` (EXIT:0)

## Known gaps (not blockers for re-score)
- Parse utterance = regex stub (no real ASR)
- No live e-invoice / tax portal (intentional)
- Approve step scripted in CLI demo
