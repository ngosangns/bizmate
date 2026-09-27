# FLOODOPS-R7-PLAN — AI-OPS P0 polish

> App: `apps/floodops` · port `:3011` · baseline tip `45252f0`  
> Rubric: [ROUND-7-AI-OPS](./ROUND-7-AI-OPS.md) · [AI-OPS-REQUIREMENTS](../product/AI-OPS-REQUIREMENTS.md)  
> Scope: `ai-ops-advisor` live gate + safe fallback · UI honesty badges · vitest trust boundary.  
> Out of scope: other apps · rewriting R1–R6 docs · live SPX / payment.

## P0 → files

| P0 | Gap vs seed `45252f0` | Files |
|----|----------------------|-------|
| **A4 Live hook readiness** | Sync-only advisor; live mode soft-label “hook chưa wire”, no `callLiveLlmStub` | `src/ai-ops-advisor.ts` |
| **A2 Trust boundary** | Offline tests exist; need live→fallback + refund still HUMAN lock | `src/__tests__/ai-ops-advisor.test.ts` |
| **A3 Offline stub honesty** | Thin “AI advice · label” | `web/components/OrdersTable.tsx` |
| **A5 Product clarity** | Round 7 brief thin on live gate + Engine/AI/human split | `docs/product/business/floodops.md` |
| **A1 Presence** | Advisor already next to engine action (seed) — keep + clearer badges | (same UI) |

## Trust pattern (lock)

```
Engine COD/SLA policy → AI rationale (+ optional alternate, never auto) → human Duyệt hoàn
```

- Default / UI sync: `adviseReplan` = offline fixture.
- `BIZMATE_MODE=live` → `adviseReplanAsync` tries `callLiveLlmStub`; on throw → labeled offline_stub (`fallbackUsed`, no `modelId`, `source ≠ llm`).
- COD / refund / SLA decisions stay engine + human — AI never flips `propose_refund` status.

## Prove

1. `npm test -w @bizmate/floodops`
2. `npm run demo:floodops`
3. `npm run build:web -w @bizmate/floodops`
4. `:3011` → HTTP **200**

## Deliverables

- This PLAN (parity with peers; soft Orchestrator note)
- Implementation tip **`f0079bf`**
- `docs/review/FLOODOPS-R7-REPORT.md` stamp **`09fbc9e`**

## Status

**Shipped** · PASS_VERIFY GREEN Orchestrator · tip `f0079bf` · stand-by for judge pass#1 / CONDITIONAL.
