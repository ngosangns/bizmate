# Form Đăng ký — Câu trả lời cá nhân hóa cho Sang (ngosangns)

> Tách từ `10-form-dang-ky-tra-loi.md`. Xem file đó cho khung chung + phần ý tưởng (Section D) + consent.
> Profile tham chiếu: **Quang Sang Ngo** — Software Engineer @ Viclass.vn, TP.HCM. GitHub `ngosangns` + org `gnasdev`, blog `sang.id.vn`, LinkedIn `linkedin.com/in/ngosangns`.
> Profile rút từ repo/blog thật: realtime collab editor (Yjs/CRDT) tại Viclass, dev tools org gnasdev (gn-tracing, gn-drive), AI-agent plumbing (ns-kiro-provider cho OMP + DeepSeek Harness, hearth MCP server), ML nền KMA (malware detection, spam-SMS classifier), scheduling tools (tin-chi ★7, kma-schedule ★4). Vai trò gợi ý trong đội: **P1 hoặc P2** (orchestrator hoặc backend/verification).

---

## SECTION A — Participant Profile

| Câu hỏi | Trả lời |
|---|---|
| Full name (theo CCCD) | `Quang Sang Ngo` *(kiểm tra lại thứ tự trên CCCD — nếu CCCD ghi "Ngô Quang Sáng" thì điền đúng như thế)* |
| Phone | `[+84 ...]` |
| Email | `[email cá nhân]` — nên trùng email LinkedIn/GitHub |
| Background (dropdown) | *Software Engineer* / option tương đương "working professional — engineering" |
| Role / title | `Software Engineer` |
| Company / institution | `Viclass.vn` |
| LinkedIn URL | `https://linkedin.com/in/ngosangns` |
| GitHub / project link | `https://github.com/ngosangns` — pin sẵn: `viclass-next`, `ns-kiro-provider`, `hearth`, `tin-chi` (★7), `kma-schedule` (★4), `malware_detection`; link org `gnasdev` (gn-tracing, gn-drive) trong bio/profile README |
| Where are you based? | *TP. Hồ Chí Minh* |

---

## SECTION C — Technical / Execution Capability

### C1. "What experience, skills, or perspective would you bring…?"

**EN:**
> I'm a software engineer at Viclass.vn where I build a real-time collaborative document editor — Yjs CRDT sync, canvas rendering, optimistic UI, and a CI pipeline that gates every merge on visual-regression tests. Outside work I build developer tools and the plumbing AI coding agents actually run on: a model-provider adapter wiring Kiro into two agent harnesses (streaming protocol, credential rotation, retry policy), an MCP server inside my local dev-services daemon (loopback HTTP+SSE), and a browser extension that records a tab — video, console, network, WebSocket — into a shareable replay with privacy redaction. Earlier, during my security-oriented studies at KMA, I built ML classifiers for spam SMS and malicious PE files. So I sit at the intersection this hackathon is about: agents that do things, and the verification/evidence layer that keeps them honest. I bring the "agent proposes → code verifies → human decides" discipline plus deep knowledge of where agents actually fail.

**VI:**
> Tôi là software engineer tại Viclass.vn, nơi tôi xây một realtime collaborative document editor — Yjs CRDT sync, canvas rendering, optimistic UI, và CI pipeline bắt mọi merge phải qua visual-regression test. Ngoài giờ tôi build developer tools và cả "đường ống" mà các AI coding agent thực sự chạy trên: một model-provider adapter nối Kiro vào hai agent harness (streaming protocol, rotation credentials, retry policy), một MCP server trong daemon quản lý dev services của tôi (loopback HTTP+SSE), và một browser extension ghi lại một tab — video, console, network, WebSocket — thành bản replay chia sẻ được với khả năng che dữ liệu riêng tư. Trước đó, trong thời gian học chuyên ngành bảo mật tại KMA, tôi từng xây các classifier ML phát hiện spam SMS và file PE độc hại. Tức là tôi đứng đúng giao điểm mà hackathon này hướng tới: agent thực hiện hành động, và lớp kiểm chứng/bằng chứng giữ chúng trung thực. Tôi mang theo kỷ luật "agent đề xuất → code kiểm chứng → người quyết định" cùng hiểu biết sâu về chỗ agent thường hỏng.

### C2. "What's something you've built that you're proud of?"

> Bộ material yêu cầu: **engreel** (app luyện ngôn ngữ production — Explore feed, competition room realtime, AI self-improvement loop qua MCP), **gn-tracing**, **hearth**, **ns-kiro-provider**. Chọn 1 trong 2 option; Option A là đề xuất chính vì engreel vừa là sản phẩm thật vừa chứa sẵn agentic loop đúng gu cuộc thi.

**Option A — engreel (đề xuất chính: production product + có sẵn AI eval loop):**

**EN:**
> I'm most proud of **Engreel**, a language-practice product I designed and run end-to-end on my own infrastructure (Go + SolidJS, engreel.gnas.dev). Three parts make it interesting rather than "another quiz app": (1) an **Explore feed** that mixes a spaced-repetition bank first and only calls the LLM for the residual shortfall — AI is a bounded fallback, not the product's single point of failure; (2) **realtime competition rooms** where the server owns the truth — question deadlines, an HMAC answer token per room+user+question, and an ELO rating replayed at match end; and (3) a **closed-loop self-improvement system**: an agent reads generated practice items, solves them, grades them against a full rubric, records eval results, and proposes content improvements through an MCP server — I review and approve before anything mutates. Building that loop taught me a discipline I now design into every agent system: the agent proposes, code verifies, a human decides. Engreel is live and self-operated — deployment, monitoring, backup and all.

**VI:**
> Điều tôi tự hào nhất là **Engreel**, một sản phẩm luyện ngôn ngữ tôi tự thiết kế và vận hành trọn vẹn trên hạ tầng của mình (Go + SolidJS, engreel.gnas.dev). Ba phần khiến nó thú vị thay vì "thêm một app quiz": (1) **Explore feed** ưu tiên kho đề spaced-repetition trước và chỉ gọi LLM cho phần còn thiếu — AI là fallback có giới hạn, không phải điểm sống còn của sản phẩm; (2) **phòng thi đấu realtime** nơi server giữ sự thật — deadline câu hỏi do server quyết, token HMAC gắn room+user+câu cho mỗi câu trả lời, và ELO replay khi trận kết thúc; và (3) **vòng tự cải thiện khép kín**: một agent đọc các câu hỏi do hệ thống sinh, tự giải, chấm theo full rubric, ghi kết quả đánh giá, và đề xuất cải tiến nội dung qua một MCP server — tôi review và duyệt trước khi bất cứ thứ gì thay đổi. Xây vòng loop đó dạy tôi một kỷ luật mà giờ tôi đưa vào mọi hệ thống agent: agent đề xuất, code kiểm chứng, con người quyết định. Engreel đang chạy thật và tự vận hành — deploy, monitoring, backup tất cả đều do tôi.

**Option B — "bộ tool cá nhân cho kỷ nguyên AI" (gn-tracing + hearth + ns-kiro-provider):**

**EN:**
> Rather than one app, I'm proudest of a small ecosystem of tools I built for myself under gnas.dev — "self-built, self-run, self-improved": **gn-tracing**, a browser extension that records a tab (video, console, network, WebSocket) into a shareable debugging replay with privacy redaction and cloud upload; **hearth**, a local dev-services daemon with CLI, TUI, a macOS app — and an MCP server so AI agents can manage dev processes over loopback HTTP+SSE; and **ns-kiro-provider**, a model-provider adapter wiring Kiro into two different coding-agent harnesses, where I extracted one shared core (credentials, model catalog, AWS event-stream transport, stall timeouts, response assembly) so each host only composes what it needs. Each tool exists because I hit the problem myself — and building *underneath* agents taught me exactly where they fail: dropped tool calls, stale credentials, silently stalled streams. That's why everything we ship has verification and deterministic fallback designed in.

**VI:**
> Thay vì một app đơn lẻ, tôi tự hào nhất về một hệ sinh thái tool nhỏ tôi tự build cho chính mình dưới tên gnas.dev — "tự làm, tự chạy, tự cải thiện": **gn-tracing**, một browser extension ghi lại một tab (video, console, network, WebSocket) thành bản replay debug chia sẻ được, có che dữ liệu riêng tư và upload cloud; **hearth**, một daemon quản lý dev services local với CLI, TUI, app macOS — và một MCP server để AI agent quản lý process qua loopback HTTP+SSE; và **ns-kiro-provider**, một model-provider adapter nối Kiro vào hai coding-agent harness khác nhau, nơi tôi tách một core dùng chung (credentials, model catalog, transport AWS event-stream, stall timeout, response assembly) để mỗi host chỉ compose phần nó cần. Mỗi tool ra đời vì tôi tự đụng vấn đề đó — và việc build *bên dưới* agent dạy tôi chính xác chỗ chúng hay hỏng: tool call rơi mất, credential hết hạn, stream đứng im lặng. Đó là lý do mọi thứ đội tôi ship đều được thiết kế sẵn verification và fallback deterministic.

### C3. "Have you used Codex before?" (dropdown)

> Nếu đã dùng Codex → chọn mức cao nhất đúng sự thật. Điểm cộng để nhấn ở C2/D4: đã build **model-provider cho coding agents** + **MCP server** — hiểu agent plumbing tận xương, dù Codex có mới với bạn thì bạn vẫn hiểu sâu hơn đa số thí sinh. Trả lời thật, đừng ghi "expert" nếu chưa dùng.

---

## SECTION D — Hackathon Idea (điền đầy đủ — Phương án 1, đã cá nhân hóa)

> Chọn **"Kế toán AI cho tiểu thương"** vì có bằng chứng domain thật trong repo của bạn: tool `commerce` nội bộ (tính giá bán + ước tính thuế hộ kinh doanh cho seller Shopee/TikTok) — tức đội đã *tự chạm pain này*, chứ không phải đọc báo. Bản dưới đã cài chi tiết đó. Nếu đội chốt phương án khác thì copy nguyên phương án tương ứng từ `10` Section D.

**Build direction (dropdown):** *Deep Domain AI*

### D1. Problem — What problem are you solving?

**EN:**
> From 1/1/2026, Vietnam abolished the lump-sum tax (thuế khoán) for millions of household businesses — market vendors, social-commerce sellers — forcing them into declaration-based tax with e-invoices almost overnight. Today, issuing one e-invoice takes an elderly vendor 21 steps and over 2 minutes on a phone; the guidance runs hundreds of pages across multiple decrees; a single mistake risks penalties. We know this pain first-hand: we built an internal tool that estimates selling prices and household-business tax for Shopee/TikTok sellers, but it still requires an operator who understands the rules — the very thing vendors lack. The gap isn't tax knowledge; it's translating it into a tool a 55-year-old fabric seller in Chợ An Đông can use without training.

**VI:**
> Từ ngày 1/1/2026, Việt Nam bãi bỏ thuế khoán với hàng triệu hộ kinh doanh — tiểu thương chợ, người bán trên mạng xã hội — buộc họ chuyển sang kê khai thuế với hóa đơn điện tử gần như chỉ trong một đêm. Hiện nay xuất một hóa đơn điện tử mất một tiểu thương lớn tuổi 21 bước, hơn 2 phút trên điện thoại; văn bản hướng dẫn dài hàng trăm trang trên nhiều nghị định; chỉ một sai sót cũng có thể bị phạt. Chúng tôi biết pain này từ trải nghiệm thật: đội đã xây một tool nội bộ ước tính giá bán và thuế hộ kinh doanh cho seller Shopee/TikTok — nhưng nó vẫn đòi một người vận hành hiểu quy tắc, đúng thứ mà tiểu thương không có. Khoảng trống không nằm ở kiến thức thuế; nó nằm ở việc dịch kiến thức đó thành công cụ mà một bà 55 tuổi bán vải ở chợ An Đông dùng được mà không cần đào tạo.

### D2. Target users — Who is this for?

**EN:**
> Household businesses and small online sellers in Vietnam — specifically non-accountant owners: market vendors (tiểu thương chợ), small Shopee/social-commerce sellers, family-run shops now required to declare revenue, issue e-invoices, and track the 1-billion-VND exemption threshold. Secondary: ward-level tax officers and accounting volunteers answering these questions manually, one stall at a time.

**VI:**
> Hộ kinh doanh và người bán online nhỏ tại Việt Nam — cụ thể là chủ hộ không có chuyên môn kế toán: tiểu thương chợ, người bán nhỏ trên Shopee/mạng xã hội, các cửa hàng gia đình đang phải kê khai doanh thu, xuất hóa đơn điện tử và theo dõi ngưỡng miễn thuế 1 tỷ đồng. Phụ: cán bộ thuế cấp phường/xã và tình nguyện viên kế toán hiện đang trả lời thủ công từng câu hỏi, từng sạp một.

### D3. Solution — What will you build?

**EN:**
> An AI bookkeeping agent that turns selling into compliance. The vendor records sales the way they naturally would — a Vietnamese voice note ("sáng nay bán 3 áo, 250 nghìn") or a photo of their notebook — and the agent structures it into ledger entries, drafts e-invoice data, tracks the VND 1 billion exemption threshold, and answers tax questions with citations from official documents (Tổng cục Thuế, NĐ 141/2026, NĐ 254/2026). The architecture keeps responsibility where it belongs: the LLM *proposes* classifications and explanations; a deterministic rules engine — seeded from the versioned parameter registry we already built for seller tax/fee estimation — *computes* all tax math (numbers never come from the model); and the vendor *approves* every filing action before it's recorded. End-of-month it produces a ready-to-review declaration draft. Demo runs fully offline on seeded vendor data; no live tax-authority connection needed.

**VI:**
> Một agent kế toán AI biến việc bán hàng thành việc tuân thủ. Tiểu thương ghi lại bán hàng đúng cách họ vẫn làm — đoạn ghi âm tiếng Việt ("sáng nay bán 3 áo, 250 nghìn") hoặc ảnh chụp sổ tay — và agent cấu trúc nó thành bút toán, nháp dữ liệu hóa đơn điện tử, theo dõi ngưỡng miễn thuế 1 tỷ đồng, và trả lời câu hỏi thuế kèm trích dẫn văn bản chính thức (Tổng cục Thuế, NĐ 141/2026, NĐ 254/2026). Kiến trúc giữ trách nhiệm đúng chỗ: LLM chỉ *đề xuất* phân loại và diễn giải; một rules engine deterministic — seeded từ registry tham số có phiên bản mà chúng tôi đã build cho công cụ ước tính thuế/phí seller — *tính* toàn bộ số thuế (con số không bao giờ do model sinh ra); và tiểu thương *phê duyệt* mọi hành động nộp hồ sơ trước khi ghi nhận. Cuối tháng nó xuất bản nháp tờ khai sẵn sàng để duyệt. Demo chạy hoàn toàn offline trên dữ liệu seed; không cần kết nối cơ quan thuế thật.

### D4. Codex — How do you plan to use Codex in building your solution?

**EN:**
> Codex is the implementation layer for our whole team — we direct, it builds. We run it as a spec-driven pipeline, a workflow we've used before: we operate a closed-loop self-improvement system in production where an agent grades generated practice items and proposes changes through an MCP server we built, with human approval gating every mutation. Before the event we prepare an `AGENTS.md` constitution (tech baseline, naming, secrets never enter the model, mandatory AI self-review) and a task queue with acceptance criteria. On the day: the PRD decomposes into agent-ready tasks, and each member drives parallel Codex subagents on separate vertical slices (voice/photo intake, rules engine, vendor UI, eval + guardrails) — four people commanding a much larger build workforce. Codex also generates and validates our contract schemas, fixtures and tests — every LLM output is schema-checked. We've also built model-provider plumbing for coding agents ourselves, so we know where they fail — dropped tool calls, stalled streams — and design deterministic fallback accordingly.

**VI:**
> Codex là lớp triển khai cho toàn bộ team — chúng tôi chỉ đạo, nó xây dựng. Chúng tôi vận hành nó theo pipeline spec-driven — một workflow đã dùng thật: đội đang vận hành một hệ tự-cải-thiện khép kín trong production, nơi một agent chấm các câu hỏi do hệ thống sinh và đề xuất thay đổi qua MCP server do chúng tôi tự build, với phê duyệt của con người chặn mọi mutation. Trước sự kiện, chúng tôi chuẩn bị bản "hiến pháp" `AGENTS.md` (baseline kỹ thuật, quy tắc đặt tên, secrets không vào model, bắt buộc AI tự review) và hàng đợi task kèm tiêu chí nghiệm thu. Trong ngày thi: PRD được băm thành các task agent-ready, và mỗi thành viên điều khiển song song nhiều Codex subagent trên các vertical slice riêng (intake giọng nói/ảnh, rules engine, UI cho tiểu thương, eval + guardrails) — bốn người điều khiển một lực lượng build lớn hơn nhiều. Codex cũng sinh và kiểm chứng contract schema, fixture và test — mọi output LLM đều validate bằng schema. Chúng tôi còn từng tự build model-provider plumbing cho coding agents nên biết chúng hỏng ở đâu — tool call rơi mất, stream đứng — và thiết kế fallback deterministic tương ứng.

---

## SECTION B/E

- **B:** `Team of 4` + team name + team-lead email theo thống nhất của cả đội (xem `10` Section B)
- **E:** tick cả 4 consent

## Lưu ý trước khi nộp

- [ ] Chọn 1 trong 2 Option của C2 (Option A engreel khuyến nghị); kiểm tra lại mọi chi tiết kỹ thuật đều đúng sự thật — BTC có thể hỏi vặn
- [ ] Kiểm tra LinkedIn headline đang ghi đúng "Software Engineer @ Viclass.vn"
- [ ] GitHub pin đủ 6 repo nêu trên; nếu repo private (viclass-next/hearth) thì đổi sang repo public tương đương
