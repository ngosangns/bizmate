# AGENTS.md — Biz Mate constitution

You are coding inside the **Biz Mate** monorepo. Read this before writing code.

## Product thesis (do not drift)

- **Biz Mate** is an *agent that codes business workflows*, not an AI bolted into a sales/accounting app.
- **Creation time = agent** (LLM proposes / rewrites workflow code, Evoloop-style white-box evolution).
- **Runtime = deterministic app** (generated TypeScript workflows + rule engine; no LLM in the hot path unless explicitly gated).
- Pattern everywhere: **AI proposes → code verifies → human decides**.

## Pillars (ownership)

| Pillar | Path | Owns |
|--------|------|------|
| Contracts | `packages/contracts` | JSON Schema for workflows, judge verdicts, EM tasks |
| Core | `packages/core` | Propose/verify/decide types, offline mode helpers, `AiMode` / `createAiMeta` |
| Mate | `apps/mate` | Workflow codegen agent + evolution loop |
| Judge | `apps/judge` | Laya + SLM (or rule) code judge for high-level review |
| EM | `apps/em` | AI-native Engineering Manager (task queue, merges, acceptance) |
| Runtime | `apps/runtime` | Executes generated workflows (sales, accounting) |
| Web | `apps/web` | Demo UI: generate → judge → approve → run |
| Domains | `domains/*` | Domain specs + fixtures (accounting, sales) |

## Stack (locked)

- Node 20+, TypeScript, npm workspaces
- Ajv for schema validation
- Vitest for tests
- Optional OpenAI API behind `BIZMATE_MODE=live`; default **`offline`** with fixtures
- No new dependencies without updating this file

## Trust boundaries

1. LLM output is **untrusted**. Validate with Ajv against `packages/contracts` before use.
2. Tax/money/numbers are computed by **deterministic code**, never by the model.
3. Human approval required for: publish workflow, file declaration, charge/refund, merge to `main` workflow registry.
4. Secrets never enter prompts. Env via process only.
5. Offline demo must replay end-to-end without network.

## Coding rules

- Prefer small pure functions; no god classes.
- Every public type lives in contracts or `@bizmate/core`.
- Tests next to code or in `__tests__/`. Acceptance = checklist in PR description.
- Self-review diff before claiming done.
- Do not reintroduce dropped ideas without asking (see `docs/product/DROPPED.md`).

## Hackathon note

Prep repo for Sea x OpenAI Codex Hackathon VN. Day-of build starts empty; this repo is research + skeleton + practice weapons. Preserve meaningful commit history.

## Additional hackathon candidates (from SEAC research)

| App | Path | Idea |
|-----|------|------|
| Bookkeeper | `apps/bookkeeper` | VN household tax/e-invoice agent (Deep Domain) |
| Shield | `apps/shield` | Elder anti-scam / deepfake guardian (Autonomous) |
| FloodOps | `apps/floodops` | Flood-day logistics replan (Autonomous) |

Same trust rules apply. Prefer extending fixtures over live integrations.

## Round 7 — AI Ops

Every app needs a labeled AI **propose** path (`offline_stub` default; optional `BIZMATE_MODE=live`). See `docs/product/AI-OPS-REQUIREMENTS.md` and `docs/review/ROUND-7-AI-OPS.md`. Money/tax/risk/refund stay code + human.
