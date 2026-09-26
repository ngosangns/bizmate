# FloodOps fix — clear Round-1 CONDITIONAL (2026-09-26, Asia/Saigon)

## Goal
Clear remaining CONDITIONAL for `/workspace/bizmate/apps/floodops` after harden (reroute, courier_cancel, in-memory audit). No live Shopee Express / SPX API claims.

## Judge items cleared

| Judge | Item | Cleared by |
|-------|------|------------|
| **Lee** | SLA≤2h flooded → human | `applySlaHumanGate`: flooded + `slaHoursLeft<=2` → `requiresHuman` + `awaiting_human` (kể cả reschedule/reroute/hold). ORD-1005-style covered. |
| **Lee** | Immutable audit + approve | `apps/floodops/src/audit.ts` → `.audit/wave.jsonl`; `approveRefund` only flips `propose_refund` awaiting_human→approved; refund never auto-applies. |
| **Kyle** | Wave progress + --reset + flash HUMAN | Demo ① alerts ② actions (HUMAN rows first) ③ audit; `npm run demo:floodops -- --reset` xóa JSONL. |
| **Son Lê** | Decision schema + refund-never-auto | `packages/contracts/schemas/flood-decision.v0.1.schema.json` + tests (18); Codex note `.scratch/floodops-001.md`. |
| **Sidharth** | Buyer + week-2 COD at-risk | Persona ops-lead / control-tower; `codAtRiskVnd` từ fixture (deterministic). Runbook 7-order synced. |
| **Sidharth** | Human approve in demo | Demo `②b Duyệt hoàn`: `approveRefund(ORD-1003, ops-lead-demo)`. |
| **Sidharth** | 60s Codex story | `.scratch/floodops-001.md` — Mate/Judge *có thể* generate policy; runtime FloodOps vẫn deterministic; honest stub. |
| **Tuấn Anh** | Optional Duyệt hoàn | CLI approve step (PASS sẵn). |

## Files
- `apps/floodops/src/engine.ts`, `audit.ts`, `demo.ts`, `__tests__/`, `README.md`, `fixtures/`
- `packages/contracts/schemas/flood-decision.v0.1.schema.json`
- `docs/review/runbooks/floodops.md`, `.scratch/floodops-001.md`
- Commit: `ce0b82e` (+ this note)

## Prove
```bash
cd /workspace/bizmate
npm test -w @bizmate/floodops
npm run demo:floodops
npm run demo:floodops -- --reset
```

### Re-run (2026-09-26 Asia/Saigon)
- Tests **18/18 PASS**
- Demo EXIT 0: HUMAN ORD-1003 propose_refund + ORD-1005 hold (SLA); Duyệt hoàn → approved; audit 7 · 5 auto · 2 human; SPX analogy only
