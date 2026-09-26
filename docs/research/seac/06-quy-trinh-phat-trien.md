# Quy trình phát triển & phân công trong ngày thi — các đội đạt giải

> Nguồn: working docs còn lại trong các repo public (`.scratch/`, `docs/superpowers/`, `AGENTS.md`, commit history) + bài chia sẻ của thành viên. Đây là "xương sống" quy trình thực tế các đội thắng đã dùng — rất đáng học cho chặng VN.

---

## 🇸🇬 Untitled.ai — Evoloop (Nhất SG)

**Phân công theo "3 trụ cột của game app"** (chia sẻ của Lakshmi):
1. Core game engine
2. Game design, UI & assets
3. Kiến trúc host workflow + khả năng scale

**Cách build (theo Gan W.):**
- Gan là người giữ ý tưởng từ trước ("idea I had been pondering for quite a while"), gom đội và drive execution — tự nhận *"chaotic execution plan"*.
- Trong **7 tiếng** phải xong: game core, replay mechanism, UI, mobile control, framework Evoloop, training dashboard, connector SKILL, cloud deployment — *"simply would not be possible without Codex"*.
- Coi **Codex là "thành viên thứ 5"** của đội.
- Demo mở rộng: ngoài game tank battle royale, team còn port heuristic sang **Slither.io** để chứng minh framework tổng quát — điểm ghi dấu "originality" với BGK.
- Nguồn cảm hứng kỹ thuật: blog **Heuristic Learning** của Jiayi Weng — LLM viết lại strategy code sau mỗi trận self-play (evolutionary search với LLM làm mutation engine).

*Bài học: ý tưởng có "owner" rõ ràng + build surface được phân thành các pillar độc lập ghép được.*

---

## 🇸🇬 Team TripCanvas (Nhì SG) — quy trình spec-driven mẫu mực nhất

Repo `shaunliew/trip-canvas` giữ lại toàn bộ working docs → tái hiện được quy trình:

**1. Workflow "Superpowers":** `docs/superpowers/specs/` (design docs có ngày) + `docs/superpowers/plans/` (implementation plan dạng checkbox task). Mỗi plan ghi rõ *"REQUIRED SUB-SKILL: use subagent-driven development / executing-plans to implement task-by-task"* — tức agent thực thi plan theo từng task được tick.

**2. Source of truth sống:** `CLAUDE.md`/`AGENTS.md` được cập nhật liên tục trong ngày. Có cả **mục ownership trong AGENTS.md**: *"Zhi Hao owns real AP2/x402 provider work"* — phân quyền module rõ ràng ngay trong doc cho agent đọc.

**3. Spike-first:** code thử nghiệm ở `backend/spike_*.py` (spike_planner, spike_agentic_payments) → khi chuẩn hoá mới refactor vào `backend/api`, `backend/planner`, `backend/payments`.

**4. Pivot được ghi lại, không bị mất context:** ghi chú ngày 6/6 trong AGENTS.md — bỏ `react-pageflip`/pop-up book → Mapbox 3D tilted map làm primary surface ("permanently dropped — do not reintroduce"); bỏ Duffel → **AP2 + x402** (payment là headline, booking vẫn mock `is_mock=true`).

**5. Demo resilience by design:** "Backend Cache — one-click replay from committed backend caches"; `X402_MODE=simulation` mặc định offline-safe; hiển thị live/cache source state; deterministic fallback khi thiếu API key. Rule trong AGENTS.md: *"Do not expose hidden chain-of-thought — show user-facing rationale, evidence, tool status."*

**6. Sau thi:** commit `2026-06-07-codebase-cleanup.md` — dọn dẹp ngay hôm sau; ý tưởng tiếp tục thành startup **Astrail**.

---

## 🇸🇬 Team Techbros — Shopee Live Producer (Ba SG)

Repo `Dharshan2004/shopee-live-producer` để lại toàn bộ "xương sống" quy trình trong `.scratch/`:

**1. PRD → issue queue cho agent:**
- `docs/prd/shopee-live-producer.md` là PRD gốc.
- PRD được băm thành **13 file issue markdown** (`001`→`013`), mỗi file có: mô tả "What to build", **acceptance criteria dạng checklist**, mục **"Blocked by"** để định thứ tự phụ thuộc.
- Mỗi task gắn label `ready-for-agent` + phân loại **HITL** (cần người xác nhận setup — VD: task 001 bootstrap cần người chốt framework/Supabase/env trước) vs **AFK** (agent tự chạy hết).
- Gh auth hỏng nên issue được publish dạng file local — quy trình vẫn giữ nguyên.

**2. Parallel Codex subagents** (theo profile Priyadharshan): chạy các concurrency framework **`grill-me`** (extract engineering intent) và **`to-issues`** — dùng agent để resolve merge conflict multi-branch dưới áp lực giờ.

**3. Phân công:** Priyadharshan own multi-agent orchestration + DB fact-ID grounding + session memory + policy guardrails; các thành viên khác chia theo pipeline (chat ingestion, UI host/buyer console, transcription).

**4. Demo được engineering hoá như 1 task:** task `012-judge-demo-script-and-e2e-verification` — yêu cầu script demo chạy hết flow (auto-answer → spam ignore → escalation → memory → policy warning → sales coach), có E2E test, **demo resettable về clean room**, không phụ thuộc trang ngoài.

**5. Thực tế xảy ra (Medium post 16/6/2026 của Priyadharshan):** *"Almost nothing went to plan. Build broke 1 giờ trước khi nộp. 2/3 demo fail ngay trên sân khấu. Vẫn đoạt giải — thứ cứu team không phải stack, mà là core loop đủ đơn giản để khi các phần fancy rớt đi, BGK vẫn hiểu đúng thứ đã build và vì sao."*
- Build thực tế ~8 tiếng (theo Poh Shi Sien).

---

## 🇹🇼 TurnDeal (Nhất TW) — contracts-first + merge liên tục

Commit history `muen1019/TurnDeal` tái hiện trọn ngày thi (giờ UTC, event 9:30–21:30 TST ≈ 01:30–13:30 UTC):

| Giờ (UTC) | Việc |
|---|---|
| 01:58–02:48 | Init repo → **"add shared development contracts and team guide"** — contracts/JSON Schema viết TRƯỚC code |
| 03:25–04:47 | Song song: demo data + SQLite (jonathan0626); system design docs + "specify 5 sellers / 5 negotiation rounds" (muen1019); Result UI chat+swipe (ki225) |
| 05:07–07:50 | Discovery→seller handoff, validated LLM formatter, 5-seller negotiation + evaluation, buyer improver + ACP test purchase — **merge liên tục qua PR (#1–#4)** |
| 07:50–09:16 | Frontend TurnDeal branding, mobile onboarding + weighted preferences, secure mobile LLM access, public demo access |
| 09:16–15:24 | Fix preference/config, e2e test chạy frontend với runtime thật, welcome screen, **README rewrite thành product overview** |
| Sau thi | `chore: remove internal AI-agent and dev-process docs` — dọn sạch doc nội bộ trước khi public |

**Phân công** (từ commit + bài LinkedIn của Jonathan):
- **Mu-En Chiu** (leader/mời team): system design, negotiation engine, seller personas/policies, bounded evaluation, làm "người merge" chính.
- **Jonathan Peng**: shared schemas, Formatter/Orchestrator workflow, SQLite + demo data, mobile-first frontend (welcome, swipeable Deal Cards, checkout), tích hợp end-to-end.
- **Yung-Chi Huang / Kiki H**: Result UI (chat + swipe decision APIs), buyer request improver + clarification backend, ACP purchase, docs/README polish.
- **Ling-Cheng Tseng / Joshua Tseng**: ý tưởng gốc + product narrative (có research A2A/UCP/ACP từ trước qua talk COSCUP của Sasha Denisov), setup repo ban đầu.

Nguyên tắc Jonathan nhấn: *"Everyone took ownership of a major part of the product while continuously reviewing, integrating, and improving the work across the team."*

**Điểm ăn tiền:** mọi giao tiếp agent↔agent đi qua `contracts/` JSON Schema + Ajv validation; `docs/` chứa spec từng module (FORMATTER, ORCHESTRATOR, NEGOTIATION, EVALUATOR, IMPROVER, SELLER_POLICIES…); workflow dùng **OpenSpec**; `npm run dev` chạy **offline deterministic** hoàn chỉnh → demo không bao giờ chết.

---

## 🇹🇼 長照 Agent — 第九組 (Ba TW) — chuẩn bị trước ngày thi kỹ nhất

Dấu vết trong `tar-ooo-ooo/sea-openai-hackathon-2026`:

**1. Tập dượt trước:** repo `sea-openai-hackathon-2026-demo` tạo **22/8** — gần 3 tuần trước ngày thi, tức team đã chạy thử stack/quy trình trước (đúng luật: chỉ chuẩn bị ý tưởng & kỹ năng, code vẫn viết ngày thi).

**2. Product brief sẵn dạng slide:** AGENTS.md trỏ tới Google Slides "專案簡報" (bản gốc) + `docs/project-reference.pptx` trong repo — *"規劃功能或確認產品方向前，先參考簡報中的需求與脈絡"* → agent đọc brief trước khi code.

**3. AGENTS.md = quy ước cứng cho Codex:** baseline công nghệ (Next.js App Router, ưu tiên Server Components, Neon + Drizzle, không thêm dependency/abstract layer khi không cần, một package manager duy nhất theo lockfile), quy tắc kiến trúc (frontend không đụng DB, chỉ API :3002 dùng Drizzle), và cả menu chọn model OpenAI theo tình huống.

**4. Ranh giới "AI propose / code verify" nghiêm:** function tools giới hạn (`collect_application_intake`, `update_application_package`); API reject prompt injection; emergency triage tách riêng khỏi chat.

**5. Phân công theo commits:** `tar-ooo-ooo` 41 commits (lead), `alvinlo62` 19, `tiffanyfan1015` 15, `harryjia1007` 1 — kiểu "1 driver chính + support".

**6. Pitch deck chuẩn barem:** 痛點 → 解決方案 (關心你/協助你/陪伴你) → Demo → 影響力 (家庭/專員/政府) → 技術架構 → 未來展望 → Q&A.

---

## 🇹🇼 We Keep the Dawn (Nhì TW)

❌ Không có repo/tài liệu public — không tái hiện được quy trình.

---

## Pattern chung — "công thức thắng" rút ra

| Nguyên tắc | Bằng chứng |
|---|---|
| **Viết spec/contract trước, code sau** | TurnDeal commit đầu tiên là contracts + team guide; 長照 có brief + AGENTS.md; TripCanvas có specs/plans; Techbros có PRD |
| **Tài liệu cho agent, không chỉ cho người** | AGENTS.md/CLAUDE.md chứa ownership, pivot log, guardrails — agent đọc để không làm sai hướng |
| **Chia module ownership rõ + merge nhỏ liên tục** | TurnDeal ~50 commit / 7 PR trong ngày; Untitled.ai chia 3 pillar |
| **Coi Codex như teammate thật** | Untitled.ai gọi Codex "thành viên thứ 5"; Techbros chạy parallel subagents + framework grill-me/to-issues |
| **Demo engineering = task riêng** | Techbros task #012 script + E2E; TurnDeal offline deterministic mode; TripCanvas one-click cache replay |
| **Core loop đơn giản, explain được** | Techbros demo fail 2/3 vẫn thắng vì core rõ; TurnDeal "agents negotiate, buyer decides" giải thích trong 1 câu |
| **Ý tưởng nghiên cứu trước, code viết trong ngày** | Ling-Cheng research A2A/UCP/ACP trước; Gan ôm ý tưởng Evoloop lâu; 長照 tập stack 3 tuần trước |
| **Dọn repo sau thi để public đẹp** | TurnDeal xoá dev docs nội bộ, viết lại README; TripCanvas cleanup plan hôm sau |
