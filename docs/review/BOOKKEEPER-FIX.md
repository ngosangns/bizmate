# Bookkeeper fix — demo PASS (2026-09-26)

## What was broken
1. **JSON fixture** `apps/bookkeeper/fixtures/vendor-an-dong.json` used numeric separators (`980_000_000`) → `JSON.parse` crash.
2. **`commitApproved`** created a fresh `createProposal(...)` (status `draft`) then called `markApproved` → `Can only approve a verified proposal`.
3. Demo never reached the 1B threshold hero moment (sales too small vs YTD).

Earlier Round-1 judge notes (Tuấn Anh / Kyle / Lee) citing demo FAIL refer to this pre-fix tree.

## What changed (round-1 base)
| Path | Change |
|------|--------|
| `apps/bookkeeper/fixtures/vendor-an-dong.json` | Plain ints; added u3 sale that crosses 1B; + “hôm nay không bán” |
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
| **Kyle** HITL + `--reset` | Explicit “Từ chối ghi sổ khi chưa Duyệt” then “Người duyệt: Bà Lan → Duyệt”; `npm run demo:bookkeeper -- --reset` |
| **Sidharth** buyer/pricing | README + demo one-liner: hộ KD chợ / freemium→paid near 1B (hypothesis) |
| **Sidharth** refuse path | Non-negotiable: every step attempts draft persist → refuse, then Duyệt |

### Week-2 metrics (hypothesis on this seed — counted in demo)
Printed by `runDemoOnce` via `buildWeek2SeedMetrics` / `formatWeek2SeedMetricsBlock`:
- `approveCount` — số lần Duyệt
- `refuseBeforeDuyetCount` — số lần Từ chối-before-Duyệt
- `thresholdWarningCount` — số lần cảnh báo gần/vượt 1B
- `citationHits` — citation id occurrences shown
- `finalYtdVnd` — YTD final
- `remainingExemptionVnd` — YTD gap to 1B
Do **not** treat as production KPIs / on-call.

### Buyer + pricing hypothesis
- Buyer: hộ kinh doanh chợ / SME VN.
- Pricing: freemium nhật ký → paid when near 1B threshold or kê khai needs.
- Soft paywall: **Pro kê khai** fixture copy when `crossedThreshold` (CLI + mobile UI) — no live billing.
- Honest: no fake ARPU.

### Week-2 distribution (ONE channel — Sid-K3 / TA-K3)
**Nhóm tiểu thương chợ An Đông** — peer trust, low CAC, matches Bà Lan persona. Not đại lý thuế / Shopee Academy for this pilot.

### Codex / deterministic evidence
- Money never from LLM: `packages/core/src/money.ts`
- Ledger math: `apps/bookkeeper/src/rules.ts`
- Contracts: `packages/contracts/schemas/ledger-proposal.v0.1.schema.json`
- Tests: `apps/bookkeeper/src/__tests__/bookkeeper.test.ts`
- Scratch: `.scratch/bookkeeper-001.md`, `.scratch/bookkeeper-002.md`

## Fail → fix git beat (Son-K2/K3)

| Beat | SHA / note |
|------|------------|
| **Fail** | Fixture numeric separators + `commitApproved` on draft → demo crash / never 1B |
| **Fix** | `77b8622` `fix(bookkeeper): demo PASS — verified approve + JSON fixture + 1B hero` |
| **Honesty** | Parse utterance = **regex stub** (offline) — labeled in demo + README; not ASR |

## Domain K1–K4 (+ Sid / Lee / TA / Kyle / Son fold-ins)

| ID | Item | Status |
|----|------|--------|
| K1 / TA-K1 | Mobile VN one-screen `ui/index.html` — Sạp An Đông · YTD · Từ chối/Duyệt · cảnh báo 1B | Done |
| K2 / Lee-K1 | Richer e-invoice fixture + citation đoạn/excerpt surfaced in CLI | Done |
| K3 / Sid-K1 | Week-2 seed metrics block (Duyệt, Từ chối-before-Duyệt, 1B warns, citation hits, YTD gap) | Done |
| K4 | Codex scratch bookkeeper-001/002 + split commits | Done |
| Sid-K2 | Soft paywall **Pro kê khai** when crossedThreshold (CLI + UI) | Done |
| Sid-K3 / TA-K3 | ONE channel: nhóm tiểu thương chợ An Đông | Done |
| Lee-K2 | `approve_rejected` audit trail (in-memory) printed at demo end | Done |
| Lee-K3 | Idempotent re-ingest / sửa sai — same id different amounts → reject (demo + test) | Done |
| TA-K2 | “hôm nay không bán” no-op + sửa sai path | Done |
| Kyle-K1 | Each step 3 BIG lines: Đề xuất / Từ chối / Duyệt | Done |
| Kyle-K2/K3 | PAUSE beat at 1B; `--reset` header at TOP | Done |
| Son-K1 | `.scratch/bookkeeper-001.md` acceptance checklist | Done |
| Son-K2/K3 | Fail→fix `77b8622` + regex stub honesty | Done |

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
- YTD 980.000.000₫ → … → u3 flags cảnh báo vượt ngưỡng 1 tỷ + Pro kê khai
- HITL + audit `approve_rejected` then Duyệt
- “hôm nay không bán” → no-op
- Sửa sai / Idempotency reject line
- After approve: YTD **1.006.110.000₫**; remainingExemption 0
- WEEK-2 METRICS + AUDIT blocks
- Tax Q&A + HĐ điện tử + đoạn citation
- Mobile UI offline demo labeled

Runbook: `docs/review/runbooks/bookkeeper.md`

## Known gaps (not blockers)
- Parse utterance = regex stub (no real ASR)
- No live e-invoice / tax portal (intentional)
- Approve step scripted in CLI demo (HITL labeled, not silent)
- Soft paywall = fixture copy only (no billing)
