# BizMate — business brief (AI role)

> Tiếng Việt OK · product story for Sea x OpenAI Codex Hackathon VN

## One-liner
Agent **viết** workflow bán hàng / kế toán thành app deterministic — Evoloop cho SME ops. Runtime không chat LLM trên hot path.

## Pain
SME / seller cần phần mềm ops đáng tin (ledger, hóa đơn nháp, pipeline). Chat LLM trong app thì **không audit được tiền/thuế**; làm tay thì chậm.

## AI trong câu chuyện sản phẩm
| Moment | AI làm gì | Code / người làm gì |
|--------|-----------|---------------------|
| Tạo / evolve Mate | Đề xuất mã workflow + schema từ domain brief | Ajv + Judge verify; human publish |
| Judge | Gợi ý / chấm high-level (offline rule hoặc SLM) | Không được tự publish |
| EM | Điều phối task agent như EM | Ownership + acceptance checklist |
| Runtime | **Không** gọi LLM | Chạy workflow đã duyệt |

## Trust pitch (30s)
“AI viết workflow → code + Judge kiểm → bạn duyệt → runtime chạy không LLM. Tiền và thuế luôn do rule.”

## Honesty
Offline fixtures mặc định. `BIZMATE_MODE=live` tùy chọn. Không giả live thuế / thanh toán.

## Round 7 focus
Harden UI badges `AI đang đề xuất` / `đã verify`; chứng minh zero-LLM runtime; docs rõ stub vs live.
