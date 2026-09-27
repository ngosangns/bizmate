# Overview — 90 giây (4 apps + trust)

**0–15s — Pain**  
SME / tiểu thương / gia đình / seller-ops cần app **đáng tin**. Chat-LLM quyết tiền thuế / risk / hoàn COD thì **không audit được**.

**15–35s — Insight**  
BizMate: agent **viết** workflow (white-box), runtime **chạy code**. Cùng pattern trên 4 sản phẩm: **AI đề xuất → code verify → human quyết**.

**35–75s — Four apps (mỗi app ~10s)**  
1. **Mate** — generate accounting/sales workflow → Judge (Laya+SLM) → Duyệt → Runtime **zero LLM**.  
2. **Bookkeeper** — giọng/text → AI draft dòng → rule 1B VND → **Duyệt** mới ghi sổ.  
3. **Shield** — rule/blacklist = verdict; AI chỉ giải thích + triage mềm (**không** override).  
4. **FloodOps** — engine COD/SLA chọn hành động; AI giải thích; **hoàn = human**.

**75–90s — Trust + ask**  
Offline stub mặc định; live OpenAI chỉ khi `BIZMATE_MODE=live` + key thật — thiếu key thì `missing_api_key`, không giả live.  
Ask: pilot Sea-internal / roadmap SME.

> Chi tiết từng app: `mate.md` · `bookkeeper.md` · `shield.md` · `floodops.md` · runbook `DEMO-DAY-RUNBOOK.md`.
