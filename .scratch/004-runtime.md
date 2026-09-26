# runtime-001 — Deterministic workflow runtime

## What to build
Implement `@bizmate/runtime` to execute **approved** workflows with no LLM on the hot path. Handle accounting ledger posts (including 1B VND exemption threshold) and sales pipeline steps from fixtures so `npm run demo:offline` is replayable.

## Owner
runtime

## Acceptance checklist
- [ ] Loads only registry-approved workflows
- [ ] Threshold / exemption tests pass via `@bizmate/core` money helpers
- [ ] `npm run demo:offline` prints ledger (or equivalent) without API keys
- [ ] Rejects running drafts that lack human approval
- [ ] Vitest covers happy path + threshold cross

## Blocked by
- human-001 (publish approve) — Runtime must not execute unapproved drafts

## HITL vs AFK
- Mode: **AFK** for execution after approval
- HITL already happened at publish; Runtime stays deterministic

## Merge cadence
- Unblocks `web-001` demo UI once offline demo CLI is green
- EM marks done when demo:offline + tests pass

## Notes
- Secrets never enter prompts; env via process only
- No live tax authority or real payments in MVP
