# Soft A4 — Live hook readiness (honest OpenAI wire)

> Round-7 GATE already **MET**. This doc is polish only: how live vs offline works, without inventing traffic or fake model claims.

## Trust pattern (unchanged)

**AI proposes → code verifies → human decides.**  
Money / tax / risk / refund stay **deterministic code + human**. Live LLM only supplies advisory text (notes, explanations, rationales).

## Env vars

| Var | Where | Meaning |
|-----|--------|---------|
| `BIZMATE_MODE=live` | Node apps (Mate, Judge, Bookkeeper, Shield, FloodOps) | Enables live *attempt* |
| `VITE_BIZMATE_MODE=live` | Mate web (Vite inject) | Browser honesty badge can show live intent |
| `OPENAI_API_KEY` or `BIZMATE_OPENAI_API_KEY` | Server process | Real OpenAI chat completions key (prefer `BIZMATE_*`) |
| `BIZMATE_LLM_MODEL` | Optional | Model id (default `gpt-4o-mini`) |
| `BIZMATE_OPENAI_BASE_URL` | Optional | OpenAI-compatible base (default `https://api.openai.com/v1`) |

Default (no env): **`offline_stub`** — fixtures/heuristics, no network.

## Behavior matrix

| Mode | API key | Result |
|------|---------|--------|
| offline / unset | — | `offline_stub` · no fetch |
| `live` | **missing** | Offline stub · `fallbackUsed=true` · `fallbackReason=missing_api_key` · **no modelId** |
| `live` | present | `callLiveChatCompletion` (timeout + abort) → parse non-empty content → `mode=live` · `source=llm` · real `modelId` |
| `live` | present but HTTP/timeout/empty | Same as missing: offline stub · `fallbackUsed` · reason · **no fake modelId** |

Helper: `packages/core/src/ai.ts` → `callLiveChatCompletion` / `createFallbackAiMeta` / `resolveOpenAiApiKey`.

## Per-app surfaces

| App | Module | Live uses LLM for | Still owned by code |
|-----|--------|-------------------|---------------------|
| Mate | `apps/mate/src/ai-propose.ts` | Optional advisory `liveNote` | Workflow template / evolve heuristics · Ajv |
| Judge | `apps/judge/src/slm.ts` | High-level summary string | Laya findings · score deductions · verdict schema |
| Bookkeeper | `apps/bookkeeper/src/lib/ai-ledger-proposer.ts` | `classificationNote` only | `parseUtterance` items · 1B / YTD / tax · human Duyệt |
| Shield | `apps/shield/src/ai-explain.ts` | Elder/family copy + triage rationale | Rule allow/flag/block · triage `overridesVerdict=false` |
| FloodOps | `apps/floodops/src/ai-ops-advisor.ts` | NL rationale | Engine action kind/status · COD policy · human refund |

## How to demo

### Offline first (default — safe for judges)

```bash
# no BIZMATE_MODE, no key
npm run dev:web          # :5173 Mate
npm run demo:shield      # or shield web :5174
npm run demo:bookkeeper  # :3010
npm run demo:floodops    # :3011
```

Say out loud: *“AI đề xuất (stub offline) — không gọi OpenAI.”*

### Optional live (only if you have a real key)

```bash
export BIZMATE_MODE=live
export OPENAI_API_KEY=sk-...   # or BIZMATE_OPENAI_API_KEY
# then start the same apps
```

Honesty lines if live succeeds: *“AI đề xuất (live)”* + real model id.  
If key missing while `live`: *“stub offline · missing_api_key”* — **never pretend live succeeded**.

## Vitest

Core + each app cover:

1. **Live + key** with `fetch` mock → `mode=live`, real `modelId`, trust boundary held  
2. **Live + missing key** → `missing_api_key`, no `modelId`

```bash
npm run test -w @bizmate/core
npm run test -w @bizmate/mate
npm run test -w @bizmate/judge
npm run test -w @bizmate/bookkeeper
npm run test -w @bizmate/shield
npm run test -w @bizmate/floodops
```

## What we do **not** claim

- No fake live SPX / tax authority / Stripe / ML detectors  
- No invented model traffic when offline or when key missing  
- Runtime Chạy path remains **zero LLM**
