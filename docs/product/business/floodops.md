# FloodOps — business brief (AI role)

> Ngày mưa ngập · COD · seller / ops Shopee-like

## One-liner
Replan giao hàng ngày ngập: **policy engine** chọn action theo COD/SLA; **AI ops advisor** viết rationale + gợi ý phương án phụ — người duyệt hoàn tiền.

## Pain
Đơn COD trên phường ngập, courier cancel, SLA ngắn. Ops cần quyết định nhanh nhưng **không để LLM tự hoàn COD**. Seller cần tin nhắn buyer tiếng Việt trung thực (template, không SMS live).

## AI trong câu chuyện sản phẩm
| Moment | AI làm gì | Code / người làm gì |
|--------|-----------|---------------------|
| Replan | — | Pure TS: reschedule / reroute / hold / propose_refund theo COD |
| Ops advisor | NL rationale + optional alternate suggestion | Offline fixture + live hook; không đổi action engine |
| Refund / tight SLA | — | Human approve |
| Buyer notify | Có thể polish copy (optional) | Template honesty; không gửi SMS thật |

## Trust pitch
“Engine chọn hành động theo COD. AI giải thích và gợi ý thêm. Hoàn tiền = người duyệt. Không live SPX.”

## Honesty
COD at-risk = fixture metric. Fee 2 chiều = ước tính deterministic. Billing sandbox. Không claim live carrier.

## Round 7 focus
Advisor cạnh mỗi engine action trên UI/CLI; stub labeled; refund path vẫn human-only.
