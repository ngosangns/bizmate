# Ban giám khảo & Guests — hồ sơ tổng hợp

> Cập nhật 26/9/2026. Nguồn: codexhackathon.sea.com, VnExpress, VietnamNet, Thế giới Tiếp thị VN, Business Times, NewsPie/UDN, LinkedIn public posts, OpenAI blog.  
> ⚠️ Một số chức danh trên trang sự kiện vs báo chí lệch nhẹ — ghi cả hai. Bot persona dùng **lens đánh giá** suy ra từ vai trò + phát biểu công khai, không giả làm người thật 100%.

## A. Chặng Vietnam (31/10/2026) — panel chính để mock

| Người | Vai trên sự kiện / báo | Lens chấm |
|-------|------------------------|-----------|
| **Sidharth Sharma** | Guest: APAC GTM Director, OpenAI; báo: Head GTM ASEAN | Real-world adoption, developer ecosystem, “AI vào ứng dụng thực”, ROI enterprise |
| **Lee Chon Cheng** | Guest: Director, COO Office, Sea Limited | Agentic software @ Sea scale, ops reality SEA, partnership Codex nội bộ |
| **Trần Tuấn Anh (Anh Tuan Tran)** | Guest: Country Head / MD Shopee VN | Seller/buyer VN, e-commerce impact, go-to-market, cộng đồng SME |
| **Kyle Tran (Trần Nhật Quang)** | Guest: Head of Product Shopee VN; LinkedIn: Country Product Manager | UX 30s, metrics, mobile-first, iteration, demo clarity |
| **Son Lê (Son Le Thanh)** | Báo VN: OpenAI Codex Ambassador VN + judge | Codex leverage sâu, community builder, technical authenticity |

## B. Singapore (6/6/2026) — guests + judges (tham chiếu tư duy)

**Guests of honor:** David Chen (Sea co-founder, CPO Shopee), Oliver Jay (MD International OpenAI), Thibault Sottiaux (Head of Codex, remote).

**Judges được đội thắng nhắc tên:** Amulya, Zac (Zhe Hao) Tan, Albert Yip, David Chen, Ruimin He; host/facilitator **Gabriel Chua** (OpenAI Developer Experience, SG).

**Câu hỏi BGK đào sâu (Business Times):** latency trade-offs, data privacy, roadmap sau hackathon; Evoloop được khen vì **white-box / auditability**.

## C. Taiwan (12/9/2026)

**Hosts:** 李毓晨 (GM Shopee TW & PH), Lee Chon Cheng, **Jon Sugihara** (OpenAI APAC Technical / AI Success Eng — ex BCG X).

**Final judge thêm:** **林俊秀** (署長 Cục Công nghiệp Số, moda) — innovation / problem definition / execution + góc chính sách AI.

## D. Tiêu chí thống nhất dùng cho mock panel

1. Problem framing  
2. Quality of build (+ offline deterministic)  
3. Depth of thinking / originality  
4. Real-world value (Sea/Shopee/VN context tốt)  
5. Alignment build directions  
6. Codex leverage  
7. Trust: AI proposes → code verifies → human decides  
8. Privacy, latency, post-hackathon path  

## E. Nguồn chính

- https://codexhackathon.sea.com/  
- https://vnexpress.net/khoi-dong-cuoc-thi-sea-x-openai-codex-hackathon-tai-viet-nam-5121462.html  
- https://vietnamnet.vn/en/sea-openai-launch-vietnam-codex-hackathon-for-ai-builders-2555620.html  
- https://www.businesstimes.com.sg/startups-tech/technology/ai-innovation-inaugural-sea-openai-regional-codex-hackathon-singapore  
- https://openai.com/index/sea-david-chen/  
- https://developers.openai.com/community/codex-ambassadors  

---

## F. Round 7 — AI Ops notes (additive)

Round 7 chấm **AI operational presence + honesty** trên cả 4 app. Không sửa barem R1–R6 trong `docs/review/ROUND-*` cũ.

| Lens | Câu hỏi thêm R7 |
|------|-----------------|
| Sidharth | AIpropose có path tuần 2 không fake live integration? |
| Lee | Deterministic vs LLM split còn sạch dưới COD/flood/scam? |
| Tuấn Anh | Seller/elder thấy rõ “AI đề xuất” vs “máy luật”? |
| Kyle | 90s loop có badge AI / verify / chờ duyệt? |
| Son Lê | Offline stub labeled? Contracts/Ajv vẫn gate? `AiMode` trong core? |

Chi tiết: `docs/review/ROUND-7-AI-OPS.md`.
