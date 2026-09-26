# floodops-001 — Round-1 CONDITIONAL clear (Lee / Kyle / Son / Sidharth / Tuấn Anh)

## What to build
Clear FloodOps Round-1 CONDITIONAL: SLA≤2h→human, immutable JSONL audit + approveRefund, demo --reset + wave progress + Duyệt hoàn, flood-decision schema, refund-never-auto test, GTM persona + COD at-risk metric, runbook sync.

## Owner
runtime (FloodOps) · human review for money path

## Acceptance checklist
- [x] Lee: flooded + slaHoursLeft ≤ 2 → requiresHuman + awaiting_human (reschedule/hold/reroute)
- [x] Lee: JSONL audit under apps/floodops/.audit/ + approveRefund (never auto refund)
- [x] Kyle: wave ① alerts ② actions ③ audit; `--reset` clears audit
- [x] Son: packages/contracts/schemas/flood-decision.v0.1.schema.json + refund-never-auto test
- [x] Sidharth: buyer persona (ops lead / control tower) + week-2 COD at-risk fixture metric; runbook synced to 7-order engine; human approve in demo
- [x] Tuấn Anh: CLI “Duyệt hoàn” via approveRefund(ORD-1003, ops-lead-demo)
- [x] Contracts validate; `npm test -w @bizmate/floodops` green; demo exit 0
- [x] No live SPX / Shopee Express API claims

## Blocked by
- none

## HITL vs AFK
- Mode: AFK for code; HITL = refund approve (ops-lead-demo in demo only)
- Money path: propose_refund → awaiting_human → approveRefund only

## 60s Codex story (honest)
**Today:** FloodOps policy thresholds live in `fixtures/hcm-flood-day.json` + pure TypeScript `replanOrder` — deterministic, no LLM on the hot path. That is intentional for logistics safety.

**Could (Mate/Judge pattern):** Mate generates a *candidate* policy JSON (autoRescheduleMaxCodVnd, refundRequiresHumanAboveVnd) offline; Judge validates against `flood-decision` schema + invariants (“refund never auto_applied”, “SLA≤2h→human”); human merges into fixture. Runtime stays code — same propose→verify→decide loop as BizMate accounting, without wiring live Mate codegen into FloodOps yet.

**Not claimed:** live Mate codegen of FloodOps policy in this demo; live SPX feeds.

## Merge cadence
- Branch: floodops-only commit on main (or feat/floodops-001) — no force-push
- Reviewer: Adv · FloodOps → Review Orchestrator re-run
- Done: tests + demo:floodops + demo --reset exit 0

## Notes
- Analogy SPX only. Persona = internal Sea last-mile ops lead.
- COD at-risk = Σ COD on flooded wards from fixture (deterministic estimate).
