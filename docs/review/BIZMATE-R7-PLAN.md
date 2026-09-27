# BizMate R7 PLAN (P0 map)

> Adv · BizMate-only · baseline `45252f0` · Orchestrator-only

| P0 | Action | Module |
|----|--------|--------|
| Mate live hook + meta | `generateWorkflowWithMeta` / evolve with `resolveAiMode` + `callLiveLlmStub` catch→stub | `apps/mate/src/ai-propose.ts` |
| Web AI badges | `AI đang đề xuất` / `đã verify` / zero-LLM runtime + honesty strip | `apps/web/src/hitl/ai-badges.ts` + ops-rail |
| Pitch honesty | Round 7 stub vs live · cite `packages/core/src/ai.ts` | `docs/product/business/bizmate.md` |
| Vitest trust | offline meta · live fallback · runtime no LLM imports · web badges | mate / runtime / web |
