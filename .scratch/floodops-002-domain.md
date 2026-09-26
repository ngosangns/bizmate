# floodops-002-domain — ROUND-1 domain backlog (all judges)

> Adv · FloodOps · 2026-09-26 Asia/Saigon  
> Son bar = craft evidence. Complements `.scratch/floodops-001.md`.

## Task breakdown

| ID | Work |
|----|------|
| **F1** | `buyerNotifyVi` on reschedule/reroute/hold; demo mau SMS |
| **F2** | Full shipper deferred; light stub = **TA-F3** |
| **F3**/Lee-F3 | README + demo roadmap footer (not built) |
| **F4** | This scratch + commits chain |
| **Sid-F1**/Lee-F1 | COD at-risk header - uoc tinh fixture |
| **Sid-F2** | Champion: night-shift ops lead -> supervisor Duyet hoan |
| **Sid-F3**/Son-F3 | `fixtures/policy-v2-candidate.json` Mate->Judge->load |
| **Lee-F2** | `--replay` reads ORD-1003 human_decision from JSONL |
| **TA-F1**/Kyle-F3 | Shop An Dong exactly 3 lines |
| **TA-F2** | `estimateRoundTripFeeVnd` / phi 2 chieu next to Duyet |
| **TA-F3** | `local_knowledge` ngach xe may -> hold over reroute |
| **Kyle-F1** | HUMAN + COD dong same line on refund rows |
| **Kyle-F2** | Wave 1-2-3 status line |
| **Son-F1** | 2 honesty sentences (real vs stub) on stage |
| **Son-F2** | Schema path flash - refund never auto_applied |

## Files

```
apps/floodops/src/engine.ts
apps/floodops/src/audit.ts
apps/floodops/src/demo.ts
apps/floodops/src/__tests__/floodops.test.ts
apps/floodops/fixtures/hcm-flood-day.json
apps/floodops/fixtures/policy-v2-candidate.json
apps/floodops/README.md
packages/contracts/schemas/flood-decision.v0.1.schema.json
packages/contracts/src/index.ts
.scratch/floodops-001.md
.scratch/floodops-002-domain.md
docs/review/FLOODOPS-FIX.md
docs/review/ROUND-1-DOMAIN.md
```

## Prove

```bash
npm test -w @bizmate/floodops
npm run demo:floodops
npm run demo:floodops -- --replay
npm run demo:floodops -- --reset
```

## Commits

| SHA | What |
|-----|------|
| `ce0b82e` | Round-1 CONDITIONAL clear |
| `ece5923` | FLOODOPS-FIX.md |
| *(this)* | Domain backlog all judges |

## Honest limits (Son-F1 stage)

1. **Real:** offline HCMC fixture + pure TypeScript `replanOrder`/`runWave` — zero LLM on hot path; JSONL audit + human Duyet hoan.
2. **Stub / not claimed:** no live SPX API, no SMS gateway (`buyerNotifyVi` = mau), `policy-v2-candidate.json` not loaded by demo, roadmap (live feed / hub capacity / multi-wave) not built.

## Mate / Judge policy story (Sid-F3 · Son-F3)

Mate emit candidate policy JSON -> Judge validate flood-decision invariants -> human merge fixture -> FloodOps runtime loads thresholds only (zero LLM). Artifact: `fixtures/policy-v2-candidate.json`.

## Schema (Son-F2)

`packages/contracts/schemas/flood-decision.v0.1.schema.json` — propose_refund never auto_applied.
