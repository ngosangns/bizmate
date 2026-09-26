# Kế hoạch chiến thắng — Sea x OpenAI Codex Hackathon Vietnam (31/10/2026)

> Mục tiêu: **thắng giải**. Đội hình giả định: **4 người, full-stack + AI**.
> Plan được xây từ: barem công bố + phân tích 6 dự án thắng SG/TW (xem `04-barem-cham-diem.md`, `06-quy-trinh-phat-trien.md`).

---

## PHẦN A — Chiến thắng bắt đầu từ đâu (tổng kết nghiên cứu)

**Công thức lặp lại ở cả 2 giải Nhất:**

```
Vấn đề THẬT + domain depth  →  Agent "proposes" →  Hệ thống/rule VERIFY  →  Người DECIDES
     (problem framing)           (AI-native)          (quality of build)       (trust/safety)
                                                              +
                                              Demo deterministic chạy được trong mọi điều kiện
```

- Cả Evoloop và TurnDeal đều có **lớp kiểm chứng ngoài LLM** (code audit / backend validator) — đây là thứ BGK (gồm kỹ sư Sea + OpenAI) đào sâu nhất: *trade-off, privacy, sau hackathon ra sao*.
- Tất cả đội thắng đều **spec/contracts trước — code sau**, coi docs như instruction cho Codex.
- Demo fail không chết đội (Techbros fail 2/3 demo vẫn giải 3) **nhưng** đội nào cũng có offline fallback.

**Né trùng (đã có người làm):** ❌ travel planner (TripCanvas, SmartTrip) · ❌ live-commerce cohost/producer (Shopee Live Producer, tandem) · ❌ self-evolving game AI (Evoloop) · ❌ agent-to-agent negotiation mua hàng (TurnDeal) · ❌ 長照/care agent · ❌ multi-agent space game (We Keep the Dawn) · ❌ shopper simulation (Synthetic Shoppers, top5) · ❌ counterfeit/trust-safety listing (TrustPatrol) · ❌ SQL optimization agent · ❌ consensus/voting ẩn danh (Conclave) · ❌ sales-call coach (Best Closer) · ❌ seller launch assistant (SEALaunch) · ❌ trade compliance (TradeReady)

---

## PHẦN B — 3 hướng ý tưởng + candidate (đã né trùng)

### Hướng 1 — Autonomous & Adaptive AI

**Candidate 1A: "Mùa mưa" — Logistics Resilience Agent** ⭐ *đề xuất chính*
- Bài toán: cuối tháng 10 là mùa bão/lũ/ngập VN. Shipper/sàn gặp disruption liên tục; hiện con người xử lý thủ công từng đơn.
- Build: agent nhận luồng sự kiện (cảnh báo ngập, tuyến đường chết, đơn trễ SLA) → **tự replan** đơn hàng/tuyến xe → khi vượt ngưỡng quyền (VD hoàn tiền > X) thì escalate kèm rationale + options; học từ quyết định được duyệt.
- Điểm chạm barem: "adaptive" đúng nghĩa (điều kiện thay đổi → hành vi thay đổi), verify bằng rule engine (SLA, khoảng cách, capacity), human-in-the-loop, Shopee Express relevant.
- Demo: simulator bản đồ phường TP.HCM + feed sự kiện giả lập — **hoàn toàn offline**, replay được.

**Candidate 1B: Flash-sale Ops Autopilot cho seller**
- Agent tự vận hành shop trong campaign lớn: theo dõi tồn kho/đối thủ/CVS → tự điều voucher, giá, pause SKU lỗ, escalate giao dịch bất thường. Guardrail: mọi action có policy bound + audit log.
- Rủi ro: gần với family "seller assistant" (SEALaunch) — điểm originality thấp hơn 1A.

### Hướng 2 — AI-Native Products & Operations

**Candidate 2A: Dispute Resolution Copilot cho marketplace** ⭐ *đề xuất phụ*
- Bài toán: tranh chấp hoàn hàng/hoàn tiền trên sàn tốn nhân lực, xử lý chậm, dễ thiên lệch.
- Build: agent chủ động **gom bằng chứng** (chat log, ảnh unboxing, tracking, lịch sử 2 phía) → đối chiếu policy sàn → đề xuất phán quyết kèm evidence trail → **nhân viên duyệt/từ chối**, agent học từ quyết định.
- AI-native: toàn bộ workflow không tồn tại được nếu không có AI; product mới, không phải tính năng gắn thêm.

**Candidate 2B: AI-native "war room" SME** — dashboard tự vận hành: agents đọc số liệu bán hàng/ngân sách marketing mỗi giờ, tự ra quyết định nhỏ, human duyệt quyết định lớn. *(Rủi ro: khá generic, dễ trùng các team khác.)*

### Hướng 3 — Deep Domain AI

**Candidate 3A: Tax/Compliance Agent cho hộ kinh doanh & seller VN** ⭐ *đề xuất phụ*
- Bối cảnh nóng: 2026 hộ kinh doanh VN chuyển từ thuế khoán sang kê khai; seller TMĐT phải đối chiếu hóa đơn điện tử, doanh thu sàn, nghĩa vụ GTGT/TNCN. Đau thật, tài liệu chính thống nhiều (Tổng cục Thuế, NĐ/Nghị định).
- Build: agent đọc doanh thu/giao dịch → phân loại nghĩa vụ → sinh hồ sơ kê khai nháp → trả lời câu hỏi **grounding vào văn bản pháp luật** với citation; số liệu nhạy cảm được compute bằng code, LLM chỉ diễn giải.
- Giống công thức 長照 Agent (ground vào nguồn chính thống + workflow hồ sơ) nhưng domain VN khác hẳn — chấp nhận được.

**Candidate 3B: Agriculture agent** — chuẩn đoán sâu bệnh/khuyến nghị cho cà phê/sầu riêng. *(Yếu: khó demo offline đẹp, thiếu data.)*

### Ma trận chọn (chấm theo barem, thang 1–5)

| Tiêu chí | 1A Logistics | 2A Dispute | 3A Tax/Compliance |
|---|---|---|---|
| Problem framing (vấn đề thật, sắc) | 5 (bão lũ ngay trước mắt) | 4 | 5 (chính sách 2026 nóng) |
| Quality of build (demo được trong 7h) | 4 | 4 | 5 (chủ yếu form/chat/workflow) |
| Insight & originality | 5 | 4 | 4 |
| Real-world value | 5 | 5 | 5 |
| Fit build direction | 5 | 4 | 5 |
| Khoe được "Codex leverage" | 4 | 4 | 4 |
| Trùng bài cũ | Không | Không | Không |
| **Tổng** | **27** | **25** | **27** |

**Khuyến nghị:** sau khi mở rộng khảo sát pain point VN (xem `08-khao-sat-van-de-vn.md` — 10 domain có bằng chứng báo chí), top 3 lọt vào:
1. **"Kế toán AI cho tiểu thương"** (thuế kê khai + hóa đơn điện tử 2026 — bãi bỏ thuế khoán từ 1/1/2026 là pain cực nóng; fit Deep Domain)
2. **"Tấm khiên số cho người già"** (chống scam/deepfake — 1.500 tỷ thiệt hại trong 6T/2026; đúng chủ đề chiến dịch quốc gia "TinAI?")
3. **1A Logistics mùa mưa** (ngập HN 17/9/2026 vừa xảy ra; fit Autonomous & Adaptive)

*Quyết định cuối phải chờ "more context provided on the day" — chuẩn bị sẵn research + skeleton cho tối đa 2 ý tưởng, chọn lúc 10:00 sáng D-Day.*

---

## PHẦN C — Timeline chuẩn bị (giờ → 31/10)

### Tuần 1 (26/9 – 2/10): Đóng hồ sơ + chốt nền
- [ ] **Deadline đăng ký đã qua 26/9** — nếu chưa nộp: liên hệ `sea-openai-vnhackathon@sea.com` ngay. Cả 4 thành viên điền form riêng, **cùng tên đội + cùng email team lead**.
- [ ] Chốt repo skeleton + stack cố định (xem Phần D). Quy tắc: không thêm dependency ngoài stack đã chốt.
- [ ] Viết `AGENTS.md` template của đội (baseline, ranh giới AI/human/code-verify, style commit).
- [ ] Setup Supabase/Neon + Vercel/Railway deploy sẵn "hello world" — verify pipeline chạy.

### Tuần 2 (3–9/10): Tập dượt #1 (học cách 長照 Agent — họ có repo demo practice trước 3 tuần)
- [ ] Chọn ý tưởng tập (không phải ý tưởng thi — VD: todo app agentic) → **mini-hack 4 tiếng cuối tuần** để quen: PRD → task queue → Codex parallel.
- [ ] Rút ra checklist lỗi: merge conflict, env, API key leak, demo die.
- [ ] Viết sẵn `docs/prd-template.md` + `.scratch/` issue template theo kiểu Techbros (acceptance criteria + blocked-by + HITL/AFK).
- [ ] **9/10: nhận email confirm tham gia** → xác nhận ngay.

### Tuần 3 (10–17/10): Xây "vũ khí" chung (không phải code sản phẩm thi)
- [ ] Skeleton app với: auth đơn giản, mock data layer, **deterministic offline mode** (fixture JSON + seeded DB), SSE/chat plumbing, evaluator-pattern module (LLM propose → rule verify → human approve).
- [ ] Script demo harness: seed/reset DB 1 lệnh, demo-mode toggle, screenshot-friendly UI.
- [ ] Luyện Codex: thử nghiệm parallel subagents, custom skills, spec-first prompting; ghi lại prompt patterns hiệu quả vào `docs/prompt-playbook.md`.
- [ ] Chuẩn bị bộ văn bản nguồn cho 2 ý tưởng dự phòng (link luật/nghị định cho 3A; data giả lập giao thông cho 1A) — **chỉ research, không viết code sản phẩm** (đúng luật).

### Tuần 4 (18–24/10): Tập dượt #2 full-day + pitch
- [ ] **Full rehearsal 8 tiếng** đúng flow D-Day (10h hack → 17h freeze → pitch). Chấm chéo theo barem, mời 1-2 bạn ngoài đội làm giả khảo.
- [ ] Làm deck template 6 slide theo kiểu 長照: Pain → Solution → Demo → Impact → Architecture → Future.
- [ ] Chốt câu "one-liner" cho từng ý tưởng (phải nói gọn trong 1 câu như "agents negotiate, buyer decides").

### Tuần 5 (25–30/10): Hoàn thiện
- [ ] Code-review skeleton, test offline mode kỹ (không mạng vẫn demo được).
- [ ] Chuẩn bị: laptop sạc đủ, extension dự phòng, hotspot 4G, **CCCD/VNeID mức 2**, đăng ký thông tin team member cuối (chỉ đổi được 1 lần — chốt sớm).
- [ ] Ngủ đủ trước ngày thi. Đọc lại barem.

---

## PHẦN D — Phân công 4 người (full-stack + AI)

Học mô hình TurnDeal: mỗi người own 1 module lớn + merge liên tục qua PR nhỏ.

| Vai trò | Người | Trách nhiệm |
|---|---|---|
| **P1 — Product/Orchestration Lead** | Team lead | Product framing + PRD; own agent core (planner/orchestrator, policy engine); là "người merge" + giải quyết conflict; quyết định cut scope |
| **P2 — Backend/Data** | BE mạnh nhất | DB schema + seed/fixture data; API + verification layer (rule engine kiểm chứng output LLM); auth, idempotency, audit log |
| **P3 — Frontend/Demo UX** | FE mạnh nhất | UI demo-critical: bản đồ/dashboard/chat; trạng thái live progress ("agent đang làm gì") — đây là thứ BGK nhìn thấy; phụ trách demo script |
| **P4 — AI/Narrative** | Prompt/story | Prompt + evals cho agent loop; docs (AGENTS.md cập nhật liên tục); build pitch deck + pitch trên sân khấu; giám sát "Codex leverage" evidence |

**Codex dùng như teammate thứ 5** (cách Untitled.ai): mỗi người chạy ≥2 parallel subagents; mọi task mới đều đi qua `.scratch/` queue trước — không ai prompt trực tiếp vào main.

---

## PHẦN E — Repo skeleton chuẩn bị sẵn (public-safe từ đầu)

```
repo/
├── AGENTS.md            # "hiến pháp": baseline stack, AI/code-verify boundaries, ownership, pivot log
├── docs/
│   ├── prd/             # PRD gốc
│   ├── specs/           # design docs theo ngày
│   └── pitch/           # deck
├── contracts/           # JSON Schema cho mọi payload agent↔backend (học TurnDeal)
├── .scratch/            # task queue: 001-*.md ... acceptance criteria + blocked-by + HITL/AFK
├── fixtures/            # demo data + offline deterministic mode
└── src/ backend/ frontend/
```

**Quy tắc "constitution" viết trong AGENTS.md:**
1. LLM chỉ *propose*; mọi action có hậu quả (tiền, gửi tin, đổi state) phải qua verification layer + human approval gate.
2. Mọi LLM output validate bằng JSON schema — fail thì fallback deterministic, không retry vô hạn.
3. Demo path phải chạy 100% không mạng (fixture replay).
4. Không commit API key; đọc key từ env prompt (học TurnDeal `dev:secure`).
5. Mọi pivot ghi 1 dòng vào `AGENTS.md` — để agent khác không "tái giới thiệu" hướng cũ.

---

## PHẦN F — Runbook D-Day (31/10, 8:30–21:00)

| Giờ | Cả đội | Ghi chú |
|---|---|---|
| 08:30–10:00 | Check-in, setup máy, verify env + Codex access, ăn sáng | Test ngay `npm run dev` + 1 call model |
| 10:00–10:40 | **Quyết ý tưởng** sau khi nghe context BTC; P1 viết PRD 1 trang; cả đội băm thành task `.scratch/` | Gate: không có PRD thì chưa code |
| 10:40–11:30 | Contracts + skeleton: schema, DB, route map, fixture | Commit đầu tiên phải là contracts (như TurnDeal) |
| 11:30–12:30 | Parallel build phase 1: agent loop stub + UI shell | P4 bắt đầu pitch deck ngay |
| 12:30–13:00 | Working lunch — không dừng máy | |
| 13:00–15:00 | Parallel build phase 2: core loop end-to-end chạy được offline | **15:00 checkpoint: nếu core loop chưa chạy → CUT scope ngay** |
| 15:00–16:30 | Polish demo path, guardrails, verifier; viết demo script; seed data | 16:00 freeze tính năng mới |
| 16:30–17:00 | Code freeze, chạy demo end-to-end 3 lần (1 lần tắt mạng), quay video backup | **Video quay sẵn = bảo hiểm nếu demo sập trên sân khấu** (bài học Techbros) |
| 17:00–19:00 | Round 1: trình bày luân phiên — P1+P4 pitch, P2/P3 trả lời câu hỏi sâu (latency, privacy, trade-off, Codex usage) | Chuẩn bị sẵn câu trả lời cho: "sau hackathon phát triển thế nào?" |
| 19:00–21:00 | Ăn tối; nếu vào top 5 → stage pitch (P4 lead, demo 60–90s core loop) | |

**Thứ tự nội dung pitch round 1 (≤3 phút):** Pain (30s) → One-liner solution (15s) → **Demo live core loop (60–90s)** → agent shows its work + safety boundary (20s) → built-with-Codex story (15s).

---

## PHẦN G — Barem → hành động cụ thể

| Tiêu chí | Đội làm gì để ghi điểm |
|---|---|
| Problem framing | Mở pitch bằng con số/sự kiện VN cụ thể (đợt ngập, mốc thuế 2026); nói rõ user + chi phí hiện tại |
| Quality of build | Demo chạy live + có test/verify layer; nhắc đến "offline deterministic mode" chủ động |
| Depth of thinking | Tự chủ động nói trade-off (vì sao verify bằng code thay vì LLM-judge), privacy (PII ra sao), fallback khi model sai |
| Real-world value | Nối vào ngữ cảnh Shopee/Sea VN nếu được; impact theo 3 phía (user/vận hành/xã hội) như deck 長照 |
| Codex leverage | Kể con số: X task trong .scratch, Y parallel subagents, Z commit trong 7h; đưa 1 ví dụ cụ thể Codex giải quyết khó (merge conflict/spec drift) |
| Alignment build direction | Tên ý tưởng nêu đúng từ khóa hướng (VD "autonomous & adaptive") trong pitch |

---

## PHẦN H — Risk register

| Rủi ro | Phòng + xử lý |
|---|---|
| Demo sập khi pitch | Offline fixture mode + video quay sẵn + core loop đơn giản giải thích miệng được |
| Trùng ý tưởng với đội khác cùng chặng | Không sao — thắng bằng depth + trust boundary + demo polish; khác biệt hóa ở verification layer |
| Scope quá lớn (lỗi Untitled.ai: "chaotic") | Checkpoint cứng 15:00 — cut bất cứ thứ gì không nằm trong core loop |
| Model/API chết giữa ngày | Mock layer + fallback quyết định bằng rules; `npm run dev` offline hoàn chỉnh |
| Merge conflict cuối giờ | Merge nhỏ liên tục (mỗi 30–45'); P1 là người merge duy nhất sau 15:00 |
| Mất thời gian vì prompt dài lặt vặt | Prompt playbook viết sẵn; task vào queue trước rồi agent tự xử |
