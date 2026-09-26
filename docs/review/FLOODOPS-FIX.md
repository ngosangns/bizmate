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


---

## Domain backlog (ROUND-1-DOMAIN · 2026-09-26 Asia/Saigon)

| # | Status | Deliverable |
|---|--------|-------------|
| **F1** Tuấn Anh P1 | ✅ | `buyerNotifyVi` mẫu SMS on reschedule/reroute/hold |
| **F2** Tuấn Anh P2 | Partial | Full shipper deferred; **TA-F3** light local-knowledge stub (ngách xe máy → hold vs reroute) |
| **F3** / **Lee-F3** P2 | ✅ | README + demo footer roadmap (live flood feed / hub capacity / multi-wave) |
| **F4** Sidharth/Son P1 | ✅ | `.scratch/floodops-002-domain.md` craft evidence |
| **Sid-F1** / **Lee-F1** P1 | ✅ | COD at-risk header · ước tính fixture |
| **Sid-F2** P1 | ✅ | Champion: night-shift ops lead → supervisor Duyệt hoàn |
| **Sid-F3** / **Son-F3** P1/P2 | ✅ | `policy-v2-candidate.json` + Mate→Judge→load story |
| **Lee-F2** P1 | ✅ | `npm run demo:floodops -- --replay` reads ORD-1003 human_decision from JSONL |
| **TA-F1** / **Kyle-F3** P1 | ✅ | Shop An Đông exactly 3 lines (Đã giữ / Đã dời / Chờ hoàn) |
| **TA-F2** P1 | ✅ | Phí 2 chiều ước tính next to Duyệt hoàn |
| **TA-F3** P2 | ✅ | `local_knowledge` ngách xe máy → hold over reroute |
| **Kyle-F1** P0 | ✅ | HUMAN + COD ₫ on same line for refund rows |
| **Kyle-F2** P1 | ✅ | Wave status line ①→②→③ |
| **Son-F1** P1 | ✅ | Demo honesty 2 sentences (real vs stub) |
| **Son-F2** P1 | ✅ | Schema path flash + refund never auto_applied |

No live SPX claims. Prove: `npm test -w @bizmate/floodops` · `npm run demo:floodops` · `--replay`.
