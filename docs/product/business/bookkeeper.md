# Bookkeeper — business brief (AI role)

> Hộ kinh doanh VN · voice → sổ · ngưỡng 1 tỷ

## One-liner
Agent sổ sách hộ: nói doanh thu → **AI đề xuất** bút toán → rule tính tiền & ngưỡng 1B → chủ hộ **Duyệt**.

## Pain
Tiểu thương ghi tay / Zalo lẫn lộn; sợ vượt miễn thuế mà không biết YTD; e-invoice demo cần citation, không cần “AI đoán thuế”.

## AI trong câu chuyện sản phẩm
| Moment | AI làm gì | Code / người làm gì |
|--------|-----------|---------------------|
| Voice / text ingest | `AiLedgerProposer` đề xuất line items + ghi chú phân loại | Offline = heuristic/regex **có nhãn** `offline_stub`; live chỉ khi `BIZMATE_MODE=live` (+ provider) |
| Verify | — | Ajv ledger schema + rule engine (tổng, YTD, 1B via `@bizmate/core`) |
| Duyệt | — | Human bắt buộc trước khi ghi sổ |

**AI không được** tự tính ngưỡng miễn thuế / tự ghi sổ / tự nộp thuế / tự charge billing.

## Live gate + fallback (honesty)
| Env | Proposer | Behavior |
|-----|----------|----------|
| default / `offline` | `OfflineAiLedgerProposer` | Labeled stub; no model traffic |
| `BIZMATE_MODE=live` | `LiveAiLedgerProposer` | Tries provider; **falls back** to offline_stub if unwired (`fallbackUsed`) |

Never invent tax authority, payment, YTD, or a live `modelId` when falling back. Billing stays `@bizmate/billing` sandbox.

## Trust pitch
“Nghe bán hàng → AI đề xuất dòng sổ → máy tính verify → bạn bấm Duyệt. Vượt 1 tỷ do code báo (`crossesExemption`), không phải model.”

## Honesty
- Không live cơ quan thuế. Billing sandbox.
- Stub = `AI đề xuất (stub offline)` / `AI đề xuất (stub offline · live fallback)`.
- UI badges: **AI đề xuất** · **rule verify** · **chờ duyệt**.

## Round 7 focus
Lớp propose rõ ràng (`AiLedgerProposer`) · live hook gated · vitest khóa trust boundary · pitch honesty trong brief này.

See: [AI-OPS-REQUIREMENTS](../AI-OPS-REQUIREMENTS.md) · [ROUND-7-AI-OPS](../../review/ROUND-7-AI-OPS.md).
