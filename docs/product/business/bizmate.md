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
Offline fixtures mặc định. `BIZMATE_MODE=live` tùy chọn. Không giả live thuế / thanh toán / Stripe charge.

## Round 7 focus — stub vs live · badges · zero-LLM runtime

| Surface | Default | Live hook | Label |
|---------|---------|-----------|-------|
| Mate codegen / evolve | Offline **template / heuristic** via `apps/mate/src/ai-propose.ts` + `generator.ts` / `evolve.ts` | `BIZMATE_MODE=live` → `callLiveLlmStub` then **catch → offline stub** (never invent model traffic) | `createAiMeta` → `AI đề xuất (stub offline)` / live fallback |
| Web badges | Vite browser = **offline_stub** unless `VITE_BIZMATE_MODE` injected | — | **`AI đang đề xuất`** (Tạo/generating) · **`đã verify`** (after Chấm / ready+) · **`runtime deterministic · không LLM`** (Chạy) |
| Runtime | Hot path **zero LLM** | — | `apps/runtime/src/engine.ts` does not import LLM helpers |

Shared helpers: `packages/core/src/ai.ts` (`resolveAiMode`, `createAiMeta`, `callLiveLlmStub`).

### Pitch (VN)
Mate **đề xuất** workflow (stub offline rõ ràng) → Judge/Ajv **đã verify** → bạn **Duyệt** → Chạy sổ **không LLM**. Không claim live thuế hay thanh toán.

### Pitch (EN)
Mate **proposes** workflow drafts (honest offline stub) → code/Judge **verify** → human **approve** → runtime executes with **zero LLM**. No fake live tax or payment claims.
