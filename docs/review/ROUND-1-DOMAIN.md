# ROUND-1 — Domain / business backlog

> Orchestrator · 2026-09-26 Asia/Saigon · Tech PASS ≠ xong domain.  
> Rule: mỗi judge ghi **2–3 cải tiến domain/business** per app đã tech-ready; Adv **implement ngay** khi item được route (không chờ file đầy đủ).

## Status

| App | Tech PASS lenses | Domain notes filed | Routed to Adv |
|-----|------------------|--------------------|---------------|
| BizMate | Lee · Tuấn Anh · Sidharth | Seeded below | ✅ partial |
| Bookkeeper | Lee · Tuấn Anh · Sidharth | Seeded below | ✅ partial |
| Shield | Lee · Tuấn Anh · Sidharth | Seeded below | ✅ partial |
| FloodOps | Lee · Tuấn Anh · Sidharth | Seeded below | ✅ partial |

Kyle / Son domain notes: pending their re-score + domain packets.

---

## BizMate — Adv · BizMate

| # | Source | Improvement | Priority | Status |
|---|--------|-------------|----------|--------|
| B1 | Tuấn Anh | Giữ Mate ≤45s meta; **không** để platform lên 6' hero; sales domain chỉ backup | P0 pitch | **Done** — `PITCH-bizmate.md` + web sales phụ |
| B2 | Sidharth | Đo WTP giả thuyết (Sea internal vs SME add-on) — 1 slide, không invent ARR | P1 GTM | **Done** — `docs/hackathon/pitch/bizmate-wtp-slide.md` |
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
| F1 | Tuấn Anh | Tin nhắn buyer khi dời đơn (copy VN ngắn trong demo) | P1 seller | Open |
| F2 | Tuấn Anh | Local-knowledge shipper vào demo sau (không chặn PASS) | P2 | Open |
| F3 | Lee | Live flood feed / capacity — post-hackathon roadmap slide | P2 roadmap | Open |
| F4 | Sidharth | Codex scratch note dày hơn (Son bar) — không chặn GTM | P1 craft | Open |

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
