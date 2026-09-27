# AI Ops Requirements — cross-cutting (all 4 apps)

> Mandate: **EVERY app must have real AI operational involvement** (not docs-only), while keeping the trust pattern **AI proposes → code verifies → human decides**. Money / tax / risk / refund decisions stay **deterministic code + human**; the LLM never owns those.

## 1. Trust pattern (non-negotiable)

| Stage | Owner | Allowed to decide money/tax/risk/refund? |
|-------|-------|------------------------------------------|
| **Propose** | AI (offline stub or live LLM) | **No** — draft only |
| **Verify** | Deterministic code (Ajv contracts, rule engines, thresholds) | **Yes** for numbers/rules; still not final persist |
| **Decide** | Human (or explicit low-risk EM policy where already coded) | **Yes** — final gate |

UI must always surface the stage labels (VN OK):

- `AI đang đề xuất` / `AI đề xuất` (with stub vs live honesty badge)
- `đã verify` / `rule verify`
- `chờ duyệt` / human decide

## 2. Honesty rules (every surface)

1. **No fake live** SPX, tax authority, Stripe, push gateways, or ML detectors.
2. Billing = **sandbox / STUB** (`@bizmate/billing`); label in UI.
3. Offline AI stubs must be labeled: **`offline_stub`** / `AI đề xuất (stub offline)` / `AI-draft stub`.
4. Live path only when `BIZMATE_MODE=live` **and** a real provider is wired; otherwise fall back to stub and say so.
5. Never invent metrics, model names, or “live” scores when running offline fixtures.
6. Deepfake / detector / carrier rates = fixture stubs until proven live.

## 3. Shared mode (`@bizmate/core`)

```ts
type AiMode = "offline_stub" | "live";
// resolveAiMode() maps BIZMATE_MODE=live → live, else offline_stub
// createAiMeta(mode, source) → { labelVi, labelEn, source, generatedAt, modelId? }
```

Apps SHOULD reuse these helpers. Do not invent a second env flag unless product-specific.

## 4. Per-app AI surfaces (must implement)

### 4.1 BizMate (mate + judge + em + runtime + web)

| Surface | Role | LLM? | Verify / decide |
|---------|------|------|-----------------|
| Mate codegen / evolve | Propose workflow TS + schema | Offline fixture template; optional live mutate | Ajv `validateWorkflow` → human publish |
| Judge | Score draft vs intent/safety | Rule/Laya offline; optional SLM live | Verdict schema; cannot publish alone |
| EM | Task queue / ownership | Policy helpers; not money | Human/EM policy for merges |
| Runtime | Execute approved workflow | **Zero LLM hot path** | Deterministic handlers |

**Requirements:** clear offline fixtures + optional `BIZMATE_MODE=live`; UI/docs show `AI đang đề xuất` / `đã verify`.

### 4.2 Bookkeeper

| Surface | Role | LLM? | Verify / decide |
|---------|------|------|-----------------|
| `AiLedgerProposer` | Voice/text → **proposed** journal line items + notes | `offline` = labeled stub/heuristic; optional live LLM | Ajv ledger contract + **rule engine** computes totals / 1B VND |
| Human Duyệt | Approve / reject persist | — | Required before ledger write |

**Hard rule:** 1B VND threshold remains **pure code** (`@bizmate/core` money helpers). AI never computes YTD / exemption.

UI badges: `AI đề xuất` · `rule verify` · `chờ duyệt`.

### 4.3 Shield

| Surface | Role | LLM? | Verify / decide |
|---------|------|------|-----------------|
| Rule / blacklist engine | **Verdict** (allow/flag/block) | Never | Sole owner of risk decision |
| AI explanation draft | Elder-friendly + family copy | Always present: offline template labeled AI-draft stub; live hook optional | Does **not** change verdict |
| AI triage assist score | Soft ranking hint | Offline heuristic + live hook | **NEVER** overrides rule verdict; UI shows both |

Risk decision stays rule-based. Human caregiver override remains the only non-rule action change.

### 4.4 FloodOps

| Surface | Role | LLM? | Verify / decide |
|---------|------|------|-----------------|
| Policy / replan engine | Action kind + auto vs human by COD / SLA | **Zero LLM** | Sole owner of action selection |
| AI ops advisor | NL rationale + optional alternate suggestion | Offline fixture advisor + live hook | Advice only; engine action wins unless human picks alternate |
| Human approve | Refunds / escalations | — | Required for refunds & tight-SLA |

UI: show **AI advice next to engine action**. COD≠invoice honesty preserved.

## 5. Acceptance checklist (Adv → Round 7)

- [ ] Module + vitest proving **offline** AI propose path exists
- [ ] Honesty badge visible in UI or demo CLI for AI output
- [ ] Money/tax/risk/refund path still unit-tested as deterministic
- [ ] Live hook gated; default offline; no fabricated live calls
- [ ] Docs link from app README to this file + business brief

## 6. Out of scope

- Replacing rule engines with LLM policy nets
- Live tax filing / live SPX / live Stripe charges
- Silent AI auto-approve of money movements

See also: `docs/product/business/*`, `docs/review/ROUND-7-AI-OPS.md`, `AGENTS.md`.
