# Shield — business brief (AI role)

> Người cao tuổi · chống lừa / deepfake · family alert

## One-liner
Guardian cho ba/mẹ: **rule chặn scam**, AI chỉ **viết lời giải thích** dễ hiểu + gợi ý triage — không được đổi verdict.

## Pain
SMS/Zalo giả ngân hàng, QR hoàn tiền, deepfake gọi “con đang cấp cứu”. Người già cần tiếng Việt giản dị; con cần alert rõ ràng; Sea-scale không tin LLM tự block.

## AI trong câu chuyện sản phẩm
| Moment | AI làm gì | Code / người làm gì |
|--------|-----------|---------------------|
| Verdict | — | Blacklist + script patterns + fixture detector |
| Explanation | Draft lời giải thích elder + family copy | Luôn có (offline template labeled AI-draft); live hook optional |
| Triage assist | Điểm gợi ý ưu tiên xem | **Không** override rule; UI show cả hai (`overridesVerdict: false`) |
| Caregiver | — | Human override allow/block |

## Trust pitch
“Máy luật quyết định chặn hay không. AI chỉ nói chuyện với ba/mẹ và báo con — không được tự mở khóa.”

## Honesty
Deepfake score = fixture. Notify = local SW stub. Không fake push gateway.

## Round 7 focus (AI-OPS)
- AI explanation **luôn** gắn verdict; triage score cạnh rule; nhãn stub rõ (`AI đang đề xuất` / AI-draft stub).
- `BIZMATE_MODE=live` **optional**: async path gọi `callLiveLlmStub`; nếu thiếu provider → **fallback** offline template với meta `offline_stub` + nhãn live-fallback (không bịa câu trả lời LLM).
- **Risk / action / allow / flag / block = rules only** — LLM không đổi verdict.
