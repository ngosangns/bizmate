# BizMate Round-1 CONDITIONAL/FAIL fixes (2026-09-26)

> Adv · BizMate · Asia/Saigon. Addresses Kyle / Tuấn Anh / Lee / Sidharth GTM asks.
> CLI `mate:generate` / `judge` arg-forward was applied earlier in root `package.json` — preserved.

## Before → after (by judge item)

| Judge | Item | Before | After |
|-------|------|--------|-------|
| **Tuấn Anh** FAIL-as-hero | Pitch platform/Evoloop clone | Hero-shaped platform pitch | `PITCH-bizmate.md` ≤45s **meta**; stage hero = **accounting / Bà Lan only** |
| **Tuấn Anh / Kyle** | Web English JSON wall | Big workflow/verdict `<pre>` on first paint | VN story: persona Bà Lan, transcript, chips **Tạo→Chấm→Duyệt→Chạy**, score badge, Duyệt/Thu hồi, Reset seed; JSON in `<details>` only; `@media (max-width:480px)` |
| **Kyle** P0 | Progress + reset | No generating/judging/running | Staged UI timeouts + **Reset seed** |
| **Lee** | Audit approve/persist + version pin | White-box JSON only | `apps/runtime/src/audit.ts` in-memory + **JSONL** `apps/runtime/.audit/events.jsonl`; engine wires approve_ok/fail + persist_ok/fail; demo prints AUDIT SUMMARY; vitest coverage |
| **Lee** | EM money auto-done | `advancePolicy` allowed auto `done` on accounting | `touchesMoney` + force HITL when domain=accounting or title/tags money/ledger/tax; tests extended |
| **Sidharth** GTM | Who pays / week 2 / why VN | Skeleton | Pitch + this doc: **one vertical** seller-finance; WTP hypothesis (unmeasured); week-2 **10** users / metric candidates / rollback; Codex evidence counts below |
| **Son Lê / Sidharth** | Codex 60s proof | Vague | Real counts: git commits, `.scratch` cards, EM board tasks, `AGENTS.md` |

## Files changed (this Adv pass)

- `apps/web/src/main.ts`, `style.css`, `index.html` — story mode VN
- `apps/runtime/src/audit.ts` (new), `engine.ts`, `demo.ts`, `index.ts`, `__tests__/audit.test.ts`
- `apps/em/src/policy.ts`, `planner.ts`, `index.ts`, `__tests__/policy.test.ts`, planner test tweak
- `packages/contracts` EmTask optional `domain` / `tags`
- `docs/review/PITCH-bizmate.md`, `BIZMATE-FIX.md`, `runbooks/bizmate.md`
- `.gitignore` — `apps/runtime/.audit/`
- Root `package.json` — **not reverted**; keeps `node apps/*/dist/cli.js` arg forward

## GTM slide (Sidharth) — honest placeholders

1. **Vertical hero:** seller-finance accounting (Bà Lan / 1B threshold). Sales = backup domain in UI.
2. **Who pays / WTP:** Hypothesis only — Sea internal tooling **or** SME add-on. No invented ARR/conversion.
3. **Week-2 pilot:** 10 users; metric candidates `time-to-ledger` / gate error rate (baselines **TBD**); owner Adv · BizMate; rollback = unpin workflow version in registry.
4. **Why VN:** tax threshold 2026 local hook + builder talent.

## Codex evidence (real tree — do not invent)

| Evidence | Count / note |
|----------|----------------|
| `git rev-list --count HEAD` (pre this commit) | **4** commits on `main` |
| `.scratch/*.md` parallel task cards | **4** (`001-template` … `004-runtime`) |
| EM `apps/em/board.json` tasks | **10** (Mate→Judge→Human→Runtime→Web chain) |
| Constitution | `AGENTS.md` pillars + propose→verify→decide |
| Contracts-first | 3 Ajv schemas (`validate:contracts`) |

Commits visible at write time: `303584d` monorepo · `3ed08f7` judge roster · `77b8622` bookkeeper fix · *(plus this BizMate fix commit if landed)*.

## Prove

```bash
cd /workspace/bizmate
npm run validate:contracts
npm test -w @bizmate/core -w @bizmate/mate -w @bizmate/judge -w @bizmate/em -w @bizmate/runtime
npm run demo:offline
npm run build -w @bizmate/web
# optional CLI (after build mate/judge):
BIZMATE_MODE=offline npm run mate:generate -- --domain accounting
BIZMATE_MODE=offline npm run judge -- --file <path-from-generate>
```

### Success signals
- Web first paint ≠ JSON wall
- `demo:offline` EXIT 0, crossed 1B, AUDIT SUMMARY present
- EM: accounting/money task `canAutoAdvance(..., "done") === false`
- No claim of live tax/payment integrations

## Known gaps
- WTP / pilot metrics unmeasured
- Live SLM stub; no multi-tenant production registry
- Web progress states are simulated timeouts (offline demo)
