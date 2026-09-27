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
| BizMate | — | — | — | — | — | pending |
| Shield | — | — | — | — | — | pending |
| Bookkeeper | — | — | — | — | — | pending |
| FloodOps | — | — | — | — | — | pending |

## Seed tips (scaffold baseline)

Orchestrator seeds AI propose scaffolds on main; Advs polish UI + live hooks + pitch.

| App | Expected modules (min) | Vitest |
|-----|------------------------|--------|
| Core | `packages/core/src/ai.ts` | `ai.test.ts` |
| Bookkeeper | `src/lib/ai-ledger-proposer.ts` | propose offline path |
| Shield | `src/ai-explain.ts` (+ triage) | draft always; score ≠ override |
| FloodOps | `src/ai-ops-advisor.ts` | advice next to action |

## GATE STATUS

**OPEN** · Round 7 seeded · wait judge pass #1.

## Prior

[Round 6 Skill Review](./ROUND-6-SKILL-REVIEW.md) (GATE MET). Product: [AI-OPS-REQUIREMENTS](../product/AI-OPS-REQUIREMENTS.md).
