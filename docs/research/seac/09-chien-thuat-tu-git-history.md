# Giải phẫu Git History — Chiến thuật thắng giải từ 4 repo thật

> Phân tích toàn bộ commit history của 4 repo đã public: `shaunliew/trip-canvas` (Nhì SG), `Dharshan2004/shopee-live-producer` (Ba SG), `muen1019/TurnDeal` (Nhất TW), `tar-ooo-ooo/sea-openai-hackathon-2026` (Ba TW / 長照 Agent).
> Evoloop (Nhất SG) và We Keep the Dawn (Nhì TW) không public repo → không phân tích được.

---

## 1. Số liệu thô — 4 đội build như thế nào

| Repo | Commit trong ngày thi | Khung giờ code | Merge | Test files | LOC | Docs (.md) |
|---|---|---|---|---|---|---|
| **TurnDeal** (Nhất TW) | 35 | 09:58 → 17:08 (~7h) | 18 | **64** | ~34k | 27+ |
| **長照 Agent** (Ba TW) | **75** | 10:27 → 17:21 (~7h) | **24** | 34 | ~39k | 7 + AGENTS.md 273 dòng |
| **TripCanvas** (Nhì SG) | 23 | 10:16 → 16:34 (~6.3h) | 7 | 25 | ~18k | 17 (specs/plans nhiều) |
| **Shopee Live Prod.** (Ba SG) | 13 | 11:57 → 16:56 (~5h, **PRD 2h trước**) | 2 | 7 | ~7.8k | 17 (13 file `.scratch`) |

**Đọc ngay từ bảng:**
- 2 repo TW build dày hơn nhiều (75 & 35 commit, merge liên tục) — văn hóa "merge nhỏ mỗi 15-30 phút".
- Cả 4 đều **dừng code 30–40 phút trước deadline** → dành giờ cuối cho demo/pitch, không ai "code đến giây cuối" trừ 長照 (17:21).
- TurnDeal có **64 test files** trong 1 ngày — số lượng test rất bất thường, chứng tỏ họ coi validate contract là trụ cột.

---

## 2. Commit đầu tiên nói lên tất cả

| Repo | Commit #1 | Ý nghĩa chiến thuật |
|---|---|---|
| 長照 | `AGENTS.md` (273 dòng) duy nhất | **Viết "hiến pháp" cho AI trước khi có dòng code nào** |
| Shopee Live Producer | Chỉ `prd/shopee-live-producer.md` (242 dòng) + 1 issue | **PRD trước, code sau 2 tiếng** |
| TurnDeal | README 13 dòng → 10:50 bùng nổ: `contracts/` (schema 839 dòng + 4 fixture) + `DEVELOPMENT_RULES.md` + `AGENTS.md` + script validate | **Contract + barem→kỹ thuật trước** |
| TripCanvas | Scaffold hoàn chỉnh (backend + data + AGENTS/CLAUDE/CONTEXT docs) lúc 10:16 | **Đến với "đạn đã lên nòng"** — xem mục 3 |

### 長照 — 273 dòng AGENTS.md là gì?

Bản constitution đầy đủ nhất trong 4 repo: technical baseline (3 Next.js app, port cố định, PostgreSQL+Neon+Drizzle), ranh giới "frontend không được đụng DB", quy tắc phân tầng functions/methods/services, naming convention, **quyền hạn của AI** (được tự chạy migration không phá hủy, phải hỏi nếu DROP/TRUNCATE), bắt AI **self-review diff trước khi xin done**, rule không đưa secrets vào model. Tức là: họ không "dùng AI code", họ **vận hành AI như junior dev có job description**.

### TurnDeal — `DEVELOPMENT_RULES.md` (commit 10:50): bản "dịch" barem → spec

Đây là tài liệu độc nhất trong tất cả repo: bảng ánh xạ **từng tiêu chí chấm điểm của BTC → yêu cầu kỹ thuật → bằng chứng demo**. VD:

| Tiêu chí BTC | Yêu cầu kỹ thuật họ đặt ra | Bằng chứng phải show được |
|---|---|---|
| 開發品質 (build quality) | Main path chạy được & **replay ổn định**; mọi lỗi/timeout/API fail đều có outcome rõ | Auto-validate, fixed test data, timeout, fallback, idempotency |
| 洞察與創新 (insight) | Phải show buyer/seller cách ly, intent-driven discovery, quảng cáo tách khỏi xếp hạng | Private RFQ, 2 vòng đàm phán, Sponsored không ảnh hưởng Evaluator |
| Codex 應用深度 | Dùng Codex sinh & kiểm chứng contract, test data, code, test, docs, logs | **"Git commit, PR, test output, dev log"** — họ giữ lại git history như *bằng chứng cho BGK* |

Cùng file còn ghi: rule BTC (deadline 17:35, round 1 = demo 6' + Q&A 2'), **MVP scope cực chặt** (1 con chuột + 1 lót chuột, 3 seller, timeout 3s/seller, deadline 8s), trust boundaries đánh số 1–6, và **bảng acceptance theo owner** (Tech Lead / Negotiation / Evaluator / UI — ai giao gì, tiêu chuẩn nghiệm thu).

→ Đây chính là "bài mẫu" cách chuyển barem thành engineering requirements. Nên sao chép 1:1 cho đội VN.

---

## 3. Bí mật lớn nhất: **chuẩn bị trước ngày thi**

Bằng chứng trong git/docs:

- **TripCanvas**: `CLAUDE.md` ghi *"Empirical timings (measured 2026-05-27)"* — họ đã **đo từng stage của pipeline 10 ngày trước thi** (Apify ~22s/reel, extraction 215s, enricher 144.7s…). Spec plan date **2026-06-05** — viết đêm trước ngày thi. Commit 10:16 đã là scaffold hoàn chỉnh.
- **長照**: AGENTS.md có link **Google Slides brief làm trước** (repo chứa bản pptx offline); team còn có repo practice trước đó.
- **TurnDeal**: day 1 giờ đầu chỉ toàn docs/contracts — kiến trúc đã được nghĩ sẵn, ngày thi chỉ "viết lại thành code".
- **Techbros**: PRD 242 dòng xong lúc 11:57 — có thể soạn sẵn dàn ý, event viết lại.

**Luật cho phép "chuẩn bị ý tưởng trước" — cả 4 đội đều tận dụng tối đa khoảng xám này:** research, spec, skeleton, đo lường, data fixture làm trước; ngày thi = thực thi + thích nghi. Đội VN nên làm y hệt (xem timeline `07`).

---

## 4. Mô hình pha build — 4 repo đều cùng 1 hình dạng

```
Pha 0 [trước thi]      Research + spec + skeleton + đo pipeline + fixture data
Pha 1 [giờ 0–1.5]      "Hiến pháp": AGENTS.md / PRD / contracts / DEV_RULES  → commit đầu tiên
Pha 2 [giờ 1–4]        Song song hóa theo owner (mỗi người 1 module/pillar)   → commits dày
Pha 3 [giờ 3–5.5]      Sóng merge + integrate end-to-end                      → merge dồn
Pha 4 [giờ 5.5–7]      CUT SCOPE + demo finalize + README                      → freeze sớm
Pha 5 [sau thi]        Dọn repo public: xoá internal dev docs, refactor, LICENSE
```

Bằng chứng Pha 4 — "giờ chết scope":
- Techbros: 16:23 *"drop policy panel"*, 16:50 *"Remove AI answers and activity log panels from host console"* — **xóa tính năng 10 phút trước freeze** để demo sạch.
- TripCanvas: 16:28 *"Finalize TripCanvas hackathon demo"* — dừng 32 phút trước 17:00.
- TurnDeal: 17:08 commit cuối *"secure mobile LLM access and polish shopping UI"* — polish là việc cuối cùng.

Bằng chứng Pha 5 (sau ngày thi):
- TurnDeal: 16/9 `chore: remove internal AI-agent and dev-process docs from repo` — public repo chỉ giữ "mặt hàng" đẹp.
- TripCanvas: 7/6 cả buổi chiều refactor qua PR `codex-codebase-cleanup` (chia packages) — **code bẩn trong ngày, dọn sau**.
- Techbros: README chỉnh lại + LICENSE 2 tuần sau.
- 長照: docs phần "demo script" tạo sau đó.

---

## 5. Chiến thuật CODING — các pattern kỹ thuật lặp lại

### 5.1 Contract/Schema-first (mọi repo thắng đều có)
- TurnDeal: `a2a-commerce.v0.1.schema.json` **839 dòng** + 4 fixture (happy-path, edge-cases, api-examples, sellers) commit lúc 10:50, + script `validate-contracts.mjs`. Rule: "nếu implementation lệch contract → sửa contract qua reviewed change, không sửa consumer".
- TripCanvas: Pydantic typed output cho mọi agent (`output_type=ExtractionResult`), `lat/lng` bound `ge=-90/le=90` để bắt hallucinate tọa độ, `evidence_caption_quote` phải là verbatim substring của caption nếu không thì drop.
- 長照: OpenAPI spec + Swagger UI, message validate trước khi vào agent.

### 5.2 "AI propose → code verify → human decide" (hard-coded thành kiến trúc)
- TurnDeal "trust boundaries": Seller Agent chỉ nhận RFQ riêng, **trả về draft chứ không được tự gán `eligible`**; backend tính eligibility từ catalog snapshot/budget/điều kiện; Evaluator chỉ xếp hạng offer đã validate, output phải check từng `offer_id` tồn tại + chưa hết hạn, **sai thì reject toàn bộ output + fallback**.
- TripCanvas: payment = AP2 signed mandate **human gate**, booking chỉ `is_mock=True`; model không được tự hoàn tất mua hàng.
- Techbros: policy-warning path chặn claim y khoa/pháp lý; missing facts → escalate host chứ không hallucinate.
- 長照: `阻擋常見提示詞注入` (chặn prompt injection, commit 14:43), message validation, "official reference" grounding (14:55).

### 5.3 Offline deterministic = đường sống của demo
- TurnDeal rule: *"main path phải deterministic, chạy được KHÔNG cần OpenAI API; AI fail → deterministic fallback"* — ngay trong AGENTS.md.
- TripCanvas: `/demo-cache` endpoint build từ **12:05** (giờ thứ 2); CLAUDE.md ghi thẳng: *"Cache path is THE demo path"* vì live extraction 215s > 80s timeout. Commit data JSON vào repo.
- Techbros/長照: seeded DB + fixture reset.

### 5.4 Nhịp merge — cách song song hóa mà không nổ build
- 長照: **75 commits / 24 merge trong ~7h** — 3 dev 3 branch (`taro` = agent core+API, `alvin` = user UI+API, `tiffany` = admin), merge về main mỗi 15–30 phút.
- TurnDeal: 18 merge; commit message kiểu `merge: sync Result UI v0.3 with formatter`, `merge: integrate latest seller database and improver` — merge là **hoạt động chính**, không phải phụ.
- Techbros: ít merge hơn (đẩy thẳng main, đội nhỏ + issue queue điều phối).
- Bài học: merge sớm và thường xuyên > merge lớn cuối ngày (tránh "chaotic" kiểu Untitled.ai tự nhận).

### 5.5 "Hard-won learnings" ghi thành rule cho agent
TripCanvas CLAUDE.md có mục dạy từng lỗi đắt giá — đây là cách họ biến bug thành tài sản:
- `tool_choice="required"` không thì model bỏ qua WebSearchTool và hallucinate coords;
- `client_session_timeout_seconds=300` cho MCP (default 5s luôn timeout);
- `output_type` phải là Pydantic model chứ không phải bare list;
- Sai tolerance cho soft verification gate (`_SEARCH_GATE_TOLERANCE=2`).

→ Trong ngày thi, mỗi lần fix được 1 bug "khó" → **ghi ngay thành rule** để agent không tái phạm khi làm module khác.

### 5.6 Quản lý pivot bằng "lệnh cấm ngược"
AGENTS.md/CLAUDE.md của TripCanvas ghi thẳng: *"react-pageflip, flipbook, Google Maps, MapLibre, Three.js, Duffel, ffmpeg, transcription, yt-dlp — DROPPED, do not reintroduce"* + *"Ask before changing main flow"*. Khi pivot, nguy cơ lớn nhất là **agent tự "hồi sinh" hướng cũ** → họ khóa bằng negative rules.

### 5.7 Ownership viết rõ trong doc, không chỉ nói miệng
- TripCanvas CLAUDE.md bảng Team Roles: Shaun = frontend 3D + backend agent logic + demo reliability; Zhi Hao = AP2/x402; Cody = Pydantic schemas + agent code.
- TurnDeal: "Ownership boundaries" + bảng acceptance theo owner (Tech Lead/Negotiation/Evaluator/UI — ai giao gì, tiêu chuẩn nghiệm thu).
- Commit authors xác nhận: TurnDeal 4 người đều commit; 長照 3 dev + 1 (Harry = pitch/media, không commit code); TripCanvas chỉ 2 author git (Cody không commit → làm schemas trên máy chung/pair).

---

## 6. Chiến thuật Ý TƯỞNG & SẢN PHẨM

Từ cách 4 đội định hình sản phẩm:

1. **MVP scope khoa học, không cảm tính**: TurnDeal định nghĩa MVP = "1 chuột + 1 pad, 3 seller, 2 vòng, timeout 3s, deadline 8s". Số cụ thể = dễ chia việc, dễ test, dễ nói với BGK.
2. **One tight demo loop beats three half-built features** — nguyên văn CLAUDE.md. Câu này nên đóng khung.
3. **Trust boundary là selling point, không phải implementation detail**: cả TurnDeal (offer validation), TripCanvas (AP2 mandate) lên giọng "agent không được tự ý" như *điểm khác biệt* — đúng thứ BGK Sea quan tâm.
4. **Chọn 1 "headline moment"**: TripCanvas = "the agent really pays" (x402 settlement); TurnDeal = "5 agent đàm phán song song trong 60s"; 長照 = "điền form chính thức qua chat". Demo xoay quanh 1 khoảnh khắc ấn tượng, phần còn lại là supporting cast.
5. **UI bar đo bằng giây**: TurnDeal đặt chuẩn *"người xem lần đầu hiểu trong 30 giây"*; TripCanvas đặt "globe phải zoom ngay khi /extract trả về, không chờ itinerary" — phản hồi sớm, agent "shows its work" nhưng **không show chain-of-thought** (chỉ rationale/evidence/status).

---

## 7. Chiến thuật HOÀN THIỆN & DEMO (giờ cuối + pitch)

- **Demo-cache/offline build từ giờ thứ 2**, không phải phút cuối (TripCanvas 12:05).
- **Seed/reset state** luôn sẵn: Techbros issue 012 "resettable demo state + internally consistent seed data".
- **README là submission artifact**: TurnDeal README rewrite as "product overview"; Techbros README cuối ngày 16:56; cả 4 đều ghi rõ built-during-hackathon traceability ("Preserve meaningful commit history so judges can identify work" — họ tối ưu cả git log cho BGK đọc!).
- **Judge demo script có acceptance**: Techbros task 012 cover cả sequence: auto-answer → spam ignore → escalate → memory → repeat auto-answer → policy warn → sales coach — tức là demo **duyệt qua tất cả capability** theo thứ tự biên sẵn.
- **Post-hackathon hygiene**: xóa internal docs (TurnDeal), refactor (TripCanvas), LICENSE/README (Techbros) — repo public sau đó là "product portfolio", không phải bãi rác.

---

## 8. Checklist chiến thuật cho đội VN (đúc kết → hành động)

**Trước ngày thi (bắt buộc học 4 đội):**
- [ ] Product brief + spec viết sẵn (kiểu 長照 Google Slides, TripCanvas specs)
- [ ] Skeleton + pipeline **đo timing thật** từng stage (kiểu TripCanvas 27/5)
- [ ] Fixture/seed data + deterministic offline path chạy thử không cần API
- [ ] AGENTS.md "hiến pháp" 200+ dòng: stack baseline, ranh giới, naming, AI permissions, self-review rule, secrets rule, commit convention

**Giờ đầu (10:00–11:30):**
- [ ] Bản **DEV_RULES dịch barem → requirement → evidence** (sao chép mô hình TurnDeal)
- [ ] Contracts/schema + fixtures commit trước mọi code
- [ ] MVP scope viết bằng số cụ thể (X sellers, Y vòng, timeout Zs)
- [ ] Ownership + acceptance criteria theo người

**Giữa ngày:**
- [ ] Merge nhỏ mỗi 15–30 phút, 1 người làm "merge owner"
- [ ] Mọi pivot → negative rule trong AGENTS.md ("do not reintroduce X")
- [ ] Mọi bug khó → "hard-won learning" note cho agent
- [ ] Demo-cache endpoint + seed reset từ sớm

**Giờ cuối (16:00+):**
- [ ] Freeze tính năng; chủ động **xóa panel/feature thừa** (kiểu Techbros)
- [ ] Chạy demo script 3 lần (1 lần offline), quay video
- [ ] README viết như submission artifact; git history sạch, có ý nghĩa
