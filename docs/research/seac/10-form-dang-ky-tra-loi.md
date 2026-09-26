# Trả lời Form Đăng ký — Sea x OpenAI Codex Hackathon Vietnam

> Form gốc: https://codexhackathon.sea.com/registry
> ⚠️ **Deadline đăng ký: 26/9/2026 đã qua** — nếu chưa nộp, email ngay `sea-openai-vnhackathon@sea.com`.
> Nguyên tắc soạn: shortlist chấm theo *technical background + ý tưởng + alignment với build directions* → phần **D (ý tưởng)** phải thể hiện problem framing sắc + trust boundary (pattern thắng giải); phần **C** mỗi người trả lời khác nhau để chứng tỏ đội bổ sung nhau.
> Các chỗ `[...]` cần điền thông tin thật của từng người.

---

## SECTION A — Participant Profile (Thông Tin Người Tham Gia)

| Câu hỏi | Trả lời |
|---|---|
| Full name (theo giấy tờ tùy thân) | `[Họ tên đúng CCCD]` — nhập đúng thứ tự, dấu đầy đủ |
| Số điện thoại (+84) | `[+84 9xx xxx xxx]` — số cá nhân đang dùng, check cú pháp |
| Email cá nhân | `[email]` — nên dùng email chuyên nghiệp (trùng với LinkedIn/GitHub càng tốt) |
| Primary background (dropdown) | Chọn đúng nhất, gợi ý theo người: dev đi làm → *Software/AI Engineer*; SV → *Student*; founder → *Founder/Entrepreneur*; designer → *Product/UX* |
| Current role / title | Mẫu: `AI Engineer @[Công ty]` hoặc `Sinh viên năm 3, ngành Khoa học Máy tính, [trường]` |
| Company / institution | `[Tên công ty / trường]` |
| LinkedIn URL | `https://linkedin.com/in/[handle]` — **đảm bảo profile cập nhật, có headline rõ** (BGK/BTC có thể xem) |
| GitHub / project link | `https://github.com/[handle]` — pin sẵn 3–6 repo tốt nhất lên profile trước khi nộp |

**Mẹo:** BTC shortlist "based on quality of application" — GitHub trống trơn là điểm trừ lớn. Nên pin repo có README đẹp, commit gần đây, kể cả project cá nhân.

> 👤 Bản điền sẵn + câu trả lời cá nhân hóa cho **Sang (ngosangns)** đã tách sang `11-form-dang-ky-sang.md`.

---

## SECTION B — Team Information (Thông Tin Đội Thi)

| Câu hỏi | Trả lời |
|---|---|
| Số thành viên | **Team of 4** (theo plan — 4 người full-stack + AI) |
| Team name | **`[Chốt 1 tên, VD: "SudoFarm" / "VerifyFirst" / "CongTacVien"]`** — ⚠️ cả 4 người phải gõ **y hệt từng ký tự** (case-sensitive an toàn hơn: dùng đúng 1 format thống nhất, VD `TeamXyz` không khoảng trắng) |
| Team lead's email | `[email của P1 - Product/Orchestration Lead]` — cả 4 người điền cùng 1 email này |
| Where are you currently based? | Chọn khu vực thật (VD *TP. Hồ Chí Minh* / *Hà Nội*…) — chọn nơi thật sự ở, ưu tiên gần venue |

---

## SECTION C — Technical / Execution Capability (trả lời RIÊNG từng người)

> Chiến thuật: 4 thành viên viết theo **vai trò đã chốt trong `07`**, để khi BTC đọc 4 hồ sơ thấy đội "khớp puzzle" — lead/orchestration, backend/data, frontend/demo, AI/narrative. Các mẫu dưới đây là khung — thay `[...]` bằng dự án thật.
> Mỗi câu có 2 bản: **EN** (nộp nếu chọn trả lời tiếng Anh — BTC quốc tế dễ đọc) và **VI** (bản dịch để nộp tiếng Việt / đối chiếu). Chỉ nộp 1 bản thống nhất.

### C1. "What experience, skills, or perspective would you bring…?"

**P1 — Product/Orchestration Lead:**

**EN:**
> I bring [X] years building [agentic systems / backend platforms] and leading small teams under deadline. In our previous [project/hackathon], I was responsible for turning a vague problem into a working system: writing the PRD, decomposing it into agent-ready tasks with acceptance criteria, and owning merges when four people commit in parallel. For this hackathon I will own product framing and the orchestrator/policy layer — making sure our agent *proposes* actions while a deterministic verification layer and human approval stay in charge. I also bring domain knowledge in [e-commerce operations / logistics / SME compliance], which is where our idea comes from.

**VI:**
> Tôi có [X] năm xây dựng [hệ thống agentic / nền tảng backend] và dẫn nhóm nhỏ trong điều kiện deadline gấp. Ở [dự án/hackathon] trước, tôi phụ trách biến một vấn đề mơ hồ thành hệ thống chạy được: viết PRD, băm thành các task agent có thể thực thi kèm tiêu chí nghiệm thu, và làm người merge khi bốn người commit song song. Trong cuộc thi này tôi sẽ phụ trách định hình sản phẩm và lớp orchestrator/policy — đảm bảo agent chỉ *đề xuất* hành động còn lớp kiểm chứng deterministic cùng phê duyệt của con người mới là người quyết định. Tôi cũng có kiến thức chuyên sâu về [vận hành thương mại điện tử / logistics / tuân thủ SME] — chính là nơi ý tưởng của chúng tôi xuất phát.

**P2 — Backend/Data:**

**EN:**
> I build the part that makes AI trustworthy: database schema, APIs, and the verification layer that checks LLM output before it reaches users. In [project], I designed [Pydantic/JSON-schema] contracts and deterministic fallbacks so the system still works when the model fails or hallucinates. For this build I'll own schema, seed/fixture data, and the rule engine — plus our offline demo mode that can replay the full flow without network.

**VI:**
> Tôi xây phần khiến AI đáng tin cậy: database schema, API, và lớp kiểm chứng output của LLM trước khi tới tay người dùng. Ở [dự án], tôi thiết kế contract [Pydantic/JSON-schema] và các fallback deterministic để hệ thống vẫn chạy khi model lỗi hoặc hallucinate. Trong lần build này tôi phụ trách schema, seed/fixture data và rule engine — cùng chế độ demo offline có thể phát lại toàn bộ luồng khi không có mạng.

**P3 — Frontend/Demo UX:**

**EN:**
> I specialize in turning agent workflows into interfaces a first-time viewer understands in 30 seconds — live progress states ("what is the agent doing now"), evidence display, and human-approval flows. In [project], I built [realtime dashboard / streaming UI / map surface] used by [N users / event]. For this hackathon I'll own the demo-critical surface and our scripted judge demo, including a resettable seed state.

**VI:**
> Tôi chuyên biến workflow của agent thành giao diện mà người xem lần đầu hiểu trong 30 giây — trạng thái tiến trình trực tiếp ("agent đang làm gì"), hiển thị bằng chứng, và luồng phê duyệt của con người. Ở [dự án], tôi xây [dashboard realtime / UI streaming / bản đồ] phục vụ [N người dùng / sự kiện]. Trong hackathon này tôi sẽ phụ trách giao diện quyết định demo và kịch bản trình diễn cho ban giám khảo, kể cả trạng thái seed có thể reset.

**P4 — AI/Narrative:**

**EN:**
> I work at the prompt-eval loop: designing agent instructions, grounding them in official sources, and measuring where they fail. In [project], I built [RAG/agent workflow] with [guardrails/citations] to prevent hallucinated [legal/medical/financial] claims. I'll own prompts + evals, our `AGENTS.md` constitution for Codex, and the pitch — including concrete numbers on how we used Codex to build the product.

**VI:**
> Tôi làm việc ở vòng lặp prompt–eval: thiết kế instruction cho agent, ground chúng vào nguồn chính thống, và đo lường chỗ chúng thất bại. Ở [dự án], tôi xây [workflow RAG/agent] với [guardrails/trích dẫn] để chặn các claim bịa về [pháp lý/y tế/tài chính]. Tôi sẽ phụ trách prompt + eval, bản `AGENTS.md` "hiến pháp" cho Codex, và phần pitch — kèm số liệu cụ thể về cách chúng tôi dùng Codex để xây sản phẩm.

### C2. "What's something you've built that you're proud of?"

**Khung trả lời chung (mỗi người dùng dự án thật của mình):**

**EN:**
> [Project name] is [1 câu: làm gì + cho ai]. It works by [kiến trúc/agent flow ngắn gọn]. I personally built [phần cụ thể — backend contracts / orchestrator / UI realtime / eval pipeline], including [1 thách thức kỹ thuật giải được — VD: deterministic fallback khi model fail, idempotency, streaming pipeline]. It was used by [số người/tổ chức — nếu có], and [kết quả đo được — VD: giảm X% thời gian, X lượt dùng, giải Nhì cuộc thi Y].

**VI:**
> [Tên dự án] là [1 câu: làm gì + cho ai]. Nó hoạt động bằng [kiến trúc/agent flow ngắn gọn]. Tôi trực tiếp xây [phần cụ thể — backend contracts / orchestrator / UI realtime / eval pipeline], bao gồm [1 thách thức kỹ thuật đã giải — VD: fallback deterministic khi model fail, idempotency, streaming pipeline]. Sản phẩm được dùng bởi [số người/tổ chức — nếu có], và [kết quả đo được — VD: giảm X% thời gian, X lượt dùng, giải Nhì cuộc thi Y].

**Ví dụ hoàn chỉnh (tham khảo — viết lại theo dự án thật):**

**EN:**
> I built a multi-agent dispute-resolution tool for a small e-commerce team: buyer and seller messages go through a classifier agent, evidence is gathered from order/chat records, and a rule engine produces a draft resolution that a human approves or rejects. I personally built the orchestrator and the validation layer — the agent only *proposes*; nothing is finalized without human sign-off and a contract check. It handled ~400 real cases and cut resolution time from ~2 days to under 3 minutes for straightforward disputes.

**VI:**
> Tôi từng xây công cụ giải quyết tranh chấp đa-agent cho một team thương mại điện tử nhỏ: tin nhắn hai phía mua–bán đi qua agent phân loại, bằng chứng được thu thập từ lịch sử đơn hàng/chat, và một rule engine sinh bản nháp phương án xử lý để con người phê duyệt hoặc từ chối. Tôi trực tiếp xây orchestrator và lớp kiểm chứng — agent chỉ *đề xuất*, không gì được chốt nếu thiếu chữ ký của người duyệt và kiểm tra contract. Hệ thống xử lý ~400 vụ thật và giảm thời gian giải quyết từ ~2 ngày xuống dưới 3 phút với các vụ đơn giản.

### C3. "Have you used Codex before?" (dropdown)

> Chọn mức **trung thực nhất** — nếu đã dùng: chọn mức cao nhất đúng sự thật (VD *Yes, I use it regularly*). Nếu chưa: chọn option tương đương *No / used similar tools* rồi bù bằng câu C2 + D4 (nói rõ đã dùng AI coding tools khác và có playbook sẵn). Không nên phóng đại — BTC có thể hỏi vặn tại sự kiện.

> 👤 Bản trả lời cá nhân hóa cho **Sang (ngosangns)**: xem `11-form-dang-ky-sang.md`.

---

## SECTION D — Hackathon Idea (Ý Tưởng)

> ⚠️ Cả 4 người điền **cùng 1 ý tưởng, cùng build direction**, ngôn ngữ đồng nhất. Dưới đây soạn sẵn 3 phương án theo ranking trong `08` — **chọn 1**, khuyến nghị Phương án 1.

### ✅ PHƯƠNG ÁN 1 — "Kế toán AI cho tiểu thương" (khuyến nghị chính)

**Build direction:** *Deep Domain AI*

**Problem — What problem are you solving?**

**EN:**
> From 1/1/2026, Vietnam abolished the lump-sum tax (thuế khoán) for ~5 million household businesses — including market vendors and social-commerce sellers — forcing them into declaration-based tax with e-invoices almost overnight. Today, issuing a single e-invoice takes an elderly vendor 21 steps and over 2 minutes on a phone; the guidance is hundreds of pages across multiple decrees; and a mistake can mean penalties. Meanwhile the people most affected are the least equipped: older vendors in traditional markets who have never kept books. The pain is real, current, and measured in every Vietnamese news outlet this quarter — but the tools offered are built for accountants, not for a 55-year-old selling fabric in Chợ An Đông.

**VI:**
> Từ ngày 1/1/2026, Việt Nam bãi bỏ thuế khoán với ~5 triệu hộ kinh doanh — bao gồm tiểu thương chợ và người bán hàng trên mạng xã hội — buộc họ chuyển sang kê khai thuế với hóa đơn điện tử gần như chỉ trong một đêm. Hiện nay, để xuất một hóa đơn điện tử, một tiểu thương lớn tuổi phải thao tác 21 bước, mất hơn 2 phút trên điện thoại; văn bản hướng dẫn dài hàng trăm trang trải rộng trên nhiều nghị định; và chỉ một sai sót cũng có thể dẫn đến phạt. Trong khi đó, những người chịu ảnh hưởng nặng nhất lại là những người ít được trang bị nhất: tiểu thương lớn tuổi ở chợ truyền thống, chưa bao giờ làm sổ sách. Vấn đề này thật, đang diễn ra và xuất hiện trên mọi báo lớn Việt Nam quý này — nhưng công cụ hiện có được thiết kế cho kế toán viên, chứ không phải cho một bà 55 tuổi bán vải ở chợ An Đông.

**Target users — Who is this for?**

**EN:**
> Household businesses and small online sellers in Vietnam — specifically non-accountant owners: market vendors (tiểu thương chợ), small Shopee/social-commerce sellers, and family-run shops now required to declare revenue, issue e-invoices, and track the 1-billion-VND tax-exemption threshold. Secondary users: ward-level tax officers and accounting volunteers who currently answer these questions manually, one stall at a time.

**VI:**
> Hộ kinh doanh và người bán online nhỏ tại Việt Nam — cụ thể là chủ hộ không có chuyên môn kế toán: tiểu thương chợ, người bán nhỏ trên Shopee/mạng xã hội, và các cửa hàng gia đình đang phải kê khai doanh thu, xuất hóa đơn điện tử và theo dõi ngưỡng miễn thuế 1 tỷ đồng. Người dùng phụ: cán bộ thuế cấp phường/xã và các tình nguyện viên kế toán hiện đang trả lời các câu hỏi này thủ công, từng sạp một.

**Solution — What will you build?**

**EN:**
> An AI bookkeeping agent that turns selling into compliance: the vendor records sales the way they naturally would — a voice note in Vietnamese ("sáng nay bán 3 áo, 250 nghìn") or a photo of their notebook — and the agent structures it into ledger entries, drafts e-invoice data, tracks the VND 1 billion exemption threshold, and answers tax questions with citations from official documents (Tổng cục Thuế, NĐ 141/2026, NĐ 254/2026). Architecturally: the LLM *proposes* classifications and explanations; a deterministic rules engine *computes* all tax math and thresholds (numbers never come from the model); and the vendor *approves* every filing action before it's recorded — the pattern "AI proposes, code verifies, human decides". End-of-month the agent produces a ready-to-review declaration draft. Everything runs on a demo mode with seeded vendor data, no live tax authority connection required.

**VI:**
> Một agent kế toán AI biến việc bán hàng thành việc tuân thủ: tiểu thương ghi lại bán hàng đúng cách họ vẫn làm — một đoạn ghi âm tiếng Việt ("sáng nay bán 3 áo, 250 nghìn") hoặc ảnh chụp cuốn sổ tay — và agent cấu trúc nó thành bút toán sổ sách, nháp dữ liệu hóa đơn điện tử, theo dõi ngưỡng miễn thuế 1 tỷ đồng, đồng thời trả lời câu hỏi thuế với trích dẫn văn bản chính thức (Tổng cục Thuế, NĐ 141/2026, NĐ 254/2026). Về kiến trúc: LLM chỉ *đề xuất* phân loại và diễn giải; một rule engine deterministic *tính* toàn bộ số liệu thuế và ngưỡng (con số không bao giờ do model sinh ra); và tiểu thương *phê duyệt* mọi hành động nộp hồ sơ trước khi ghi nhận — theo mẫu "AI đề xuất, code kiểm chứng, người quyết định". Cuối tháng agent xuất bản nháp tờ khai sẵn sàng để duyệt. Toàn bộ chạy ở chế độ demo với dữ liệu seed, không cần kết nối cơ quan thuế thật.

**Codex — How do you plan to use Codex in building your solution?**

**EN:**
> Codex is the implementation layer for our whole team — we direct, it builds. We run it as a spec-driven pipeline: before the event we prepare an `AGENTS.md` constitution (tech baseline, naming, security rules — secrets never enter the model, AI self-review before declaring done) and a task queue of issue files with acceptance criteria and dependencies. On the day, we decompose the PRD into agent-ready tasks, and each member drives parallel Codex subagents on separate vertical slices (voice/photo intake, rules engine, vendor UI, eval + guardrails) — four people commanding a much larger build workforce, all coordinated through the shared task queue and contracts so parallel work lands cleanly. Codex also generates and validates our contract schemas, fixtures and tests — every LLM output shape is schema-checked. We'll report concrete usage in the pitch: tasks completed, subagents used, commits shipped.

**VI:**
> Codex là lớp triển khai cho toàn bộ team — chúng tôi chỉ đạo, nó xây dựng. Chúng tôi vận hành nó theo pipeline spec-driven: trước sự kiện chúng tôi chuẩn bị một bản "hiến pháp" `AGENTS.md` (baseline kỹ thuật, quy tắc đặt tên, quy tắc bảo mật — secrets không bao giờ vào model, AI phải tự review trước khi báo xong) và một hàng đợi task dạng issue kèm tiêu chí nghiệm thu và dependencies. Trong ngày thi, chúng tôi băm PRD thành các task agent-ready, và mỗi thành viên điều khiển song song nhiều Codex subagent trên các vertical slice riêng (intake giọng nói/ảnh, rules engine, UI cho tiểu thương, eval + guardrails) — bốn người điều khiển một lực lượng build lớn hơn nhiều, tất cả được phối hợp qua task queue và contracts dùng chung để việc song song vẫn khớp nhau. Codex cũng sinh và kiểm chứng contract schema, fixture và test — mọi output của LLM đều được validate bằng schema. Chúng tôi sẽ báo cáo số liệu cụ thể trong pitch: số task hoàn thành, số subagent đã dùng, số commit đã ship.

---

### 🔷 PHƯƠNG ÁN 2 — "Tấm khiên số chống lừa đảo cho người già"

**Build direction:** *Autonomous & Adaptive AI* (hoặc Deep Domain AI)

**Problem:**

**EN:**
> Vietnam lost ~6,000 billion VND to online scams in 2025 and ~1,500 billion in just H1/2026, while AI has made fraud dramatically more convincing — deepfake voices and faces indistinguishable to the ear and eye are now used to impersonate children and grandchildren. The most vulnerable group is the least equipped: elderly users who trust what they see, and who share scam content onward into family groups. Existing defenses are manual warnings people forget — there is no always-on guardian that checks what arrives *before* the damage is done.

**VI:**
> Người Việt mất ~6.000 tỷ đồng vì lừa đảo trực tuyến trong năm 2025 và ~1.500 tỷ chỉ trong nửa đầu 2026, trong khi AI khiến gian lận thuyết phục hơn hẳn — giọng nói và gương mặt deepfake không thể phân biệt bằng tai và mắt đang được dùng để mạo danh con cháu. Nhóm dễ tổn thương nhất lại ít được trang bị nhất: người cao tuổi tin vào thứ họ nhìn thấy, và chia sẻ tiếp nội dung lừa đảo vào các nhóm gia đình. Các biện pháp phòng ngừa hiện tại chỉ là những cảnh báo thủ công mà người ta quên — chưa có một "người canh gác" luôn bật, kiểm tra những gì đến *trước khi* thiệt hại xảy ra.

**Target users:**

**EN:**
> Elderly smartphone users in Vietnam (and their adult children who configure protection for them) — the family is the unit: parents are protected, children get alerted. Secondary: telecom/banks' consumer-protection teams.

**VI:**
> Người dùng smartphone cao tuổi tại Việt Nam (và con cái trưởng thành — những người cấu hình bảo vệ cho cha mẹ) — gia đình là đơn vị: bố mẹ được bảo vệ, con cái được cảnh báo. Phụ: đội ngũ bảo vệ người tiêu dùng của các nhà mạng/ngân hàng.

**Solution:**

**EN:**
> A "digital family member" agent that watches incoming suspicious content on an elderly user's phone — Zalo/SMS messages, links, QR codes, call/video claims — and intercepts before harm: it pattern-matches known Vietnamese scam scripts, checks sources and blacklists, analyzes deepfake artifacts, and when risk is found it (a) blocks or flags the content, (b) explains in simple, respectful Vietnamese why it's dangerous, and (c) alerts a configured family member with the evidence. Decisions follow hard rules and verified lists — the LLM drafts the explanation, never the verdict. High-stakes actions (e.g. blocking a payment link) require a confirm step or escalation to family. Demo: a simulated scam-inbox showing the agent catching a fake-bank SMS, a deepfake voice note, and a QR-scam in sequence — fully offline replay.

**VI:**
> Một agent "người thân số" theo dõi các nội dung đáng ngờ đến với điện thoại của người cao tuổi — tin nhắn Zalo/SMS, link, mã QR, nội dung cuộc gọi/video — và chặn trước khi gây hại: nó đối chiếu các kịch bản lừa đảo đã biết ở Việt Nam, kiểm tra nguồn và danh sách đen, phân tích dấu hiệu deepfake, và khi phát hiện rủi ro thì (a) chặn hoặc gắn cờ nội dung, (b) giải thích bằng tiếng Việt giản dị, tôn trọng lý do nguy hiểm, và (c) cảnh báo cho người thân đã cấu hình kèm bằng chứng. Quyết định đi theo rule cứng và danh sách đã kiểm chứng — LLM chỉ soạn phần giải thích, không bao giờ đưa ra phán quyết. Các hành động rủi ro cao (VD chặn link thanh toán) cần bước xác nhận hoặc escalate cho người thân. Demo: một hộp thư lừa đảo mô phỏng, agent bắt liên tiếp SMS giả ngân hàng, voice note deepfake và scam QR — replay hoàn toàn offline.

**Codex:** *(dùng chung khối Codex của Phương án 1 — spec-driven, AGENTS.md constitution, task queue, parallel subagents, schema-validated outputs, offline deterministic demo mode)*

---

### 🔷 PHƯƠNG ÁN 3 — "Điều phối đơn hàng khi thành phố ngập" (Logistics Resilience Agent)

**Build direction:** *Autonomous & Adaptive AI*

**Problem:**

**EN:**
> During the September 17, 2026 Hanoi floods, delivery drivers couldn't reach flooded streets, shop owners canceled orders one by one by hand, and local alley knowledge ("this lane is passable") lived only in residents' heads. Every heavy-rain season repeats this across Vietnamese cities: delivery SLAs break simultaneously, sellers message customers manually, and dispatch decisions are made under stress with no system. Returns/COD failure already costs sellers two-way shipping on ~1 in 5 orders — weather multiplies it.

**VI:**
> Trong đợt ngập Hà Nội ngày 17/9/2026, shipper không thể vào các tuyến phố ngập, chủ shop phải hủy từng đơn bằng tay, còn "kiến thức ngách địa phương" (con hẻm nào đi được) chỉ nằm trong đầu người dân. Mỗi mùa mưa lớn lại lặp lại điều này ở các đô thị Việt Nam: SLA giao hàng vỡ hàng loạt, người bán nhắn khách thủ công, và quyết định điều phối được đưa ra trong stress khi không có hệ thống. Tỷ lệ hoàn/boom COD đã khiến người bán mất phí vận chuyển 2 chiều trên ~1/5 đơn — thời tiết nhân con số đó lên.

**Target users:**

**EN:**
> Dispatch/ops teams and sellers on marketplaces (Shopee/social commerce), plus delivery riders — the agent serves the ops console first, riders receive replanned routes.

**VI:**
> Đội điều phối/vận hành và người bán trên các sàn thương mại (Shopee/social commerce), cùng shipper — agent phục vụ console vận hành trước, shipper nhận tuyến đường đã replan.

**Solution:**

**EN:**
> A disruption-response agent that watches an event feed (flood reports, dead routes, SLA risk) and autonomously replans the order queue: re-sequence drops, merge nearby deliveries, propose reschedule messages to customers, and — when an action exceeds its authority (mass refunds, canceling orders) — escalate with options and impact estimates for a human to approve. Verified rules decide what's allowed (SLA, zones, capacity); the LLM proposes the plan and drafts customer messages; every decision is logged with rationale. It also learns "local knowledge" from rider feedback during disruptions. Demo: a live map of a flooded district, an event feed replaying a storm, and the agent replanning 30 orders in real time — deterministic and replayable offline.

**VI:**
> Một agent phản ứng gián đoạn theo dõi feed sự kiện (báo cáo ngập, tuyến đường chết, rủi ro SLA) và tự động replan hàng đợi đơn: sắp xếp lại thứ tự giao, gom các đơn gần nhau, đề xuất tin nhắn hẹn lại cho khách — và khi một hành động vượt quyền (hoàn tiền hàng loạt, hủy đơn), nó escalate kèm các phương án và ước tính tác động để con người phê duyệt. Rule đã kiểm chứng quyết định điều gì được phép (SLA, vùng, năng lực); LLM đề xuất phương án và soạn tin nhắn cho khách; mọi quyết định được log kèm lý do. Nó cũng học "kiến thức địa phương" từ phản hồi của shipper trong các đợt gián đoạn. Demo: bản đồ một quận đang ngập, feed sự kiện phát lại một cơn bão, và agent replan 30 đơn theo thời gian thực — deterministic, replay được offline.

**Codex:** *(dùng chung khối Codex của Phương án 1)*

---

## SECTION E — Consent / Acknowledgement

Tick cả 4:
- [x] Tham gia trực tiếp đầy đủ 08:30–21:00 ngày 31/10/2026 tại TP.HCM — **kiểm tra lịch cả 4 người thật kỹ** (thiếu 1 người có thể ảnh hưởng check-in theo quy định)
- [x] Xác nhận cả team đăng ký riêng với **cùng 1 tên đội**
- [x] Đồng ý Sea & OpenAI thu thập/dùng dữ liệu cá nhân
- [x] Đồng ý chụp ảnh/quay video

---

## Checklist trước khi bấm Register

- [ ] 4 người cùng nộp, **cùng team name y hệt ký tự**, cùng team-lead email
- [ ] Phần D giống nhau ở 4 form (copy chung — BTC đối chiếu)
- [ ] Phần C khác nhau rõ vai trò (bổ sung, không trùng)
- [ ] GitHub/LinkedIn từng người đã cập nhật, repo pin sẵn
- [ ] Ý tưởng nêu đúng từ khóa build direction + có "AI proposes → verify → human decides" (ăn điểm alignment + depth of thinking ngay trong hồ sơ)
- [ ] Sau khi nộp: lưu lại screenshot/bản copy câu trả lời từng người
