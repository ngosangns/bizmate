# Adv REPORT — BizMate (R7 AI-Ops polish)

> Adv · BizMate · 2026-09-27 Asia/Saigon · Round-7 AI operational presence + honesty  
> Baseline tip: `45252f0` · Code tip: `36cc0d7` (`36cc0d7b7f0059917da5d8d91abbe46a91c85d80`) · Orchestrator route only · **no judge ping**  
> BK / Shield / FO **out of scope** · R1–R6 docs untouched

### App: BizMate (mate + web + runtime trust · `:5173`)

| Field | Content |
|-------|---------|
| **Before** | Tip `45252f0` seed: core `ai.ts` + BK/Shield/FO scaffolds. Mate still plain `generateWorkflow` / `evolveWorkflow` without `createAiMeta` / live-hook fallback. Web ops-rail had no `AI đang đề xuất` / `đã verify` / zero-LLM runtime badges. Pitch Round-7 section thin. No vitest proving Mate offline meta or runtime no-LLM imports. |
| **After** | **(P0 Mate)** `apps/mate/src/ai-propose.ts` — `generateWorkflowWithMeta` / `evolveWorkflowWithMeta` / offline propose; `resolveAiMode` + `callLiveLlmStub` catch→`offline_stub` meta (never invent live traffic). CLI `generateWorkflow`/`generateForDomain` unchanged. **(P0 Web)** `hitl/ai-badges.ts` + ops-rail honesty strip: **`AI đang đề xuất`** (generating) · **`đã verify`** (ready+) · **`runtime deterministic · không LLM`** (Chạy) · stub label via `createAiMeta` (Vite default offline_stub). index.html R7 curl marker. **(P0 Trust)** mate `ai-propose.test.ts` · runtime `trust-boundary.test.ts` (engine source grep) · web `ai-badges.test.ts`. **(Pitch)** `docs/product/business/bizmate.md` Round 7 stub vs live + cite `packages/core/src/ai.ts`. |
| **Tip SHA** | **canonical BizMate code tip** `36cc0d7` (`36cc0d7b7f0059917da5d8d91abbe46a91c85d80`) · this REPORT stamp is the following commit on `main`. Baseline: `45252f0`. |
| **Prove** | See table — core **6/6** · mate **9/9** · runtime **15/15** · web **9/9** · web build EXIT 0 · curl 127 + localhost **200** · HTML has `bizmate-critical` + `ops-rail` + badge strings |
| **Honesty** | **Y** — offline_stub default · live hook falls back · zero-LLM runtime · no fake live tax/payment · Orchestrator-only |

### How to re-use (exact)

```bash
cd /workspace/bizmate
npm test -w @bizmate/core      # EXIT 0 · 6 passed
npm test -w @bizmate/mate      # EXIT 0 · 9 passed (incl. ai-propose)
npm test -w @bizmate/runtime   # EXIT 0 · 15 passed (incl. trust-boundary)
npm test -w @bizmate/web       # EXIT 0 · 9 passed (HITL + ai-badges)
npm run build -w @bizmate/web  # EXIT 0
cd apps/web && npx vite preview --host --port 5173 --strictPort
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5173/   # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5173/    # 200
# HTML: bizmate-critical · ops-rail · "AI đang đề xuất" / "đã verify" / "không LLM"
```

### Prove exits (Adv · 2026-09-27 Asia/Saigon)

| Command | Result |
|---------|--------|
| `npm test -w @bizmate/core` | **EXIT 0** · **6 passed** |
| `npm test -w @bizmate/mate` | **EXIT 0** · **9 passed** (4 mate + 5 ai-propose) |
| `npm test -w @bizmate/runtime` | **EXIT 0** · **15 passed** (12 prior + 3 trust-boundary) |
| `npm test -w @bizmate/web` | **EXIT 0** · **9 passed** (4 HITL + 5 ai-badges) |
| `npm run build -w @bizmate/web` | **EXIT 0** (tsc + vite; 37 modules) |
| `curl http://127.0.0.1:5173/` | **HTTP 200** · `bizmate-critical` + `ops-rail` + R7 badge comment |
| `curl http://localhost:5173/` | **HTTP 200** |

### P0 checklist

| Item | Status |
|------|--------|
| Mate live hook gated + safe offline fallback | **Done** — `ai-propose.ts` |
| Export proposal meta (`generateWorkflowWithMeta`) | **Done** |
| Web badges `AI đang đề xuất` / `đã verify` + honesty strip | **Done** — ops-rail above fold |
| Runtime zero-LLM (architectural test) | **Done** — `trust-boundary.test.ts` |
| Pitch honesty VN+EN | **Done** — `bizmate.md` |
| Vitest offline_stub + live fallback | **Done** |

### Out of scope (confirmed)

- Bookkeeper / Shield / FloodOps app code
- Editing R1–R6 review docs / ROUND-7-AI-OPS.md
- Judge pings (Orchestrator only for PASS_VERIFY → re-score)
- Live payment / tax API claims
- Wiring a real LLM provider (hook throws → stub by design)

### New files

- `apps/mate/src/ai-propose.ts`
- `apps/mate/src/__tests__/ai-propose.test.ts`
- `apps/web/src/hitl/ai-badges.ts`
- `apps/web/src/__tests__/ai-badges.test.ts`
- `apps/runtime/src/__tests__/trust-boundary.test.ts`
- `docs/review/BIZMATE-R7-PLAN.md`
- `docs/review/BIZMATE-R7-REPORT.md` (this file)

Honesty: **Y** · BizMate-only tip · Orchestrator-only · no judge ping from Adv.
