# mate-001 — Mate workflow generator

## What to build
Implement `@bizmate/mate` so a domain brief (accounting / sales) becomes a workflow package: TypeScript modules + JSON matching `workflow.v0.1` + offline fixtures. Evoloop-style: generation N can be rewritten from judge feedback into N+1 (white-box code, not a black-box policy net).

## Owner
mate

## Acceptance checklist
- [ ] `validateWorkflow` passes for accounting + sales drafts
- [ ] Every workflow has an `approve` step before `persist`
- [ ] Offline fixtures load with `BIZMATE_MODE=offline` (no network)
- [ ] `generation` metadata supports parentId for evolve gen+1
- [ ] Unit tests cover happy path + missing-approve rejection path (via judge contract)

## Blocked by
- em-001 (MVP scope freeze)

## HITL vs AFK
- Mode: **AFK** while generating drafts
- HITL: publishing drafts into the workflow registry is **not** Mate’s job — hand off to human-001

## Merge cadence
- Land generator + fixtures behind `apps/mate`; EM marks `mate-001` / `mate-002` done when validate + tests green
- Evolve (`mate-003`) waits on judge + human approve

## Notes
- Money/tax numbers come from `@bizmate/core` deterministic helpers — never from the model
- Do not reintroduce dropped ideas (see `docs/product/DROPPED.md`)
