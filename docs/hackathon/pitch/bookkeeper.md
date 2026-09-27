# Bookkeeper — pitch 60–90s + demo 3'

## Pitch (~75s)

**Pain:** Bà Lan / hộ KD kê khai theo lời nói — LLM tự cộng YTD / 1B thì sai và không kiểm toán.  
**Product:** `AiLedgerProposer` đề xuất **dòng nháp** từ utterance; **rule + @bizmate/core** tính tổng / ngưỡng 1 tỷ; UI badge `AI đề xuất` · `rule verify` · `chờ duyệt`.  
**Trust:** AI không sở hữu tax/YTD; **Duyệt** mới persist.  
**Honesty:** Offline = heuristic stub. Live = OpenAI chỉ viết *classificationNote*; items vẫn parse code. Không key → `missing_api_key`.

## Demo script (~3')

| t | Click / nói |
|---|-------------|
| 0:00 | **http://localhost:3010** — health OK; badge AI / rule / chờ duyệt. |
| 0:30 | Nhập utterance: *“sáng nay bán 2 áo, mỗi cái 200 nghìn”* → Propose. |
| 1:00 | Chỉ dòng items; YTD/1B từ rule — nếu gần 1B, chỉ *crossedThreshold* từ code. |
| 1:45 | **Duyệt** / **Từ chối** — HITL. |
| 2:15 | Reject rồi propose lại — ledger chưa ghi khi chưa duyệt. |
| 2:45 | Honesty: *stub offline* hoặc live note nếu có key. |

**Không nói:** “AI tính giúp vượt 1 tỷ.”
