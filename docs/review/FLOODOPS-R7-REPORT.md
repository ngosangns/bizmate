# FLOODOPS-R7-REPORT — Adv polish (AI ops advisor live hook + honesty)

> Round 7 AI-OPS · FloodOps · Adv polish for Orchestrator  
> Round opened tip: `45252f0` · This report tip: **`f0079bf`**  
> Time: 2026-09-27 ~12:32 ICT (Asia/Saigon)

## Before → After

| Area | Before (seed `45252f0`) | After (this tip) |
|------|-------------------------|------------------|
| Live hook | Sync `adviseReplan` only; live mode → soft label “hook chưa wire”, no `callLiveLlmStub` | `adviseReplanAsync` gated by `BIZMATE_MODE=live`; tries `@bizmate/core` `callLiveLlmStub`; on throw → offline fixture + `fallbackUsed: true` |
| Honesty on fallback | N/A | `meta.mode` stays `offline_stub`; `source=fixture`; no `modelId`; label `AI đề xuất (stub offline · live fallback)` |
| Sync path | Offline fixture for UI/tests | Unchanged contract — UI/tests keep `adviseReplan` offline (never invents live traffic) |
| UI badges | Plain “AI advice · {labelVi}” | Badge `AI đang đề xuất` + `meta.labelVi` + trust-split “Engine quyết · AI giải thích · hoàn = human”; COD≠invoice footer kept |
| Brief | Thin Round 7 note | Live-hook + trust boundary + SANDBOX/STUB / COD≠invoice / no live SPX |
| Vitest | 2 cases (offline rationale + wave) | + live fallback · offline async · propose_refund requiresHuman · UI badge exports · existing FO suite green |

## Tip SHA

- Round open: `45252f0` (`feat(ai-ops): Round 7 seed — AI propose scaffolds + docs for all apps`)
- **Polish tip:** `f0079bf` — `fix(floodops): R7 AI ops advisor live hook + honesty badges`

## Prove (EXIT codes)

| Command | EXIT | Notes |
|---------|------|-------|
| `npm test -w @bizmate/floodops` | **0** | 2 files · **33** tests · `ai-ops-advisor.test.ts` 6/6 · `floodops.test.ts` 27/27 |
| `npm run demo:floodops` | **0** | Offline fixture wave; HUMAN refund + AUTO holds; no live SPX |
| `npm run build -w @bizmate/floodops` | **0** | `tsc` |
| `npm run build:web -w @bizmate/floodops` | **0** | Next 15 production build (retry after concurrent `.next` race) |
| `:3011` HTTP | **200** | Brief `next start -p 3011` after prod build; HTML shows `AI đang đề xuất`, trust-split, `AI-advisor`, COD≠invoice |

## Live path (documented)

```text
BIZMATE_MODE != live  →  adviseReplanAsync → offline fixture (fallbackUsed=false)
BIZMATE_MODE = live   →  callLiveLlmStub(...)
                          ├ success (future provider) → still offline draft today (parser not wired) + fallback label
                          └ throw (this build)        → offline fixture + label “stub offline · live fallback”
                                                       meta.mode = offline_stub · source ≠ llm · no modelId
```

- Default / UI: sync `adviseReplan` = offline fixture.
- API: module-level async hook is the minimum; no fake live LLM responses.

## Honesty

- SANDBOX / STUB · COD ≠ invoice · no live SPX.
- Money / COD / refund stay engine + human; AI writes rationale + optional alternate only (never auto-applied).
- Fallback does **not** claim `source: "llm"` or attach `modelId`.

## Trust boundary (tests lock)

- Advice never changes `engineKind` / `engineStatus`.
- `propose_refund` still `requiresHuman` + `awaiting_human` from engine; alternate is suggestion only.
- Live mode fallback: `fallbackUsed === true`, `meta.mode === "offline_stub"`, `meta.source === "fixture"`.

## Files touched (FO-only)

- `apps/floodops/src/ai-ops-advisor.ts`
- `apps/floodops/src/__tests__/ai-ops-advisor.test.ts`
- `apps/floodops/web/components/OrdersTable.tsx`
- `docs/product/business/floodops.md`
- `docs/review/FLOODOPS-R7-REPORT.md` (this file)

## Not touched

- R1–R6 review docs (read-only).
- Other apps' WIP (Bookkeeper / Mate / Shield / web HITL) — not staged.
- No fabricated live LLM success offline.

## Ask Orchestrator

PASS_VERIFY against tip `f0079bf` · then Judging Room re-score FloodOps A1–A5.
