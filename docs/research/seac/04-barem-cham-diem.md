# Barem chấm điểm — Sea x OpenAI Regional Codex Hackathon

> ⚠️ **Lưu ý quan trọng:** BTC **không công bố barem có trọng số/%** chi tiết ra ngoài. Toàn bộ tiêu chí dưới đây được tổng hợp từ: FAQ trang chính thức, trang Luma chặng Singapore, bài Business Times (báo partner của sự kiện), press release chặng Đài Loan, và hành vi chấm thực tế được mô tả trên báo chí. Phần suy luận được đánh dấu riêng.

## 1. Tiêu chí chính thức đã công bố

### Trang chính thức (codexhackathon.sea.com) + Luma Singapore — nguyên văn giống nhau

> "Teams will be evaluated on **problem framing**, **quality of build**, **depth of thinking**, and **how effectively Codex was leveraged** in the build process."

### Business Times — đưa tin chặng Singapore, liệt kê đầy đủ hơn (6 tiêu chí)

1. **Problem framing** — định nghĩa/khung vấn đề
2. **Quality of build** — chất lượng build
3. **Insight and originality** — insight & tính độc đáo
4. **Real-world value** — giá trị thực tế
5. **Alignment with the three focus areas** — mức độ khớp 3 build directions
6. **Effectiveness of Codex leverage** — hiệu quả tận dụng Codex trong quá trình build

Ngoài 6 tiêu chí trên, báo ghi nhận BGK **đào sâu thêm** trong phần Q&A/demo:
- Cách đội xử lý **technical trade-offs** (VD: latency)
- **Data privacy** approach
- Khả năng **phát triển sản phẩm sau hackathon** (scalability/roadmap)

### Chặng Đài Loan — theo press release (UDN, 工商時報, NewsPie)

BGK chung kết (đại diện Sea + OpenAI + 林俊秀/Cục trưởng Cục CN Số moda) chấm theo **3 phương diện**:

1. **技術創新** — Technological innovation
2. **問題定義** — Problem definition
3. **執行力 / 實作完成度** — Execution / mức độ hoàn thiện sản phẩm

### Tiêu chí sơ tuyển hồ sơ đăng ký (trước ngày thi)

Áp dụng cho cả 3 chặng (SG, TW, VN):
- **Technical background** của đội
- **Ý tưởng dự định build** (build plan/idea trong form)
- **Mức độ alignment** với 3 build directions

## 2. Format chấm (chung các chặng)

| Giai đoạn | Nội dung |
|---|---|
| **Round 1** | Toàn bộ đội trình bày **luân phiên trước panel BGK** (chạy song song bữa tối — SG: 5:15 PM, sau code freeze 5:00 PM). BGK hỏi sâu technical & product. |
| **Chọn top 5** | BGK hội ý, chọn 5 đội vào chung kết |
| **Final** | 5 đội trình bày **trên sân khấu** trước toàn panel (TW: có thêm đại diện chính phủ làm BGK chung kết) |
| **Trao giải** | SG: 8:30 PM |

**Dòng thời gian SG tham khảo:** Code freeze 17:00 → Round 1 + dinner 17:15 → Finalist pitches 19:30 → Awards 20:30.

## 3. Barem "thực tế" suy ra từ các bài thắng (suy luận, không phải công bố chính thức)

Từ việc phân tích 6 dự án đạt giải + phần Q&A được báo chí ghi lại:

| Tiêu chí công bố | Cách BGK đánh giá thực tế |
|---|---|
| Problem framing | Vấn đề phải "worth solving" — cụ thể, có user rõ (live seller, gia đình cần chăm sóc dài hạn, dev team có legacy SP) |
| Quality of build | Có demo chạy được end-to-end; cả TurnDeal và 長照 Agent đều có **offline/deterministic mode** để demo không phụ thuộc API; Evoloop demo được bot tiến hóa trực quan |
| Depth of thinking | Hiểu domain sâu (TripCanvas giải quyết cả bài toán trust trong payment; 長照 Agent ground vào luật/văn bản 衛福部 thật); nói được trade-off (latency, privacy, giới hạn) |
| Real-world value | Bài toán gần với bối cảnh Sea/Shopee (live commerce, đàm phán mua bán) hoặc vấn đề xã hội lớn (長照 — dân số già Đài Loan) |
| Codex leverage | Chủ động kể được **quy trình dùng Codex**: Techbros dùng parallel subagents ("grill-me", "to-issues") xử lý merge conflicts; TurnDeal dùng spec-driven workflow (OpenSpec); toàn bộ build trong ~7 tiếng |
| Originality | Cơ chế mới lạ được đề cao: self-evolving bot white-box (Evoloop), agent-to-agent negotiation (TurnDeal), multi-agent game (We Keep the Dawn) |
| Trust/safety (chủ đề xuyên suốt) | Cả 2 giải nhất đều có pattern: **AI proposes → hệ thống/verify → người quyết định** (buyer swipe-decide; policy-code audit-able). Guardrails, escalation, PII handling là điểm cộng rõ rệt |

## 4. Gợi ý cấu trúc pitch khớp barem (từ deck đội giải 3 TW)

Deck `Sea x OpenAI Hackthon.pdf` trong repo 長照 Agent dùng flow: **關鍵痛點** (pain point) → **解決方案** → **Demo** → **影響力** (impact: user/專員/chính phủ) → **技術架構** → **未來展望** — map 1-1 với problem framing, real-world value, quality of build, depth of thinking.

## 5. Cách lấy barem chính thức nếu cần

- Email BTC chặng VN: `sea-openai-vnhackathon@sea.com`
- Hỏi trực tiếp trong buổi opening D-Day (ở SG, Gabriel Chua — OpenAI — có session rundown về Codex + các frontier model; BTC nói "more context will be provided on the day")
- Barem chi tiết từng chặng được chia cho đội onsite, không publish public

## Nguồn

- <https://codexhackathon.sea.com/> (FAQ)
- <https://luma.com/kv0kks2a> (FAQ + agenda SG)
- <https://www.businesstimes.com.sg/startups-tech/technology/ai-innovation-inaugural-sea-openai-regional-codex-hackathon-singapore>
- <https://udn.com/news/story/7270/9751769>, <https://www.newspie.com.tw/shopee-sea-openai-20260914/>, <https://www.ctee.com.tw/news/20260913700392-430502>
- Deck đội 長照 Agent: `Sea x OpenAI Hackthon.pdf` trong <https://github.com/tar-ooo-ooo/sea-openai-hackathon-2026>
