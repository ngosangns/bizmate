# judge-001 — Offline code judge (Laya + rules)

## What to build
Implement `@bizmate/judge` to score Mate drafts: schema/invariant checks plus high-level intent rules (Laya-style). Emit `JudgeVerdict` validated by contracts. Default path is offline/rule-based; live SLM is optional behind `BIZMATE_MODE=live`.

## Owner
judge

## Acceptance checklist
- [x] Verdict validates against `judge-verdict.v0.1.schema.json`
- [x] Missing human-approve step → `passed: false` with clear finding
- [x] Offline mode runs with zero network
- [x] Sales + accounting drafts both produce scored verdicts
- [x] Findings include severity + code for EM / Mate evolve loop

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

## Status
- [x] Acceptance checked off against offline tree (2026-09-26 Adv · BizMate). Honest: live SLM/Mate live remain stubs.
