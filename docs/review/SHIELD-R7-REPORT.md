# Shield R7 REPORT — AI-OPS polish

> App: **apps/shield** · Seed tip: `45252f0` · PLAN: [SHIELD-R7-PLAN.md](./SHIELD-R7-PLAN.md)  
> Timezone: Asia/Saigon (ICT). R1–R6 review docs untouched.

## Before → after

| Area | Before (seed `45252f0`) | After |
|------|--------------------------|-------|
| Live mode labels | Sync emitted template with **"live hook chưa wire"** | Real hook shape: async tries `callLiveLlmStub`; **catch → offline_stub** + labeled **live fallback**. Sync live path uses same honest fallback meta (no `source: llm`). |
| API | Sync only | `draftAiExplanationAsync` / `triageAssistScoreAsync` / `attachAiDraftsAsync` + sync kept for tests/demo |
| PWA | Thin AI label | Badges: **AI đang đề xuất**, meta.labelVi, triage + **`overridesVerdict: false`** wall; honesty strip shows AI mode |
| CLI demo | Elder text only (rule copy) | AI-draft lines + triage score/labels per STEP |
| Product brief | Short R7 line | `BIZMATE_MODE=live` optional, fallback when live fails, **risk = rules** |
| Vitest | 3 cases | + live sync/async honest fallback; trust boundary action/risk unchanged |

## Tip SHA

**This polish tip:** `405023e`  
**Parent seed:** `45252f0`

## Prove commands (EXIT codes)

| Command | EXIT |
|---------|------|
| `npm run test -w @bizmate/shield` | **0** (30 tests / 3 files) |
| `npm run demo -w @bizmate/shield -- --once` | **0** |
| `npm run build -w @bizmate/shield` | **0** |
| `curl http://127.0.0.1:5174/` | **HTTP 200** |

Evidence logs: `docs/review/runs/shield-r7-test.txt`, `shield-r7-demo.txt`, `shield-r7-build.txt`, `shield-r7-http.txt`.

## Trust-boundary evidence

1. **Vitest** `attachAiDrafts keeps risk/action from rules` + live async: `bundled.action/risk` === pre-AI `judgeMessage` values; `triageAssist.overridesVerdict === false`.
2. **Live fallback honesty:** `draftAiExplanationAsync(..., "live")` → `meta.mode === "offline_stub"`, `meta.source === "template"` (not `llm`) when stub throws.
3. **CLI:** each STEP prints `overridesVerdict=false` and rule `action` unchanged vs AUDIT reasons.
4. **Engine tests untouched:** `shield.test.ts` 20 passed — rule/blacklist still sole owner of allow/flag/block.

## Files touched

- `apps/shield/src/ai-explain.ts`
- `apps/shield/src/__tests__/ai-explain.test.ts`
- `apps/shield/src/demo.ts`
- `apps/shield/web/src/main.ts`
- `docs/product/business/shield.md`
- `docs/review/SHIELD-R7-PLAN.md`
- `docs/review/SHIELD-R7-REPORT.md`
- `docs/review/runs/shield-r7-*.txt`

## Blockers

None for Shield R7 polish. Live LLM remains unconfigured by design (`callLiveLlmStub` throws → fallback).
