# 6 dự án đạt giải — Sea x OpenAI Regional Codex Hackathon (Singapore + Đài Loan)

> Tra cứu ngày 25/9/2026. Repo GitHub được xác nhận qua GitHub API + README; các dự án không tìm thấy repo public được ghi chú rõ.

## Bảng tổng hợp

| Chặng | Giải | Đội / Sản phẩm | Chủ đề | Repo public? |
|---|---|---|---|---|
| 🇸🇬 Singapore (6/6/2026) | 🥇 | Untitled.ai — **Evoloop** | Game AI tự tiến hóa (white-box) | ❌ Chưa public |
| 🇸🇬 Singapore | 🥈 | **TripCanvas** | Lập lịch trình du lịch từ Reels → bản đồ 3D → thanh toán agentic | ✅ `shaunliew/trip-canvas` |
| 🇸🇬 Singapore | 🥉 | Team Techbros — **Shopee Live Producer** | AI "đạo diễn hậu đài" cho live commerce | ✅ `Dharshan2004/shopee-live-producer` |
| 🇹🇼 Đài Loan (12/9/2026) | 🥇 | **TurnDeal** | Agent-to-agent commerce: AI đàm phán giá với nhiều seller | ✅ `muen1019/TurnDeal` |
| 🇹🇼 Đài Loan | 🥈 | **We Keep the Dawn** | Game sinh tồn không gian, lõi multi-agent collaboration | ❌ Chưa public |
| 🇹🇼 Đài Loan | 🥉 | **長照 Agent** (Long-term Care Agent) | Trợ lý hồ sơ/tư vấn chăm sóc dài hạn | ⚠️ Rất có khả năng là `tar-ooo-ooo/sea-openai-hackathon-2026` (chưa xác nhận 100%) |

---

## 🇸🇬 Chặng Singapore

### 🥇 Evoloop — Team Untitled.ai ($30,000 OpenAI credits)

**Sản phẩm:** một game bắn tank multiplayer + framework **Evoloop** tạo ra *self-evolving game bots* chiến đấu với người chơi thật.

**Cách hoạt động** (theo chia sẻ của thành viên Kai Zhuo Lim):
- Vòng lặp lặp (iterative loop): LLM bắt đầu từ codebase logic ban đầu của bot → sau mỗi trận đấu, LLM **viết lại strategy code** dựa trên gameplay feedback → bot mạnh dần theo thời gian.
- Điểm khác biệt được BGK đánh giá cao: **white-box** — policy cuối cùng vẫn là code người đọc được, audit được, giải thích được (khác với neural network black-box). Tiềm năng ứng dụng sang tài chính — nơi interpretability/auditability quan trọng ngang performance.
- Cảm hứng: bài blog về *heuristic learning* của Jiayi (link trong bài LinkedIn của Kai Zhuo Lim: `lnkd.in/gFGj_MbD`).
- Build hoàn toàn bằng Codex trong ngày thi.

**Đội:** Gan W. (AI Engineer @ AIDX TECH), Kai Zhuo Lim, Vivian Chew, Lakshmi Aishwarya Vathada — cả nhóm là bạn học chương trình **SMU Master of IT in Business (MITB)**, tên nhóm nội bộ xưa nay là "DBT" (Da Best Team, vinh danh GS. Bing Tian Dai).

**Links:**
- LinkedIn Kai Zhuo Lim: <https://www.linkedin.com/posts/kaizhuolim_this-is-my-1st-linkedin-post-but-i-wanted-activity-7469730699735138304-A3vg>
- LinkedIn Gan W.: <https://www.linkedin.com/posts/ganwang23_ai-hackathon-codex-activity-7470066415052562433-CuVu>
- Báo Business Times: <https://www.businesstimes.com.sg/startups-tech/technology/ai-innovation-inaugural-sea-openai-regional-codex-hackathon-singapore>
- **GitHub repo: không tìm thấy public** (đã search GitHub API với "evoloop", "tank", repos tạo ngày 6/6/2026 — nhiều khả năng repo private).

---

### 🥈 TripCanvas — Team TripCanvas ($15,000)

**Repo:** <https://github.com/shaunliew/trip-canvas> (tạo đúng ngày thi 6/6/2026; contributors: `shaunliew`, `BrownBOBAsushi`)

**Track:** AI-Native Products & Operations

**Vấn đề:** người dùng save hàng chục Instagram Reels du lịch nhưng việc biến "vibe" thành kế hoạch thật là thủ công: tìm địa điểm → check map → so khách sạn → xếp lịch → thanh toán.

**Giải pháp — pipeline end-to-end:**
1. Paste 3–4 URL Reels + ngày đi, ngân sách, thành phố xuất phát, preferences.
2. Backend agents extract địa điểm thật từ Reel (qua **Apify MCP scraping**), geocode, đối chiếu constraint.
3. Frontend zoom từ **Mapbox globe 3D** vào bản đồ điểm đến.
4. Agent research song song: places, weather, trade-off vị trí khách sạn, tính khả thi lịch trình.
5. Render itinerary trên Mapbox 3D tilted map + thẻ lịch trình; chọn bất kỳ điểm nào sẽ thấy **vì sao agent chọn nó** (evidence, timing, tradeoffs, route context) — "the agent shows its work".
6. Sau khi user duyệt: handoff booking khách sạn qua **AP2 mandate approval + x402 payment loop** — agent chuẩn bị flow nhưng không thể tự ý trừ tiền; backend verify signed mandate trước khi payment chạy.

**Đội:** Shaun Liew, Chye Zhi Hao, Cody T.

**Links:**
- Repo: <https://github.com/shaunliew/trip-canvas>
- LinkedIn Cody T.: <https://www.linkedin.com/posts/cody-t-733a38252_thankscodex-writtenbyme-openai-activity-7469389461131476992-xFG4>
- LinkedIn Chye Zhi Hao: <https://www.linkedin.com/posts/chye-zhi-hao_openai-sea-buildinpublic-activity-7469326306065924096-MIia>
- Follow-up: team phát triển tiếp ý tưởng thành **Astrail** cho OpenAI WebMCP Challenge — repo `shaunliew/astrail-webmcp` (8/2026).

---

### 🥉 Shopee Live Producer — Team Techbros ($5,000)

**Repo:** <https://github.com/Dharshan2004/shopee-live-producer> (4 stars, tạo 6/6/2026, MIT license)

**Vấn đề:** host livestream bán hàng phải vừa trình bày, vừa trả lời chat, lọc spam, quảng bá sản phẩm, giữ engagement — trong khi thường không nắm hết thông tin sản phẩm → bỏ lỡ sale, trả lời sai, mất trust.

**Giải pháp — "AI backstage producer", không thay thế host:**
- Xem buyer chat realtime → phân loại từng comment thành **auto-reply / escalate / warn / no-action**.
- Chỉ trả lời từ **product facts đã verify trong DB** (database fact-ID grounding) → chống hallucination.
- Câu hỏi không chắc → **escalation queue** cho host thay vì đoán bừa.
- **Policy guard** chặn claim y tế/pháp lý/guarantee *trước khi post*; flag cả claim rủi ro host nói trên live.
- **Session memory:** khi host trả lời một câu, hệ thống học và tự trả lời câu tương tự suốt buổi live (điểm BGK nhấn mạnh trên báo).
- Nghe luôn giọng nói seller trên live, transcribe → làm giàu knowledge base; kèm **live sales coach** gợi ý benefits/promo/xử lý objection.

**Stack:** Next.js 15, React 19, TypeScript, LangChain **DeepAgents**, Supabase Realtime + PostgreSQL, OpenAI. Trong quá trình build, team dùng **parallel Codex subagents** (frameworks "grill-me", "to-issues") để xử lý merge conflict multi-branch dưới áp lực thời gian.

**Đội:** Priyadharshan Kannan (kiến trúc multi-agent orchestration), Poh Shi Sien, Dillon Tan, Bhvya Sahni.

**Links:**
- Repo: <https://github.com/Dharshan2004/shopee-live-producer>
- LinkedIn Priyadharshan Kannan: <https://www.linkedin.com/posts/kpriyadharshan_openai-sea-codex-activity-7469403743986298880-SdJB>
- LinkedIn Poh Shi Sien: <https://www.linkedin.com/posts/poh-shi-sien-2331a7261_openai-sea-codex-activity-7469685179041619968-cerF>
- Portfolio: <https://kpriyadharshan.dev/>
- Bản kế thừa: `likalight/live-commerce-producer` (đem ý tưởng đi thi BUIDL_OPC_Hackathon_SG)
- Cùng team sau đó build **Beeline** (conversational shopping agent, TikTok TechJam 2026) — có Devpost + demo video trong bài LinkedIn của Priyadharshan.

---

## 🇹🇼 Chặng Đài Loan

### 🥇 TurnDeal ($30,000)

**Repo:** <https://github.com/muen1019/TurnDeal> — *"Turn Your Need into a Deal"* (58 commits, tạo đúng ngày thi 12/9/2026)

**Sản phẩm:** nền tảng **agent-to-agent commerce**. Buyer mô tả nhu cầu/ngân sách/ràng buộc → TurnDeal format thành request → **đàm phán riêng, song song với tối đa 5 Seller Agents** → backend validate từng offer → evaluator độc lập chấm điểm → buyer "swipe" quyết định.

**Nguyên tắc lõi:** *"agents can negotiate, but the buyer decides"* — sponsored placement không ảnh hưởng ranking; accept offer ≠ thanh toán; add-on trả phí phải được user cho phép tường minh.

**Kiến trúc:**
- Flow: Request → Formatter → Orchestrator → (Buyer↔Seller A…E) → Evaluator → Swipe UI → ACP test checkout (thanh toán giả lập).
- Validation phía backend cho inventory, giá, giao hàng, điều khoản, expiry, benefits, quyền add-on.
- Safety boundaries nghiêm ngặt: output của Seller/model là untrusted; mỗi Seller chỉ thấy RFQ của mình + comparable terms đã de-identify; idempotency key cho mọi POST; request/offer/snapshot immutable; SQLite là nguồn truth duy nhất.
- **Offline deterministic mode** (`npm run dev` chạy hoàn toàn không cần API key — phục vụ demo); `dev:secure` đọc key qua hidden prompt, không ghi file.
- MVP demo: 120 listing synthetic, 1 chuột không dây + mouse pad liên quan.

**Stack:** Node.js 24, React + Vite, Express, SQLite (sql.js), Ajv (JSON Schema validation), Playwright test, OpenSpec workflow; thư mục `contracts/` chứa JSON Schema + ACP spec.

**Đội (contributors):** `muen1019`, `jonathan0626`, `ki225`, `itisJoshuaTseng` — muen1019 có repo `ntu-course` (tool chọn môn NTU) → khả năng team gồm sinh viên ĐH Quốc lập Đài Loan.

**Links:**
- Repo + README kiến trúc đầy đủ (docs/SYSTEM_DESIGN.md, contracts/, db/migrations/): <https://github.com/muen1019/TurnDeal>
- Báo: 自由財經 <https://ec.ltn.com.tw/article/paper/1770621>, udn <https://udn.com/news/story/7270/9751769>, NewsPie <https://www.newspie.com.tw/shopee-sea-openai-20260914/>

---

### 🥈 We Keep the Dawn ($15,000)

**Sản phẩm:** **game mô phỏng sinh tồn không gian** (space survival simulation) với lõi là **nhiều AI agent phối hợp** (multi-agent collaboration) — theo mô tả thống nhất của Shopee qua các báo Đài Loan.

**Repo/thông tin đội:** ❌ **Không tìm thấy repo public hay bài chia sẻ của đội** — đã thử GitHub search (tên repo, "dawn", "space survival agent", repos tạo 11–16/9/2026), web search tiếng Trung/Anh, LinkedIn. Team này giữ kín thông tin hoặc repo private.

**Nguồn duy nhất:** báo chí Đài Loan (UDN, 工商時報, 自由時報, NewsPie, Mirror Media).

---

### 🥉 長照 Agent — Long-term Care Agent ($5,000)

**Sản phẩm (theo báo chí):** AI giúp gia đình **tổng hợp nhu cầu chăm sóc** và **thông tin/thủ tục đăng ký dịch vụ chăm sóc dài hạn (長照)** tại Đài Loan.

**Repo:** <https://github.com/tar-ooo-ooo/sea-openai-hackathon-2026> ✅ *(đã xác nhận qua pitch deck `Sea x OpenAI Hackthon.pdf` trong repo — deck của "第九組" trình bày đúng sản phẩm 長照 Agent)*

**Đội (第九組 / Group 9):** 羅子祐、范禎宸、陳佳朋、林郁盛 (GitHub contributors: `tar-ooo-ooo`, `alvinlo62`, `tiffanyfan1015`, `harryjia1007`)

**Stack theo deck:** Neon Database, OpenAI API (model "GPT-5.6 luna" ghi trong deck), OpenAI Agents SDK (Agent/Tool Calling), OpenAI Images API (image generation)

**Kiến trúc (đọc từ README repo trên):**
- Monorepo 4 app: `apps/user` (前台, :3000), `apps/admin` (後台專員, :3001), `apps/api` (shared API, :3002), `apps/application` (長照申請頁, :3003) → Neon PostgreSQL (Drizzle ORM).
- Chat agent dùng **OpenAI Agents SDK**, stream NDJSON (`progress`/`result`/`error`); rolling conversation summary (80 tin nhắn → gộp 60 cũ vào summary, giữ 20 gần nhất).
- Function tools: `collect_application_intake` (gom trường dữ liệu đơn đăng ký, trả `collecting`/`ready`), `update_application_package`.
- **Emergency triage API** song song với chat: phân loại tin nhắn `normal`/`follow_up`/`emergency` bằng structured outputs (tham chiếu NHS 999/stroke warning signs) → đẩy lên dashboard 專員 ưu tiên khẩn cấp.
- Grounding bằng nguồn chính thống: trang 長照專區 1966 của 衛福部 (Long-term Care Service Act, 申請及給付辦法); chỉ dẫn link khi user hỏi nguồn.
- Bảo mật: chặn prompt injection (400 cho message mạo system/developer), session cookie auth, không trả dữ liệu người khác, anti-PII trong overview API.

**Đội (contributors):** `tar-ooo-ooo` (41 commits), `alvinlo62` (19), `tiffanyfan1015` (15), `harryjia1007` (1).

---

## Nhận định chung từ 6 bài thắng

- **Cả 2 giải Nhất đều là "agent nhận quyền hành động nhưng giữ người kiểm soát":** Evoloop (AI tự cải thiện nhưng policy vẫn là code audit được), TurnDeal (agent đàm phán nhưng buyer quyết định, payment cần consent tường minh).
- **Mẫu thắng lặp lại:** guardrails + escalation (Shopee Live Producer, TurnDeal, 長照 Agent đều có lớp kiểm chứng/chặn/triage riêng biệt khỏi LLM) — các đội đều thiết kế "AI can propose, code/system verifies, human decides".
- **Demo offline deterministic** được TurnDeal làm rất chỉn chu — đáng tham khảo để tránh rủi ro sân khấu.
- Cơ hội cho VN: các hướng còn "trống" so với bài thắng — health/legal deep domain, agentic commerce phía seller, multi-agent simulation.
