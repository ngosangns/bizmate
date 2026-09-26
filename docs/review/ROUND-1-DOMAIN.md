# ROUND-1 — Domain / business backlog

> Orchestrator · 2026-09-26 Asia/Saigon · Tech PASS ≠ xong domain.  
> Rule: mỗi judge ghi **2–3 cải tiến domain/business** per app đã tech-ready; Adv **implement ngay** khi item được route (không chờ file đầy đủ).

## Status

| App | Tech PASS lenses | Domain notes filed | Routed to Adv |
|-----|------------------|--------------------|---------------|
| BizMate | Lee · Tuấn Anh · Kyle · Sidharth (4/5; Son COND) | domain-sidharth + seed | ✅ re-route Sid-* |
| Bookkeeper | Lee · Tuấn Anh · Kyle · Son · Sidharth (5/5) | domain-sidharth + seed | ✅ re-route Sid-* |
| Shield | Lee · Tuấn Anh · Kyle · Son · Sidharth (5/5) | domain-sidharth + seed | ✅ re-route Sid-* |
| FloodOps | Lee · Tuấn Anh · Kyle · Son · Sidharth (5/5) | domain-sidharth + seed | ✅ re-route Sid-* |

Kyle / Son domain notes: pending their re-score + domain packets.

**Packets filed:** `domain-sidharth.md` · `domain-lee.md` · `domain-tuananh.md` (2–3 GTM items/app + route priorities Sid-B1…Sid-F1).

**Lee packet filed:** `docs/review/domain-lee.md` (ops/money-safety · Lee-B1…Lee-F2).

---

## BizMate — Adv · BizMate

| # | Source | Improvement | Priority | Status |
|---|--------|-------------|----------|--------|
| B1 | Tuấn Anh | Giữ Mate ≤45s meta; **không** để platform lên 6' hero; sales domain chỉ backup | P0 pitch | **Done** — `PITCH-bizmate.md` + web sales phụ |
| B2 | Sidharth | WTP slide (Sea **or** SME) | P1 | **Done via Sid-B1** — Sea internal only; SME roadmap |
| B3 | Sidharth | Week-2 pilot card: 10 users · metric time-to-ledger / gate error · rollback = unpin version | P1 GTM | **Done** — `docs/hackathon/pitch/bizmate-week2-pilot.md` |
| B4 | Lee residual | Codex parallel-agent / git-task evidence (phục vụ Son bar) | P1 craft | **Done** — `docs/review/CODEX-EVIDENCE-bizmate.md` |

## Bookkeeper — Adv · Bookkeeper

| # | Source | Improvement | Priority | Status |
|---|--------|-------------|----------|--------|
| K1 | Tuấn Anh | Màn mobile VN riêng (ngoài CLI) nếu pitch live UI — Bà Lan one-screen | P1 product | Open |
| K2 | Lee | E-invoice **fixture** thật hơn (vẫn offline; không live API) | P2 domain | Open |
| K3 | Sidharth | Week-2 metric hypothesis đo được trên demo seed (số lần Duyệt, lần gần 1B) — honest, không on-call | P1 GTM | Open |
| K4 | Sidharth / Son | Codex task evidence mỏng — 1–2 task `.scratch` + commit tách | P1 craft | Open |

## Shield — Adv · Shield

| # | Source | Improvement | Priority | Status |
|---|--------|-------------|----------|--------|
| S1 | Tuấn Anh / Sidharth | Stage = **backup 30s** only; không hero seller; buyer-trust QR | P0 pitch | Open |
| S2 | Lee / Sidharth | Pitch line bắt buộc: `deepfakeScore` = fixture meta, không detector | P0 honesty | Open |
| S3 | Sidharth | Shadow 7 ngày: calendar / per-pattern (hiện global mode) | P2 ops | Open |
| S4 | Lee | Shadow mode cho pattern mới trước enforce (nice-to-have) | P2 | Open |

## FloodOps — Adv · FloodOps

| # | Source | Improvement | Priority | Status |
|---|--------|-------------|----------|--------|
| F1 | Tuấn Anh | Tin nhắn buyer khi dời đơn (copy VN ngắn trong demo) | P1 seller | ✅ Done |
| F2 | Tuấn Anh | Local-knowledge shipper vào demo sau (không chặn PASS) | P2 | Open / sau |
| F3 | Lee | Live flood feed / capacity — post-hackathon roadmap slide | P2 roadmap | ✅ Done |
| F4 | Sidharth | Codex scratch note dày hơn (Son bar) — không chặn GTM | P1 craft | ✅ Done |

## Judge ask (pending packets)

Mỗi judge file `docs/review/domain-{judge}.md` với 2–3 bullet **cụ thể** / app (Sea ops · seller · GTM · Codex). Orchestrator merge vào bảng trên + route Adv ngay.


## Late adds — gate met residuals

### BizMate — Son Lê CONDITIONAL (blocking his PASS only)
| # | Source | Improvement | Priority | Status |
|---|--------|-------------|----------|--------|
| B5 | Son Lê R1c | Sync `apps/em/board.json` done statuses to landed work (or split planned vs done) | **P0** | **Done** — board synced (HITL/evolve remain todo) |
| B6 | Son Lê R1c | Check-off `.scratch/002–004` acceptance | **P0** | **Done** — checkboxes + Status footer |
| B7 | Son Lê R1c | Pitch 60s with real task counts after sync + 1 stub-fail callout | **P0** | **Done** — PITCH + CODEX-EVIDENCE |

### Kyle R1c non-blockers (product polish)
| # | App | Note |
|---|-----|------|
| Ky1 | BizMate | Web progress = simulated timeouts — keep honest |
| Ky2 | Bookkeeper | ASR stub; CLI HITL labeled |
| Ky3 | Shield | Dense machine reasons OK if elder 💬 clean |
| Ky4 | FloodOps | SPX analogy only — correct |


## Lee ops packet (`domain-lee.md`) — routed 18:24 ICT

| ID | App | Improvement | P | Status |
|----|-----|-------------|---|--------|
| Lee-B1 | BizMate | Blast-radius unpin: Y executions from AUDIT JSONL | P1 | Open → Adv |
| Lee-B2 | BizMate | EM hitl:true on accounting + demo “blocked auto-done” | P1 | Open → Adv |
| Lee-B3 | BizMate | Hot-path latency ms/step demo-derived footer | P1 | Open → Adv |
| Lee-K1 | Bookkeeper | E-invoice fixture + citation đoạn cụ thể | P2 | Open → Adv |
| Lee-K2 | Bookkeeper | Refuse path + approve_rejected audit | P1 | Open → Adv |
| Lee-K3 | Bookkeeper | Idempotent re-ingest beat (đổi số → reject) | P1 | Open → Adv |
| Lee-S1 | Shield | deepfake=fixture + blacklistVersion flash | **P0** | Open → Adv |
| Lee-S2 | Shield | Shadow +7d pattern mới → FLAG only | P1 | Open → Adv |
| Lee-S3 | Shield | FP SLA line sau human override | P1 | Open → Adv |
| Lee-F1 | FloodOps | COD-at-risk header (khớp Sid-F1) | P1 | Open → Adv |
| Lee-F2 | FloodOps | `--replay` human decide từ JSONL | P1 | Open → Adv |
| Lee-F3 | FloodOps | Roadmap 1 dòng live feed = post-hackathon | P2 | Open → Adv |


## Trần Tuấn Anh seller packet (`domain-tuananh.md`) — routed 18:24 ICT

| ID | App | Improvement | P | Status |
|----|-----|-------------|---|--------|
| TA-B1 | BizMate | Hero Bà Lan / 1B trong 10s; meta sau giây 45 | **P0** | Open → Adv |
| TA-B2 | BizMate | Sales nút ẩn hoặc “backup domain” | P1 | Open → Adv |
| TA-B3 | BizMate | Impact shop 1 câu vượt 1B trước phạt | P1 | Open → Adv |
| TA-K1 | Bookkeeper | One-screen mobile VN (Sạp An Đông · Duyệt) | P1 | Open → Adv |
| TA-K2 | Bookkeeper | Utterance sửa sai / không bán | P1 | Open → Adv |
| TA-K3 | Bookkeeper | Một kênh phân phối (khớp Sid-K3) | P2 | Open → Adv |
| TA-S1 | Shield | Script 30s backup ba/mẹ — cấm seller opener | **P0** | Open → Adv |
| TA-S2 | Shield | Tip buyer VN sau block QR | P1 | Open → Adv |
| TA-S3 | Shield | Family alert 1 câu thường ngày (tech → AUDIT only) | P2 | Open → Adv |
| TA-F1 | FloodOps | Màn chủ shop Shop An Đông VN | P1 | Open → Adv |
| TA-F2 | FloodOps | Ước phí 2 chiều cạnh Duyệt hoàn | P1 | Open → Adv |
| TA-F3 | FloodOps | Local-knowledge stub ngách xe máy | P2 | Open → Adv |
