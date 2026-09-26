# Issue template — Biz Mate EM

> Copy this file to `.scratch/NNN-short-name.md` when opening work for a parallel coding agent.

## What to build
<!-- One paragraph: outcome, not implementation diary. Link pillar path (apps/mate, …). -->

## Owner
<!-- mate | judge | runtime | web | em | human -->

## Acceptance checklist
- [ ] …
- [ ] …
- [ ] Contracts / schemas still validate (`npm run validate:contracts`)

## Blocked by
<!-- Task ids or issue filenames that must be `done` first. Empty = ready. -->
- none

## HITL vs AFK
<!-- HITL = human must confirm before `em done` / merge. AFK = agent may auto-advance. -->
- Mode: AFK
- HITL triggers (if any): publish to registry, charge/refund, merge to main workflow registry

## Merge cadence
<!-- How this lands: PR branch, who reviews, when EM marks done. -->
- Branch: `feat/<id>-short`
- Reviewer: EM + pillar owner
- Done command: `em done <id>` (add `--hitl-confirm` if HITL)

## Notes
<!-- Fixtures, offline constraints, DROPPED.md watch-outs. -->
