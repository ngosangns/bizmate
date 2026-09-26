# bookkeeper-001 — Ajv ledger-proposal + HITL refuse path

## What to build
Bookkeeper verify path: Ajv-validate `ledger-proposal.v0.1` before `markVerified`; fail → `markRejected`; idempotent same id+payload; conflict → reject. HITL: every demo step refuses draft persist then human Duyệt. Money still from `packages/core/src/money.ts` (1B), never LLM.

## Owner
runtime (Bookkeeper) · human Duyệt in demo

## Acceptance checklist
- [x] Ajv `validateLedgerProposal` on verify + `assertValid` on `commitApproved`
- [x] Idempotent verify: same id+payload no-op; different payload → reject
- [x] `commitApproved` refuses non-verified / draft
- [x] CLI demo: `▶ TỪ CHỐI` then `▶ DUYỆT` (Kyle BIG 3 lines with `▶ ĐỀ XUẤT`)
- [x] Fixture plain ints; u3 crosses 1B hero + PAUSE beat
- [x] `--reset` prints reset header at TOP of run
- [x] Tests: lifecycle + schema good/bad + idempotency + refuse-draft
- [x] Contracts validate; `npm test -w @bizmate/bookkeeper` green; `demo:bookkeeper` exit 0
- [x] No live tax / e-invoice API
- [x] Fail→fix documented: `77b8622` (JSON crash + draft-approve) → green demo

## Blocked by
- none

## HITL vs AFK
- Mode: AFK for code; HITL = human Duyệt before ledger persist (scripted in CLI)
- Money path: propose → verify (Ajv) → refuse draft → Duyệt → commit

## Fail → fix git beat (Son)
1. **Fail:** fixture `980_000_000` separators → `JSON.parse` crash; `commitApproved` on draft → verify error; demo never crossed 1B.
2. **Fix commit:** `77b8622` — `fix(bookkeeper): demo PASS — verified approve + JSON fixture + 1B hero`
3. **Now:** domain K1–K4 + Sid/Lee/TA/Kyle/Son fold-ins on green base.

## Merge cadence
- Branch: bookkeeper commit(s) on main — no force-push
- Reviewer: Adv · Bookkeeper
- Done: tests + `npm run demo:bookkeeper` (+ `--reset`) exit 0

## Notes
- Citations shown by title under “Căn cứ:”, not JSON dump.
- Parse = regex stub honesty (README + demo banner).
- See `docs/review/BOOKKEEPER-FIX.md`.
