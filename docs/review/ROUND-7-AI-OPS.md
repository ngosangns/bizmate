# Round 7 — AI Ops (operational presence + honesty)

> Fresh round after R6 skill-review GATE MET. **Do not edit R1–R6 review files.**  
> Focus: every app has **real AI propose** in the ops loop (not docs-only), with honest offline stub vs live labeling, while money/tax/risk/refund stay code + human.

## Scope

| App | AI surface to prove | Deterministic owner (must stay) |
|-----|---------------------|----------------------------------|
| BizMate | Mate codegen/evolve + Judge; UI `AI đang đề xuất` / `đã verify`; runtime **zero LLM** | Runtime handlers; human publish |
| Bookkeeper | `AiLedgerProposer` offline stub (+ live hook); badges AI / rule verify / chờ duyệt | 1B VND + totals; human Duyệt |
| Shield | AI explanation draft **always** on verdict; triage assist score (non-overriding) | Rule/blacklist verdict |
| FloodOps | AI ops advisor rationale (+ optional alternate) next to engine action | COD/SLA policy; human refund |

## Score axes (1–5 each)

`TB` = mean of A1–A5.

| Axis | What to assess | 1 — weak | 3 — adequate | 5 — excellent |
|------|----------------|----------|--------------|---------------|
| **A1 AI operational presence** | AI propose is in the running demo path (module + UI/CLI), not aspirational README | Docs only / regex pretending to be “the AI story” without labeled propose layer | Propose exists offline; thin UI | Clear propose → verify → decide in 90s; Adv can point to file + badge |
| **A2 Trust boundary** | LLM never owns money/tax/risk/refund; code verifies; human decides | AI auto-applies money or overrides risk | Boundary held with one fuzzy edge | Explicit split; tests lock the boundary |
| **A3 Offline stub honesty** | Labels `offline_stub` / AI-draft stub; no fake live SPX/tax/Stripe/ML | Claims live when fixture | Mostly labeled | Honesty wall + mode badge everywhere AI speaks |
| **A4 Live hook readiness** | Optional live path gated by `BIZMATE_MODE=live`; falls back cleanly | Hardcoded fake live | Hook stub exists | Documented env + safe fallback + no invented model traffic offline |
| **A5 Product clarity (VN OK)** | Viewer sees AI vs rule vs human in UI/copy | Confusing ownership | Readable with caveats | Pitch-ready badges + brief in `docs/product/business/` |

## App verdict and gate

Precedence:

- **FAIL** if any axis is `1`, money/risk owned by LLM, honesty breach (fake live), or `TB < 3`.
- **CONDITIONAL** if not FAIL and (`TB` 3–3.9 **or** any axis = 3 that blocks pitch / missing propose module).
- **PASS** if `TB ≥ 4`, no score `1`, trust boundary intact, offline AI path proven by vitest.

**Round-7 gate:** **≥4/5 judges PASS per app · 0 FAIL** (same shape as R6). CONDITIONAL → Adv PLAN → tip → REPORT → Orchestrator verify → re-score.

## Review loop

```text
pass#1 (judge) → Adv PLAN → tip + prove → REPORT → Orchestrator verify → judge re-score
```

1. Judges: hands-on + code read; file `docs/review/r7-form-<judge>.md`.
2. Evidence: cite module path, vitest name, UI badge screenshot or CLI line.
3. Adv → Orchestrator only (never DM judges).
4. Orchestrator PASS_VERIFY → Judging Room re-score.
5. Repeat until gate MET.

## Protocol

- R1–R6 docs are **read-only**.
- Prefer extending `@bizmate/core` (`AiMode`, `createAiMeta`) over new packages.
- Skills/lenses optional; demand file/flow evidence for AI presence.
- Billing/ops honesty: STUB/SANDBOX where not live.

## Score matrix (living)

| App | Sidharth | Lee | Tuấn Anh | Kyle | Son Lê | Aggregate |
|-----|----------|-----|----------|------|--------|-----------|
| BizMate | **PASS** (4.6) | **PASS** (4.80) | **PASS** (4.2) | **PASS** (4.6) | **PASS** (4.8) | **PASS 5/5** |
| Shield | **PASS** (4.8) | **PASS** (4.80) | **PASS** (4.6) | **PASS** (4.8) | **PASS** (4.8) | **PASS 5/5** |
| Bookkeeper | **PASS** (5.0) | **PASS** (5.00) | **PASS** (4.4) | **PASS** (5.0) | **PASS** (5.0) | **PASS 5/5** |
| FloodOps | **PASS** (4.8) | **PASS** (4.80) | **PASS** (4.8) | **PASS** (4.8) | **PASS** (4.8) | **PASS 5/5** |

## Seed tips (scaffold baseline)

**Canonical tip:** `45252f0` (`https://github.com/ngosangns/bizmate/commit/45252f0`). Orchestrator seeded scaffolds; Advs polish UI + live hooks + pitch.

| App | Expected modules (min) | Vitest |
|-----|------------------------|--------|
| Core | `packages/core/src/ai.ts` | `ai.test.ts` |
| Bookkeeper | `src/lib/ai-ledger-proposer.ts` | propose offline path |
| Shield | `src/ai-explain.ts` (+ triage) | draft always; score ≠ override |
| FloodOps | `src/ai-ops-advisor.ts` | advice next to action |

## GATE STATUS

**GATE MET** · 2026-09-27 ~12:35 Asia/Saigon · 4 apps × **5/5 PASS · 0 FAIL** · soft A4 only — no Adv. Polish tips: Mate `36cc0d7` · Shield `616b9ac` · BK `1c685aa` · FO `f0079bf` (seed `45252f0`). R1–R6 untouched.

### Orchestrator open (~12:22 ICT Sep 27)
Tip `45252f0` ⊂ HEAD · docs AI-OPS + business briefs · scaffold core/BK/Shield/FO. Briefed Judging Room + Contestant Lab. Adv polish: live hooks · Mate web AI badges · pitch honesty. R1–R6 read-only.

## Prior

[Round 6 Skill Review](./ROUND-6-SKILL-REVIEW.md) (GATE MET). Product: [AI-OPS-REQUIREMENTS](../product/AI-OPS-REQUIREMENTS.md).

### Lee filed
`docs/review/r7-form-lee.md` — pass #1 tip `45252f0` · **4/4 PASS · 0 FAIL** · TB Mate 4.80 · BK 5.00 · Shield 4.80 · FO 4.80 · notes `runs/r7-lee-aiops-notes.txt`. Soft live wire only — **no Adv PLAN required** from Lee.

### Trần Tuấn Anh filed
`docs/review/r7-form-tuananh.md` — pass #1 tip `45252f0` · **4/4 PASS · 0 FAIL** · TB Mate 4.2 · BK 4.4 · Shield 4.6 · FO 4.8 · shots `runs/r7-tuananh-*.png`. Soft polish only — **no Adv PLAN** from TA.

### Orchestrator PASS_VERIFY · Shield polish `616b9ac`
PLAN/REPORT on disk · tip ⊂ HEAD · parent `45252f0` · vitest **30/30** · `:5174` **200**. Risk=rules · AI explain/triage live→catch→offline_stub. Soft for Lee/TA (already PASS); Sid/Kyle/Son may cite **`616b9ac`** or seed `45252f0`.

### Orchestrator PASS_VERIFY · BizMate polish `36cc0d7`
PLAN/REPORT · tip ⊂ HEAD · baseline `45252f0` · core 6/6 · mate 9/9 · runtime 15/15 · web 9/9 · `:5173` **200**. Live hook catch→offline_stub · badges · runtime 0 LLM. Lee/TA soft; Sid/Kyle/Son cite **`36cc0d7`** or seed.

### Orchestrator PASS_VERIFY · Bookkeeper polish `1c685aa`
PLAN/REPORT · tip ⊂ HEAD · baseline `45252f0` · vitest **30/30** · `:3010` **200** + `/api/health` 200. Live gate + offline · 1B via core · HITL. Lee/TA soft; Sid/Kyle/Son cite **`1c685aa`** or seed.

### Orchestrator PASS_VERIFY · FloodOps polish `f0079bf`
REPORT on disk (PLAN soft-missing) · tip ⊂ HEAD · baseline `45252f0` · vitest **33/33** · `:3011` **200**. Live advisor → stub fallback · AI badge · Engine/AI/human split · COD≠invoice. Soft: add `FLOODOPS-R7-PLAN.md` parity. Lee/TA soft; Sid/Kyle/Son cite **`f0079bf`** or seed.

**Adv polish board:** Mate `36cc0d7` · Shield `616b9ac` · BK `1c685aa` · FO `f0079bf` — all PASS_VERIFY.

### Sidharth R7 filed
`docs/review/r7-form-sidharth.md` — pass #1 · **4/4 PASS · 0 FAIL** · Mate 4.6 (`36cc0d7`) · Shield 4.8 (`616b9ac`) · BK 5.0 (`1c685aa`) · FO 4.8 (`45252f0`). Soft live-wire — **no Adv route**.

### Kyle Tran pass #1
Mate **PASS** 4.6 (`36cc0d7`) · Shield **PASS** 4.8 (`616b9ac`) · BK **PASS** 5.0 (`1c685aa`) · FO **PASS** 4.8 (`f0079bf`).
**Kyle board: 4 PASS · 0 FAIL.** Soft A4 only — no Adv route. Form `r7-form-kyle.md` · shots `runs/r7-kyle-*.png`.

### Son Lê filed
`docs/review/r7-form-son.md` — pass #1 · **4/4 PASS · 0 FAIL** · Mate 4.8 (`36cc0d7`) · Shield 4.8 (`616b9ac`) · BK 5.0 (`1c685aa`) · FO 4.8 (`f0079bf`) · shots `runs/r7-son-*.png`. Soft A4 only — **no Adv route**. Codex: core `ai.ts` + trust-boundary + propose modules.

### Orchestrator close R7
**GATE MET** confirmed after Son pass#1 (Kyle already PASS 4/4). Panel 5/5 · Lab stand-down.

## Soft A4 (post-GATE polish) — CLOSED

**Status:** closed · 2026-09-27 Asia/Saigon · GATE remains **MET** (no Adv re-open).

Wired thin real OpenAI chat-completions helper in `@bizmate/core` (`callLiveChatCompletion`: timeout, abort, key resolve). Mate / Judge SLM / Bookkeeper `AiLedgerProposer` / Shield `ai-explain` / FloodOps `ai-ops-advisor`:

- `BIZMATE_MODE=live` (or `VITE_BIZMATE_MODE` for web badge) + `OPENAI_API_KEY` / `BIZMATE_OPENAI_API_KEY` → live advisory text; money/risk still code.
- Key missing → offline_stub · `fallbackUsed` · `fallbackReason=missing_api_key` · **no modelId**.
- Provider/HTTP/timeout/empty → same honest fallback (never invent live success).

Vitest: live-with-key (`fetch` mock) + missing-key on core + all four apps (+ Judge SLM).  
Doc: [`docs/hackathon/ai-ops/SOFT-A4-LIVE-HOOKS.md`](../hackathon/ai-ops/SOFT-A4-LIVE-HOOKS.md).  
Pitch pack: [`docs/hackathon/pitch/`](../hackathon/pitch/) + updated [`PITCH.md`](../hackathon/PITCH.md).

R1–R6 docs untouched. Judges not re-spammed — Soft A4 polish only.
