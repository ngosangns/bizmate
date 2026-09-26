# Biz Mate — Round 1 pitch

> **Stage open (0–10s) = Bà Lan + sổ 1 tỷ** — không platform hero.  
> **Meta Evoloop / “agent viết workflow” chỉ sau giây 45.**  
> Sales = **backup domain** (UI), không ngang hàng.  
> Trust proof: `npm run demo:offline` (deny → approve → crossed 1B + AUDIT).

---

## 0–10s — Seller hero (TA-B1 P0)

**Bà Lan · tiểu thương chợ An Đông.** Voice sale → ledger → **vượt 1 tỷ VND**.  
Human **Duyệt** trước persist. Code tính ngưỡng — không LLM trên tiền.

**Impact (TA-B3):** *Chủ sạp biết mình vừa vượt 1 tỷ trước khi bị phạt.*  
(Gắn banner web / `crossed-banner` sau Chạy.)

Không pitch FloodOps / multi-hero / “platform” trên slide mở.

---

## 10–45s — Trust beat (accounting only)

`npm run demo:offline`: deny path → Duyệt → crossed 1B + **AUDIT SUMMARY** (JSONL).  
EM: **blocked auto-done on money task**. Blast-radius: unpin version → N executions (*demo-derived*).

---

## Sau giây 45 — Meta only (không chiếm hero)

Biz Mate = **cách chúng ta build**: creation = agent, runtime = deterministic.  
AI đề xuất → code kiểm → người quyết. Money path zero-LLM.  
*(Evoloop / agent-writes-workflow meta — AFTER second 45; never before seller hero.)*

---

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

## 60s Codex honesty (Son-B1/B2)

- EM board live: **7 done / 3 todo** (landed: em-001, mate-001, mate-002, judge-001, judge-002, runtime-001, web-001; planned HITL/evolve: human-001, mate-003, human-002). From `apps/em/board.json` — do not invent.
- **Stub-fail honesty:** `BIZMATE_MODE=live` Mate/Judge SLM remain **heuristics** — on stage we demo **offline rules**, not a frontier model.

## Demo-derived metrics (Sid-B2 — offline seed)

From `npm run demo:offline` / `apps/runtime/.audit/events.jsonl` (**label: demo-derived**):

| Metric | Last offline seed |
|--------|-------------------|
| `approve_fail` | **1** (deny path before Duyệt) |
| `approve_ok` | **1** (human approved) |
| `persist_ok` | **1** (ledger) |
| Blast-radius | unpin `wf-accounting-vendor-day@0.1.0` → N from AUDIT |
| Hot-path | ms/step compute+persist on AUDIT SUMMARY footer (*demo-derived*) |

Web: **Blast-radius** card + **Chỉ số demo-derived** + HOT-PATH footer + above-fold YTD after Chạy.

## Partnership 20s (Sid-B3)

Mate = **creation-time** Codex path. Runtime = **deterministic**. Registry owner = **EM + human**. Full line: `docs/hackathon/pitch/bizmate-partnership-20s.md`.
