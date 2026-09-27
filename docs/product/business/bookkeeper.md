# Bookkeeper — business brief (AI role)

> Hộ kinh doanh VN · voice → sổ · ngưỡng 1 tỷ

## One-liner
Agent sổ sách hộ: nói doanh thu → **AI đề xuất** bút toán → rule tính tiền & ngưỡng 1B → chủ hộ **Duyệt**.

## Pain
Tiểu thương ghi tay / Zalo lẫn lộn; sợ vượt miễn thuế mà không biết YTD; e-invoice demo cần citation, không cần “AI đoán thuế”.

## AI trong câu chuyện sản phẩm
| Moment | AI làm gì | Code / người làm gì |
|--------|-----------|---------------------|
| Voice / text ingest | `AiLedgerProposer` đề xuất line items + ghi chú phân loại | Regex/heuristic stub **có nhãn** hoặc live LLM (flag) |
| Verify | — | Ajv ledger schema + rule engine (tổng, YTD, 1B) |
| Duyệt | — | Human bắt buộc trước khi ghi sổ |

**AI không được** tự tính ngưỡng miễn thuế / tự ghi sổ / tự nộp thuế.

## Trust pitch
“Nghe bán hàng → AI đề xuất dòng sổ → máy tính verify → bạn bấm Duyệt. Vượt 1 tỷ do code báo, không phải model.”

## Honesty
Không live cơ quan thuế. Billing sandbox. Stub = `AI đề xuất (stub offline)`.

## Round 7 focus
Thay “regex là AI” bằng lớp propose rõ ràng; UI 3 badge: AI đề xuất · rule verify · chờ duyệt.
