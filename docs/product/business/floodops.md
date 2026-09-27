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
| Ops advisor | NL rationale + optional alternate suggestion | Offline fixture (`adviseReplan`) · live hook (`adviseReplanAsync` khi `BIZMATE_MODE=live`) fallback stub nếu chưa có provider |
| Refund / tight SLA | — | Human approve |
| Buyer notify | Có thể polish copy (optional) | Template honesty; không gửi SMS thật |

## Trust pitch
“Engine quyết · AI giải thích · hoàn = human. Không live SPX. COD ≠ invoice.”

## Honesty
- **SANDBOX / STUB** mặc định. COD at-risk = fixture metric. Fee 2 chiều = ước tính deterministic. Billing sandbox. Không claim live carrier / live SPX.
- Live hook chỉ khi `BIZMATE_MODE=live`; `callLiveLlmStub` throw → fallback offline fixture, label `AI đề xuất (stub offline · live fallback)`, `meta.mode` vẫn `offline_stub` — không bịa model success.
- Money / COD / refund: engine + human. AI chỉ rationale + alternate (không auto-apply).

## Round 7 focus
Advisor cạnh mỗi engine action trên UI (`AI đang đề xuất` + trust-split badge); stub labeled; live hook gated + safe fallback; refund path vẫn human-only.
