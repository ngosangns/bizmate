# Mate (+ Judge + Runtime + Web) — pitch 60–90s + demo 3'

## Pitch (VN OK, ~75s)

**Pain:** SME muốn app kế toán/bán hàng tin cậy — không muốn “chat GPT quyết số”.  
**Product:** Mate **đề xuất** workflow TypeScript; Judge (Laya static + SLM) **verify**; người **Duyệt**; Runtime **chạy deterministic** (không LLM trên hot path).  
**Trust:** AI proposes / Ajv+Judge verifies / human decides. Tiền thuế không do model sinh.  
**Honesty:** Demo mặc định `offline_stub` (template). Live chỉ khi `BIZMATE_MODE=live` + `OPENAI_API_KEY` — thiếu key → `missing_api_key`, không gắn modelId giả.

## Demo script (~3')

| t | Click / nói |
|---|-------------|
| 0:00 | Mở **http://localhost:5173** — chỉ badge *AI đang đề xuất* / *đã verify* / *runtime · không LLM*. |
| 0:30 | Generate / chọn domain accounting — workflow hiện; nói “Mate đề xuất template, Ajv validate”. |
| 1:00 | Judge chạy — findings Laya; summary SLM heuristic (offline). |
| 1:45 | Bấm **Duyệt** — human gate. |
| 2:15 | **Chạy** — ledger/runtime path; nhấn mạnh **zero LLM**. |
| 2:45 | (Optional) Nếu có key: `BIZMATE_MODE=live` — badge live; nếu không: nói *missing_api_key fallback*. |

**Không nói:** “Chúng tôi đang gọi GPT quyết thuế.”
