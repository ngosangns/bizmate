# Biz Mate — Round 1 pitch (≤45s meta · hero = accounting only)

> **BizMate = cách chúng ta build** (≤45s meta) — **không** chiếm 6' platform hero; sales chỉ backup trong UI.  
> **Stage hero = accounting / Bà Lan only** (seller-finance · ngưỡng 1 tỷ).  
> Trust proof: `npm run demo:offline` (deny → approve → crossed 1B + AUDIT).

## ≤45s meta

Chat-LLM trên tiền/thuế không audit được. Biz Mate: **creation = agent**, **runtime = deterministic**. AI đề xuất → code kiểm → người quyết. Money path zero-LLM.

## Stage hero (một vertical)

**Bà Lan · tiểu thương chợ An Đông:** voice sale → ledger → vượt 1 tỷ VND — human **Duyệt** trước persist. Không pitch FloodOps / multi-hero trên slide BizMate.

## GTM (honest)

| Probe | Answer |
|-------|--------|
| Who pays (D-Day) | **Sea internal tooling only** — SME add-on = roadmap (no “hoặc” on stage) |
| Week 2 | 10 Sea pilot users; metrics from AUDIT JSONL (*demo-derived*); rollback = unpin |
| Partnership 20s | Mate = creation-time; runtime deterministic; registry = EM + human |
| Why VN | ND-141 / 1B threshold 2026 |

## Proof commands

`npm run demo:offline` · web VN story (`apps/web`) · audit JSONL `apps/runtime/.audit/events.jsonl`

## Gaps

No live tax/payments; WTP unmeasured; SLM stub.


## 60s Codex honesty (Son B7)

- Real parallel tasks: `.scratch/002–004` checked + EM board **7 done / 3 todo** (landed: em-001, mate-001, mate-002, judge-001, judge-002, runtime-001, web-001; planned HITL/evolve: human-001, mate-003, human-002).
- **Stub callout:** `BIZMATE_MODE=live` Mate/Judge SLM remain heuristics — on stage we demo **offline rules**, not frontier SLM.


## Demo-derived metrics (Sid-B2 — offline seed)

From `npm run demo:offline` / `apps/runtime/.audit/events.jsonl` (**label: demo-derived**, not field study):

| Metric | Last `npm run demo:offline` (demo-derived) |
|--------|---------------------------------------------|
| `approve_fail` | **1** (deny path before Duyệt) |
| `approve_ok` | **1** (human approved) |
| `persist_ok` | **1** (ledger) |
| `persist_fail` | **0** |
| Hot-path | CLI step list; web “Last run” ms (*demo-derived*) |

Web: panel **Chỉ số demo-derived** mirrors session audit counts.


## Partnership 20s (Sid-B3)

Mate = **creation-time** Codex path. Runtime = **deterministic**. Registry owner = **EM + human**. Full line: `docs/hackathon/pitch/bizmate-partnership-20s.md`.
