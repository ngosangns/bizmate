# ROUND-1 — Domain / business backlog

> Orchestrator · 2026-09-26 Asia/Saigon · Tech PASS ≠ xong domain.  
> Rule: mỗi judge ghi **2–3 cải tiến domain/business** per app đã tech-ready; Adv **implement ngay** khi item được route (không chờ file đầy đủ).

## Status

| App | Tech PASS lenses | Domain notes filed | Routed to Adv |
|-----|------------------|--------------------|---------------|
| BizMate | Lee · Tuấn Anh · Kyle · Sidharth (4/5; Son COND) | domain-sidharth + seed | ✅ re-route Sid-* |
| Bookkeeper | Lee · Tuấn Anh · Kyle · Son · Sidharth (5/5) | all judge packets | ✅ **domain proved** `e5db3dd`/`4baf38a` |
| Shield | Lee · Tuấn Anh · Kyle · Son · Sidharth (5/5) | all judge packets | ✅ **domain proved** `13cde1b`/`50c172e` |
| FloodOps | Lee · Tuấn Anh · Kyle · Son · Sidharth (5/5) | all judge packets | ✅ **domain proved** `29491df` |

Kyle / Son domain notes: filed — `domain-kyle.md` · `domain-son.md`. Son R1d BizMate PASS 36 (B5–B7 done).

**Packets filed:** `domain-sidharth.md` · `domain-lee.md` · `domain-tuananh.md` · `domain-kyle.md` · `domain-son.md` (2–3 GTM items/app + route priorities Sid-B1…Sid-F1).

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
| K1 | Tuấn Anh | Màn mobile VN riêng (ngoài CLI) nếu pitch live UI — Bà Lan one-screen | P1 product | Done |
| K2 | Lee | E-invoice **fixture** thật hơn (vẫn offline; không live API) | P2 domain | Done |
| K3 | Sidharth | Week-2 metric hypothesis đo được trên demo seed (số lần Duyệt, lần gần 1B) — honest, không on-call | P1 GTM | Done |
| K4 | Sidharth / Son | Codex task evidence mỏng — 1–2 task `.scratch` + commit tách | P1 craft | Done |

## Shield — Adv · Shield

| # | Source | Improvement | Priority | Status |
|---|--------|-------------|----------|--------|
| S1 | Tuấn Anh / Sidharth | Stage = **backup 30s** only; không hero seller; buyer-trust QR | P0 pitch | **Done** — demo opener + README; see `SHIELD-DOMAIN.md` (commit 912f971) |
| S2 | Lee / Sidharth | Pitch line bắt buộc: `deepfakeScore` = fixture meta, không detector | P0 honesty | **Done** — header `deepfakeScore=fixture` + HONESTY line |
| S3 | Sidharth | Shadow 7 ngày: calendar / per-pattern (hiện global mode) | P2 ops | **Done** — `introducedAt`/`shadowUntil` + `isPatternInShadow` |
| S4 | Lee | Shadow mode cho pattern mới trước enforce (nice-to-have) | P2 | **Done** — shadow FLAG-only; hard signals still BLOCK |

## FloodOps — Adv · FloodOps

| # | Source | Improvement | Priority | Status |
|---|--------|-------------|----------|--------|
| F1 | Tuấn Anh | Tin nhắn buyer khi dời đơn (copy VN ngắn trong demo) | P1 seller | ✅ Done |
| F2 | Tuấn Anh | Local-knowledge shipper đầy đủ | P2 | Open / sau (light stub = TA-F3) |
| F3 | Lee | Live flood feed / capacity — post-hackathon roadmap | P2 roadmap | ✅ Done |
| F4 | Sidharth | Codex scratch note dày hơn (Son bar) | P1 craft | ✅ Done |
| Sid-F1 | Sidharth | COD at-risk flash header · ước tính fixture | P1 | ✅ Done |
| Sid-F2 | Sidharth | Champion org escalation one-liner | P1 | ✅ Done |
| Sid-F3 | Sidharth | Policy-v2 Mate→Judge→load | P1 | ✅ Done |
| Lee-F1 | Lee | COD-at-risk header (same Sid-F1) | P1 | ✅ Done |
| Lee-F2 | Lee | `--replay` human decide from JSONL | P1 | ✅ Done |
| Lee-F3 | Lee | Roadmap 1 dòng post-hackathon | P2 | ✅ Done |
| TA-F1 | Tuấn Anh | Shop An Đông 3 dòng chủ shop | P1 | ✅ Done |
| TA-F2 | Tuấn Anh | Phí 2 chiều ước tính cạnh Duyệt hoàn | P1 | ✅ Done |
| TA-F3 | Tuấn Anh | Local-knowledge ngách xe máy → hold | P2 | ✅ Done |
| Kyle-F1 | Kyle | HUMAN+COD cùng dòng ORD-1003 | P0 | ✅ Done |
| Kyle-F2 | Kyle | Wave ①②③ status line | P1 | ✅ Done |
| Kyle-F3 | Kyle | Shop glance 3 dòng | P1 | ✅ Done |
| Son-F1 | Son | Honesty 2 câu real vs stub | P1 | ✅ Done |
| Son-F2 | Son | Schema flood-decision flash 10s | P1 | ✅ Done |
| Son-F3 | Son | Policy evolve offline (align Sid-F3) | P2 | ✅ Done |

## Judge ask (pending packets)

Mỗi judge file `docs/review/domain-{judge}.md` với 2–3 bullet **cụ thể** / app (Sea ops · seller · GTM · Codex). Orchestrator merge vào bảng trên + route Adv ngay.


## Late adds — gate met residuals

### BizMate — Son Lê R1c P0 (cleared R1d PASS 36)
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
| Lee-B1 | BizMate | Blast-radius unpin: Y executions from AUDIT JSONL | P1 | **Done** |
| Lee-B2 | BizMate | EM hitl:true on accounting + demo “blocked auto-done” | P1 | **Done** |
| Lee-B3 | BizMate | Hot-path latency ms/step demo-derived footer | P1 | **Done** |
| Lee-K1 | Bookkeeper | E-invoice fixture + citation đoạn cụ thể | P2 | **Done** `4baf38a`/`e5db3dd` |
| Lee-K2 | Bookkeeper | Refuse path + approve_rejected audit | P1 | **Done** `4baf38a`/`e5db3dd` |
| Lee-K3 | Bookkeeper | Idempotent re-ingest beat (đổi số → reject) | P1 | **Done** `4baf38a`/`e5db3dd` |
| Lee-S1 | Shield | deepfake=fixture + blacklistVersion flash | **P0** | **Done** `13cde1b`/`50c172e` |
| Lee-S2 | Shield | Shadow +7d pattern mới → FLAG only | P1 | **Done** `13cde1b`/`50c172e` |
| Lee-S3 | Shield | FP SLA line sau human override | P1 | **Done** `13cde1b`/`50c172e` |
| Lee-F1 | FloodOps | COD-at-risk header (khớp Sid-F1) | P1 | **Done** `29491df` |
| Lee-F2 | FloodOps | `--replay` human decide từ JSONL | P1 | **Done** `29491df` |
| Lee-F3 | FloodOps | Roadmap 1 dòng live feed = post-hackathon | P2 | **Done** `29491df` |


## Trần Tuấn Anh seller packet (`domain-tuananh.md`) — routed 18:24 ICT

| ID | App | Improvement | P | Status |
|----|-----|-------------|---|--------|
| TA-B1 | BizMate | Hero Bà Lan / 1B trong 10s; meta sau giây 45 | **P0** | **Done** |
| TA-B2 | BizMate | Sales nút ẩn hoặc “backup domain” | P1 | **Done** |
| TA-B3 | BizMate | Impact shop 1 câu vượt 1B trước phạt | P1 | **Done** |
| TA-K1 | Bookkeeper | One-screen mobile VN (Sạp An Đông · Duyệt) | P1 | Open → Adv |
| TA-K2 | Bookkeeper | Utterance sửa sai / không bán | P1 | Open → Adv |
| TA-K3 | Bookkeeper | Một kênh phân phối (khớp Sid-K3) | P2 | Open → Adv |
| TA-S1 | Shield | Script 30s backup ba/mẹ — cấm seller opener | **P0** | Open → Adv |
| TA-S2 | Shield | Tip buyer VN sau block QR | P1 | Open → Adv |
| TA-S3 | Shield | Family alert 1 câu thường ngày (tech → AUDIT only) | P2 | Open → Adv |
| TA-F1 | FloodOps | Màn chủ shop Shop An Đông VN | P1 | Open → Adv |
| TA-F2 | FloodOps | Ước phí 2 chiều cạnh Duyệt hoàn | P1 | Open → Adv |
| TA-F3 | FloodOps | Local-knowledge stub ngách xe máy | P2 | Open → Adv |


## Kyle product packet (`domain-kyle.md`) — routed 18:25 ICT

| ID | App | Item | P | Status |
|----|-----|------|---|--------|
| Kyle-B1 | BizMate | YTD/1B above-the-fold sau Chạy | **P0** | **Done** |
| Kyle-B2 | BizMate | Progress chỉ khi Tạo lại | P1 | **Done** |
| Kyle-B3 | BizMate | Reset full loop + seed #N visible | P1 | **Done** |
| Kyle-K1 | Bookkeeper | HITL 3 dòng lớn / bước | **P0** | Open → Adv |
| Kyle-K2 | Bookkeeper | Pause beat khi đỏ 1B | P1 | Open → Adv |
| Kyle-K3 | Bookkeeper | --reset header đầu demo | P1 | Open → Adv |
| Kyle-S1 | Shield | 30s · 💬 1 câu · reasons→AUDIT | **P0** | **Done** |
| Kyle-S2 | Shield | CLI --once | P1 | **Done** |
| Kyle-S3 | Shield | STEP pill live counts | P1 | **Done** |
| Kyle-F1 | FloodOps | HUMAN+COD cùng dòng | **P0** | Open → Adv |
| Kyle-F2 | FloodOps | Wave status ①②③ | P1 | Open → Adv |
| Kyle-F3 | FloodOps | Shop An Đông 3 dòng | P1 | Open → Adv |


## Son Codex packet (`domain-son.md`) — routed 18:25 ICT

| ID | App | Item | P | Status |
|----|-----|------|---|--------|
| Son-B1 | BizMate | Board 7/3 live on stage | P1 | **Done** |
| Son-B2 | BizMate | Nói stub-fail trên sân | P1 | **Done** |
| Son-B3 | BizMate | Self-review PR template 3 dòng | P2 | **Done** |
| Son-K1 | Bookkeeper | `.scratch/bookkeeper-001.md` | **P0** | Open → Adv |
| Son-K2 | Bookkeeper | Fail→fix git beat 15s | P1 | Open → Adv |
| Son-K3 | Bookkeeper | Parse = regex stub label | P1 | Open → Adv |
| Son-S1 | Shield | detector:fixture above-the-fold | P1 | **Done** |
| Son-S2 | Shield | `.scratch/shield-001.md` | P1 | **Done** |
| Son-S3 | Shield | Không claim Mate codegen | P2 | **Done** |
| Son-F1 | FloodOps | Scratch honesty 2 câu on stage | P1 | Open → Adv |
| Son-F2 | FloodOps | Schema flood-decision 10s | P1 | Open → Adv |
| Son-F3 | FloodOps | Policy evolve path offline | P2 | Open → Adv |
