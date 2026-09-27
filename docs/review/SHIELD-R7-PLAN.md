# Shield R7 PLAN — AI-OPS polish

> Round 7 Adv plan for **apps/shield**. Canonical seed: `45252f0`.  
> R1–R6 review docs are **read-only**. Risk/action/allow/flag/block owned **only** by rule/blacklist engine.

## Non-negotiable trust boundary

| Owned by | Never owned by LLM/AI |
|----------|------------------------|
| `judgeMessage` → `action` / `risk` / reasons | Changing allow / flag / block |
| Blacklist + script patterns + human override | Overriding triage into verdict |
| Caregiver HITL override | Invented “live” LLM text offline |

AI may: draft elder/family explanation copy; emit advisory triage score with `overridesVerdict: false`.

## Must-fix → files

| Gap | File(s) | Change |
|-----|---------|--------|
| Live hook shape + honest fallback | `apps/shield/src/ai-explain.ts` | Try `callLiveLlmStub` on async path; catch → offline template + `offline_stub` / live-fallback labels. Sync path stays offline-deterministic for tests/demo. |
| Prefer async API | same | Add `draftAiExplanationAsync`, `triageAssistScoreAsync`, `attachAiDraftsAsync`; keep sync exports. |
| PWA badges + honesty | `apps/shield/web/src/main.ts` | Badges: `AI đang đề xuất`, AI-draft stub / meta.labelVi, triage score + `overridesVerdict: false` wall; mode strip (`offline_stub` / live-fallback). |
| Product honesty | `docs/product/business/shield.md` | R7: `BIZMATE_MODE=live` optional; fallback when live fails; risk = rules. |
| Vitest trust + live fallback | `apps/shield/src/__tests__/ai-explain.test.ts` | action/risk unchanged; live falls back without `source===llm`; offline always drafts. |
| CLI AI lines | `apps/shield/src/demo.ts` | Print AI-draft + triage labels via `attachAiDrafts`. |
| Evidence / report | `docs/review/SHIELD-R7-REPORT.md`, `docs/review/runs/shield-r7-*.txt` | Before/after, tip SHA, prove EXIT codes. |

## Pattern reference

- Core: `packages/core/src/ai.ts` — `callLiveLlmStub`, `createAiMeta`, `resolveAiMode`
- Sibling: `apps/bookkeeper/src/lib/ai-ledger-proposer.ts` — live try/catch → offline stub meta

## Prove (EXIT 0)

```bash
npm run test -w @bizmate/shield
npm run demo -w @bizmate/shield -- --once
npm run build -w @bizmate/shield
# prefer: curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5174/
```

## Out of scope

- Other apps’ WIP (leave unstaged)
- Editing R1–R6 review docs
- Breaking rule-engine tests / inventing live LLM responses offline
