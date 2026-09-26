# judge-001 — Offline code judge (Laya + rules)

## What to build
Implement `@bizmate/judge` to score Mate drafts: schema/invariant checks plus high-level intent rules (Laya-style). Emit `JudgeVerdict` validated by contracts. Default path is offline/rule-based; live SLM is optional behind `BIZMATE_MODE=live`.

## Owner
judge

## Acceptance checklist
- [ ] Verdict validates against `judge-verdict.v0.1.schema.json`
- [ ] Missing human-approve step → `passed: false` with clear finding
- [ ] Offline mode runs with zero network
- [ ] Sales + accounting drafts both produce scored verdicts
- [ ] Findings include severity + code for EM / Mate evolve loop

## Blocked by
- mate-001 (accounting draft available)
- judge rules package can scaffold in parallel once contracts exist; review tasks wait on Mate output

## HITL vs AFK
- Mode: **AFK** for offline rule verdicts
- HITL: human still decides publish (`human-001`); Judge never auto-approves registry writes

## Merge cadence
- `judge-001` done when offline rules + schema tests pass
- `judge-002` (sales review) unblocks after mate-002 + judge-001

## Notes
- Trust boundary: Judge verifies; Human decides; Runtime executes only approved workflows
