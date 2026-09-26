# ROUND-4 — RUBRIC (judging kit)

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User t19**  
> Dùng khi chấm hands-on trên **stack rebuild** (Vite / PWA / Next+SQLite / Next+Leaflet).  
> Companion: `ROUND-4-CHECKLISTS.md` · `ROUND-4-FEEDBACK-FORM.md` · `ROUND-4-HANDS-ON.md`.

## Nguyên tắc

1. **Không docs-only** — phải USE app (demo + UI/PWA khi ENV green) rồi mới chấm.
2. **Honesty non-negotiable** — stub/sandbox/fixture **có label**; không claim live SPX / thuế / payment.
3. Scale **1–5** per criterion. Verdict map từ average + hard FAIL rules.
4. Tech R1 · Business R2 · Hands-on R3 **không đụng** — vòng này = stack-fit UX trên tip mới.

---

## Tiêu chí (5)

| # | Criterion | Trọng tâm R4 |
|---|-----------|--------------|
| C1 | **Chức năng** | Happy path + edge chạy thật trên stack rebuild; demo EXIT 0; build green khi bar yêu cầu |
| C2 | **UI/UX** | Story rõ trên Vite/PWA/Next; HITL/edge dễ hiểu; map/ledger/alert cảm được |
| C3 | **Code quality** | Stack-fit (không CLI giả Next); packaging build ổn; shared contracts/billing; không fake live |
| C4 | **Báo cáo** | Adv REPORT (khi CONDITIONAL/FAIL): before/after · tip SHA · how to re-use — rõ, honest |
| C5 | **Độ hoàn thiện** | Tip sẵn sàng judge re-use; runbook/demo/billing honesty; gap P0 đã đóng hoặc labeled |

> **C4** chỉ bắt buộc khi app từng CONDITIONAL/FAIL và Adv đã REPORT. Lần chấm đầu (chưa route Adv): chấm C4 = N/A hoặc giữ điểm “baseline note clarity” từ packet judge — **không FAIL chỉ vì chưa có Adv REPORT**.

---

## Thang điểm 1–5 (descriptors)

### C1 — Chức năng

| Điểm | Descriptor |
|------|------------|
| **5** | Happy + ≥1 edge EXIT 0; build/UI path green; HITL/money gate đúng; không crash; tip SHA khớp |
| **4** | Happy + 1 edge ổn; demo green; build OK hoặc gap nhỏ labeled non-blocking; honesty giữ |
| **3** | Demo chạy nhưng edge gãy / 1 path FAIL tạm; hoặc UI/build thiếu nhưng CLI đủ kể story — **CONDITIONAL territory** |
| **2** | Happy path gãy hoặc thiếu gate tiền/HITL; demo EXIT ≠ 0; stack claim không chứng minh được |
| **1** | Không chạy được / crash hard / fake live / phá honesty |

### C2 — UI/UX

| Điểm | Descriptor |
|------|------------|
| **5** | UI/PWA/dashboard kể story trong ≤2 phút; HITL/edge rõ; billing panel honesty; elder/ops/ledger fit domain |
| **4** | UI dùng được; story + edge hiểu được; label stub/sandbox thấy rõ; vài P1 polish OK |
| **3** | UI mỏng / CLI-only trong phiên nhưng path mở được; hoặc UI có nhưng flow HITL khó tìm — CONDITIONAL nếu bar R4 đòi UI |
| **2** | UI confuse / thiếu honesty banner / edge ẩn; judge không biết “ai trả tiền” từ surface |
| **1** | Không có surface usable hoặc misleading như live product |

### C3 — Code quality (stack-fit)

| Điểm | Descriptor |
|------|------------|
| **5** | Stack đúng target (Vite/PWA/Next+SQLite/Next+Leaflet+worker); build+test green; shared billing/contracts; zero-LLM money hot path giữ |
| **4** | Stack đúng hướng; build green; 1–2 debt nhỏ labeled; không fork billing |
| **3** | Stack claim nhưng packaging lệch (vd. `build:web` fail App Router) — **CONDITIONAL** |
| **2** | Stack giả / demo không phản ánh rebuild / dependency gãy |
| **1** | Broken packaging + honesty breach |

### C4 — Báo cáo (Adv REPORT)

| Điểm | Descriptor |
|------|------------|
| **5** | REPORT: before → after · tip SHA · lệnh re-use · honesty note · judge re-score trong 1 vòng |
| **4** | Đủ tip + before/after + path re-use; thiếu 1 chi tiết nhỏ |
| **3** | REPORT mơ hồ / thiếu SHA / không nói cách re-use — CONDITIONAL |
| **2** | Silent fix hoặc REPORT sai lệch tip |
| **1** | Không REPORT khi bắt buộc / bịa evidence |
| **N/A** | Chưa route Adv — bỏ qua khi tính avg (chia cho số criterion có điểm) |

### C5 — Độ hoàn thiện

| Điểm | Descriptor |
|------|------------|
| **5** | Gate-ready: demo+build+docs+billing honesty; P0 closed; re-use path 1 lệnh |
| **4** | Gần sẵn sàng; P1 còn lại không chặn PASS |
| **3** | P0 còn mở (build/UI/HITL/billing) — CONDITIONAL |
| **2** | Nhiều gap P0; tip không ổn định |
| **1** | Không hoàn thiện / không tái hiện được |

---

## Map điểm → verdict

Tính **avg** trên các criterion có điểm số (bỏ N/A).

| Verdict | Điều kiện |
|---------|-----------|
| **PASS** | **avg ≥ 4.0** **và** **không có criterion nào = FAIL hard** (điểm **≤ 2** trên C1–C5 đang chấm) **và** không breach honesty |
| **CONDITIONAL** | avg **≥ 3.0 và < 4.0**, **hoặc** avg ≥ 4 nhưng còn **một** gap P0 rõ (điểm 3 trên C1/C3/C5) có thể fix trong 1 vòng Adv |
| **FAIL** | avg **< 3.0**, **hoặc** bất kỳ criterion **≤ 2** trên C1/C3 (chức năng / stack), **hoặc** honesty breach (fake live / thiếu label sandbox) |

### Hard FAIL (bất kể avg)

- Demo crash / EXIT ≠ 0 trên happy path bắt buộc
- Claim live payment / live SPX / live tax portal
- Money path không HITL khi bar yêu cầu (BizMate EM · Bookkeeper Duyệt · FloodOps HUMAN+COD · Shield human override money)
- Tip SHA không tồn tại / không pull được

### Gate panel (Orchestrator)

Per app: **≥ 4/5 judge PASS · 0 FAIL**. CONDITIONAL mở → route Adv → REPORT → judge **re-score** (form mới) until gate.

---

## Gợi ý nhanh theo app

| App | C1 phải thấy | C2 phải cảm | Honesty |
|-----|--------------|-------------|---------|
| BizMate | `demo:offline` HITL + who-pays; Vite build | Story Tạo→Chấm→Duyệt→Chạy · Giá panel | Sea seat / cost-center **STUB** |
| Shield | `demo:shield` BLOCK+alert; PWA+SW build | Family UI · Care CTA | Stripe TEST / local-sw-stub |
| Bookkeeper | `--reset` Từ chối→Duyệt · 1B; Next+SQLite | Ledger UI · Pro sandbox | Không live tax |
| FloodOps | demo+worker; HUMAN+COD; `build:web` | Leaflet map · COD≠invoice | Internal stub · no live SPX |

