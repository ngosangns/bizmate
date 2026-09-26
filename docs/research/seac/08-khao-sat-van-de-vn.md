# Khảo sát vấn đề thực tế tại Việt Nam — kho ý tưởng cho Hackathon

> Quét rộng trên báo chí/diễn đàn VN (VnExpress, Tuổi Trẻ, Dân trí, Tiền Phong, báo ngành…) — mỗi domain ghi **pain point có bằng chứng**, góc agentic AI, fit build direction, và check trùng với bài đã thắng SG/TW.
> Ký hiệu hướng: **[A]** Autonomous & Adaptive · **[B]** AI-Native Products & Ops · **[C]** Deep Domain AI

---

## Bảng xếp hạng tổng (chấm 1–5 theo barem + khả năng demo 7h)

| # | Domain → Ý tưởng | Pain sắc | Originality | Demo 7h | Fit hướng | Trùng bài cũ | Tổng |
|---|---|---|---|---|---|---|---|
| 1 | **Thuế/hóa đơn cho hộ kinh doanh** | 5 | 4 | 5 | C | Không | **27** |
| 2 | **Chống lừa đảo/deepfake cho người già** | 5 | 5 | 4 | A/C | Không | **26** |
| 3 | **Logistics mùa mưa (ngập/bão)** | 5 | 5 | 4 | A | Không | **26** |
| 4 | **Hồ sơ hành chính "đi 2 lần"** | 4 | 4 | 5 | C | Gần 長照 (khác domain) | 25 |
| 5 | **Pháp lý đất đai cho người mua** | 4 | 5 | 4 | C | Không | 25 |
| 6 | **Giấy tờ giáo viên (sổ sách/báo cáo)** | 4 | 4 | 5 | B | Không | 24 |
| 7 | **Khiếu nại bảo hiểm/claim bị từ chối** | 4 | 4 | 4 | B/C | Không | 24 |
| 8 | **HR chống CV/phỏng vấn AI giả** | 4 | 4 | 4 | B | Không | 24 |
| 9 | **Định giá & thương lượng cho nông dân** | 4 | 4 | 3 | A/B | Gần TurnDeal (phía seller) | 23 |
| 10 | **Thoát nợ app/tín dụng đen** | 5 | 5 | 2 | C | Không | 22 |

*(Demo 7h = khả năng build + demo offline ổn định trong thời gian thi.)*

---

## 1. 🛡️ Chống lừa đảo trực tuyến & deepfake — "tấm khiên số cho gia đình" [A/C]

**Bằng chứng pain (rất nóng):**
- 6T/2026: **959 vụ lừa đảo, thiệt hại ~1.500 tỷ đồng**; cả 2025: **6.000+ tỷ**. (CAND/VnExpress, 21/8/2026)
- Thủ đoạn mới: **deepfake giọng nói/hình ảnh giống thật ~99%** mạo danh người thân/cấp trên; QR độc, web đặt phòng/vé máy bay giả dịp lễ 2/9. (NCA, ipsip.vn)
- Người cao tuổi "dễ tin, dễ chia sẻ" — gửi video "bác sĩ áo blouse" chữa ung thư vào nhóm gia đình. (VOV)
- Bộ Công an phải phát chiến dịch quốc gia **"TinAI? — Kiểm trước tin sau"** (31/7/2026) → chủ đề chính sách rất nóng.

**Góc agentic:** agent "người thân số" cài cho cha/mẹ — mọi tin nhắn Zalo/SMS/link/cuộc gọi đáng ngờ được soi trước (phân tích kịch bản lừa đảo, check nguồn, đối chiếu danh sách đen); khi phát hiện rủi ro → **chặn + giải thích bằng ngôn ngữ giản dị + alert cho con cái**. Verify bằng rules + blacklist, không phải LLM tự quyết. Anti-deepfake check metadata/audio artifact. Fit A (tự vận hành không giám sát — người già không thể giám sát) + C (hiểu sâu kịch bản scam VN).

**Tại sao mạnh:** pain universal, đúng chính sách quốc gia, demo cực trực quan (mô phỏng cuộc gọi/tin nhắn scam → agent chặn + giải thích). Không trùng bài nào đã thắng.

---

## 2. 📋 Thuế & hóa đơn cho hộ kinh doanh — "kế toán AI cho tiểu thương" [C]

**Bằng chứng pain (đỉnh điểm đúng 2026):**
- Từ 1/1/2026 **bãi bỏ thuế khoán** → ~5+ triệu hộ kinh doanh phải kê khai. Tiểu thương chợ "thấp thỏm sợ sai": **xuất 1 hóa đơn điện tử = 21 bước, >2 phút**. (Tiền Phong, Thế giới Hội nhập)
- Văn bản hướng dẫn "hàng trăm trang" khiến hộ kinh doanh "ngợp". (Dân trí 11/9/2026)
- Chính sách đất nền: ngưỡng doanh thu miễn thuế **1 tỷ/năm** (Luật 09/2026, NĐ 141/2026, NĐ 254/2026), miễn phí hóa đơn điện tử 12 tháng cho vùng khó khăn — quy tắc nhiều, thay đổi liên tục, phạt nếu sai.

**Góc agentic:** agent nhận doanh thu (ghi âm bằng tiếng Việt "hôm nay bán 3 áo, 250k" / chụp sổ tay) → tự phân loại giao dịch → **sinh sổ kê khai + hóa đơn nháp** → trả lời "tôi có phải nộp thuế không?" grounding vào văn bản chính thức với citation; số liệu tính bằng code, LLM chỉ diễn giải. Cảnh báo sắp vượt ngưỡng 1 tỷ, nhắc hạn nộp.

**Tại sao mạnh:** chính sách nóng đúng thời điểm thi (10/2026), user rõ (tiểu thương chợ — có thể nói chuyện "bà bán vải chợ An Đông"), data source công khai, pattern thắng của 長照 Agent (ground official docs + workflow hồ sơ) mà domain hoàn toàn khác.

---

## 3. 🌧️ Logistics mùa mưa — "điều phối đơn khi thành phố ngập" [A]

**Bằng chứng pain (vừa xảy ra tuần trước — 17/9/2026):**
- Hà Nội ngập 40–50cm: **shipper "bó tay"**, shop phải tự nhắn từng khách xin hủy, chủ shop chèo thuyền giao hàng; "ngách chỉ người địa phương biết — shipper theo map không vào được". (Dân trí 17/9/2026)
- COD hoàn/bom hàng ~19%+ — mỗi đơn hoàn tốn phí 2 chiều. (Sapo)
- Tháng 10 đỉnh mùa mưa bão miền Trung/Bắc → cực kỳ timely cho ngày thi 31/10.

**Góc agentic:** disruption agent theo dõi feed sự kiện (ngập, tuyến chết, shipper hủy) → tự replan đơn/route → quyết định nhỏ tự làm (đổi khung giờ giao, gom đơn vùng không ngập), quyết định lớn (hoàn tiền, hủy đơn loạt) **escalate kèm options + impact estimate**; học "local knowledge" từ shipper feedback. Verify bằng rule engine (SLA, vùng ngập, capacity).

**Tại sao mạnh:** fit chữ nghĩa "autonomous & adaptive" nhất, demo visual bản đồ + feed sự kiện giả lập hoàn toàn offline được, chạm Shopee Express/SPX.

---

## 4. 🏛️ Hồ sơ hành chính "đi 2 lần" — "cán bộ một cửa AI" [C]

**Bằng chứng:**
- Người dân nộp online vẫn phải đến bổ sung giấy; hệ thống lỗi, thiếu liên thông; dân mất 5 tháng cho tạm trú online. (VnExpress, Tiền Phong)
- Bài toán 2 phía: dân không biết cần giấy gì; cán bộ phường ngợp hồ sơ bổ sung/bản sao chứng thực.

**Góc agentic:** navigator agent cho người dân (mô tả tình huống → checklist giấy tờ cá nhân hóa + điền sẵn form + cảnh báo chỗ hay bị từ chối) **+** mặt sau: agent cho cán bộ (triage hồ sơ, phát hiện thiếu sót trước khi trả, gợi ý văn bản pháp lý căn cứ).
- ⚠️ Lưu ý: cùng "gen" workflow-assistant với 長照 Agent (giải 3 TW) — cần khác biệt hóa bằng điểm riêng: VD agent tự **điều hướng liên ngành** (công an ↔ bảo hiểm ↔ y tế) và học từ các hồ sơ bị từ chối.

---

## 5. 🏠 Pháp lý đất đai — "due-diligence agent trước khi đặt cọc" [C]

**Bằng chứng:**
- Đầu nậu lách luật tách thửa bán nền trái phép; sổ đỏ giả tinh vi; mua đất đang quy hoạch/đang thế chấp; HoREA cảnh báo lỗ hổng pháp lý (23/9/2026). Công an Thái Nguyên khởi tố vụ lừa "làm sổ" 630 triệu (9/2026).

**Góc agentic:** agent "luật sư sơ tuyển" — nhập thông tin thửa/quảng cáo → kiểm tra chéo: dấu hiệu sổ giả, quy hoạch treo, giá bất thường vs thị trường, chủ bán & rủi ro tranh chấp → báo cáo rủi ro có căn cứ điều luật + checklist thẩm định tại VPĐK. Deep domain pháp luật đất đai, verify bằng rule + source.

**Điểm cộng:** giao dịch giá trị lớn = pain sắc, ít ai làm, demo = paste 1 tin rao bán → báo cáo rủi ro.

---

## 6. 🍎 Giấy tờ giáo viên — "admin autopilot cho nhà giáo" [B]

**Bằng chứng (policy cực nóng tháng 9/2026):**
- Bộ GD&ĐT ban **Công văn 5922** (3/9/2026) cắt hồ sơ/sổ sách/hội họp; **QĐ 2758** cấm điều động GV làm hành chính; TALIS 2024: **52% GV stress vì hành chính** — lớn nhất mọi nhóm.
- GV kiêm luôn việc nhân viên hành chính: biểu mẫu, tổng hợp số liệu, minh chứng, báo cáo tổng kết.

**Góc agentic:** agent nhận ảnh điểm danh/sổ tay/thông báo từ hiệu trưởng → tự sinh báo cáo đúng form, gom minh chứng, điền sổ sách điện tử; rule-check trước khi nộp; human duyệt. AI-native ops cho nhà trường.

**Lưu ý:** "đúng trend chính sách" nhưng demo thiếu wow-factor — cần làm UI quy trình phê duyệt đẹp.

---

## 7. 🛟 Khiếu nại bảo hiểm / BHYT — "claim fighter" [B/C]

**Bằng chứng:** từ chối chi trả do "không đủ chứng cứ", khám sai tuyến; khiếu nại 30 ngày nội bộ → Cục QLGS bảo hiểm → tòa; người bệnh không biết quyền của mình. (Luật KD Bảo hiểm 2022, Đ.119)

**Góc:** agent đọc thư từ chối + hồ sơ → đối chiếu điều khoản hợp đồng & luật → chẩn đoán "đúng hay sai quyền lợi" → soạn đơn khiếu nại có trích điều khoản/điều luật, theo dõi deadline, hướng dẫn bổ sung chứng cứ thiếu.

---

## 8. 🕵️ HR — "detector cho kỷ nguyên CV AI" [B]

**Bằng chứng:** hồ sơ tuyển dụng +400% nhờ AI viết hộ; ứng viên dùng AI làm bài test, trả lời phỏng vấn online — "vòng lặp kỳ lạ: AI viết CV, doanh nghiệp dùng AI loại ứng viên". (Dân trí 7/2026, 5/2026)

**Góc:** agent verification cho nhà tuyển dụng VN — phân tích CV qua mặt AI (dấu hiệu template, skill-claim không chứng minh), sinh câu hỏi vấn đáp cá nhân hóa buộc ứng viên chứng minh claim, chấm chéo câu trả lời với CV. Meta-angle thú vị: *dùng AI kiểm chứng AI* — BGK sẽ thích vấn đề này.

---

## 9. 🌾 Nông nghiệp — "sức mạnh thương lượng cho nhà nông" [A/B]

**Bằng chứng:** được mùa mất giá — lúa Cà Mau ép còn 5.500–6.000đ/kg (dưới giá thành), thanh long/heo/gà thua lỗ; nông dân lệ thuộc tư thương, không có giá tham chiếu. (VnExpress, Dân Việt 9/2026)

**Góc:** market-intelligence agent cho nhóm hợp tác xã: tổng hợp giá nhiều chợ đầu mối + tín hiệu xuất khẩu → khuyến nghị thời điểm bán → **gom đơn tập thể để tăng sức mặc cả**, agent đàm phán thay HTX với thương lái.
- ⚠️ Nguy cơ: agent-negotiation phía seller nghe hơi gần TurnDeal — cần nhấn khác biệt (gom cung, giá tham chiếu, chuỗi lạnh) hoặc né.

---

## 10. 💸 Tín dụng đen/app vay — "cứu người trước khi vay" [C]

**Bằng chứng (đau xót):** sinh viên vay 30tr → nợ 180tr → tự vẫn (Tây Ninh 4/2026); lãi ~800%/năm; đường dây xuyên quốc gia. (VTV, VnExpress)

**Góc:** agent phân tích app/link cho vay trước khi vay (red flags: quyền truy cập danh bạ, phí giải ngân trước, Zalo-only, tính APR thật từ lịch trả) + nếu đã vướng nợ: lập kế hoạch thoát nợ hợp pháp, soạn đơn tố giác, kết nối luật sư. 
- ⚠️ Demo khó (dữ liệu nhạy cảm, chủ đề heavy) — để dự phòng.

---

## Kết luận & khuyến nghị

**Top 3 theo score + tính chiến lược:**

1. **"Kế toán AI cho tiểu thương" (thuế/hóa đơn 2026)** — pain nóng đúng thời điểm, user cụ thể hóa được (bà bán chợ), demo dễ nhất (chat + form + số liệu), fit Deep Domain, công thức đã chứng minh thắng (長照).
2. **"Tấm khiên số cho người già" (chống scam/deepfake)** — độc đáo nhất, mạnh cả về A lẫn C, đúng chủ đề quốc gia, demo kịch tính cao; rủi ro: cần mô phỏng scam pipeline khéo.
3. **"Điều phối đơn khi ngập" (logistics mùa mưa)** — fit chữ nghĩa hướng A nhất, sự kiện 17/9 còn nóng, chạm Shopee Express; rủi ro: cần simulator đẹp.

→ Cập nhật quyết định cuối trong `07-ke-hoach-hackathon-vn.md`: giữ cơ chế **2 ý tưởng song song**, chốt 10:00 sáng D-Day sau khi BTC công bố context thêm.

## Nguồn chính

- Lừa đảo: vnexpress.net 21/8/2026, dantri 7/1/2026, genk (chiến dịch TinAI 31/7)
- Thuế HKD: tienphong.vn, thegioihoinhap.vn, vietnam.vn, dantri 11/9/2026
- Y tế: tuoitre 10/9/2026, vietnamnet, vnanet (BV Chợ Rẫy)
- Hành chính: vnexpress, tienphong (số hóa nửa vời), thuongtruong
- Logistics: dantri 17/9/2026 (ngập HN), sapo (hoàn hàng)
- Giáo dục: nhandan, dantri 28/8/2026, hethongphapluat (QĐ 2758)
- HR: keyperson.vn, iviec, dantri 10/7 & 24/5/2026
- Nông nghiệp: vietnam.vn, tuoitre, vnexpress (thanh long/heo), danviet
- BĐS: vnexpress (HoREA 23/9/2026), mps.gov.vn, dichvuluatsu
- Bảo hiểm: luatpvlgroup, congtyluatacc
- Tín dụng đen: congan.tayninh.gov.vn, vtv.vn, vnexpress
