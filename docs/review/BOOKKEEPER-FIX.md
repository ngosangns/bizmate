# Bookkeeper fix — demo PASS (2026-09-26)

## What was broken
1. **JSON fixture** `apps/bookkeeper/fixtures/vendor-an-dong.json` used numeric separators (`980_000_000`) → `JSON.parse` crash.
2. **`commitApproved`** created a fresh `createProposal(...)` (status `draft`) then called `markApproved` → `Can only approve a verified proposal`.
3. Demo never reached the 1B threshold hero moment (sales too small vs YTD).

Earlier Round-1 judge notes (Tuấn Anh / Kyle / Lee) citing demo FAIL refer to this pre-fix tree.

## What changed (round-1 base)
| Path | Change |
|------|--------|
| `apps/bookkeeper/fixtures/vendor-an-dong.json` | Plain ints; added u3 sale that crosses 1B |
| `apps/bookkeeper/src/agent.ts` | `commitApproved` accepts verified proposal only; refuse draft |
| `apps/bookkeeper/src/demo.ts` | Pass verified proposal into commit; keep HITL narrative |
| `apps/bookkeeper/src/__tests__/bookkeeper.test.ts` | +approve-persist + refuse-draft |

Money threshold still from code: `packages/core/src/money.ts` → `EXEMPTION_THRESHOLD_VND = 1_000_000_000` (not LLM).

## Round-1 remaining (Lee / Tuấn Anh / Son / Kyle / Sidharth)

| Ask | Done |
|-----|------|
| **Lee** Ajv + idempotent verify | `ledger-proposal.v0.1.schema.json` + `validateLedgerProposal`; verify before `markVerified`; fail → `markRejected`; same id+payload no-op; conflict → reject; `commitApproved` re-`assertValid` |
| **Tuấn Anh** VN story UI | `demo.ts` Vietnamese cards for Bà Lan — no JSON wall; citations by **title** under “Căn cứ:” |
| **Son** lifecycle + schema tests | vitest `runDemoOnce` E2E + Ajv good/bad + idempotency |
| **Kyle** HITL + `--reset` | Explicit “Từ chối ghi sổ khi chưa Duyệt” then “Người duyệt: Bà Lan → Duyệt”; `npm run demo:bookkeeper -- --reset` prints `↺ Reset seed · YTD về …` |
| **Sidharth** buyer/pricing | README + demo one-liner: hộ KD chợ / freemium→paid near 1B (hypothesis) |
| **Sidharth** refuse path | Non-negotiable: every step attempts draft persist → refuse, then Duyệt |
| **Sidharth** week-2 metrics | Named below as **planned** (no invented live numbers) |
| **Sidharth** Codex evidence | Deterministic path: `packages/core/src/money.ts`, `apps/bookkeeper/src/rules.ts`, tests, this commit |

### Week-2 metrics (planned — hypothesis only)
- % utterances parsed successfully (regex stub → better ASR later)
- Time-to-approve (human Duyệt latency)
- Crossed-threshold alerts acknowledged / Duyệt rate
- Do **not** invent live numbers until measured.

### Buyer + pricing hypothesis
- Buyer: hộ kinh doanh chợ / SME VN.
- Pricing: freemium nhật ký → paid when near 1B threshold or kê khai needs.
- Honest: no fake ARPU.

### Codex / deterministic evidence
- Money never from LLM: `packages/core/src/money.ts` (`EXEMPTION_THRESHOLD_VND`, `crossesExemption`).
- Ledger math: `apps/bookkeeper/src/rules.ts` (`proposeLedgerEntry`).
- Contracts: `packages/contracts/schemas/ledger-proposal.v0.1.schema.json` + Ajv in verify/persist.
- Tests: `apps/bookkeeper/src/__tests__/bookkeeper.test.ts` (lifecycle + schema + idempotency).
- Commit message: `feat(bookkeeper): Ajv ledger schema, HITL+reset demo, VN story UI`.

## Prove
```bash
cd /workspace/bizmate
npm run build -w @bizmate/contracts
npm run validate:contracts
npm test -w @bizmate/bookkeeper
npm run demo:bookkeeper
npm run demo:bookkeeper -- --reset
```

### Success signals
- YTD 980.000.000₫ → … → u3 flags cảnh báo vượt ngưỡng 1 tỷ
- HITL lines: `Từ chối ghi sổ khi chưa Duyệt` then `Người duyệt: Bà Lan → Duyệt` then `Đã duyệt · YTD mới`
- After approve: YTD **1.006.110.000₫**
- `--reset`: `↺ Reset seed · YTD về 980.000.000₫`
- Tax Q&A: “Căn cứ:” titles (not raw JSON); numbers from rule engine
- `validate:contracts` includes `ledger-proposal.v0.1.schema.json`

Runbook: `docs/review/runbooks/bookkeeper.md`

## Known gaps (not blockers for re-score)
- Parse utterance = regex stub (no real ASR)
- No live e-invoice / tax portal (intentional)
- Approve step scripted in CLI demo (HITL labeled, not silent)
