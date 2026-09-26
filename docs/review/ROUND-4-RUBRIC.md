# ROUND-4 — Rubric chấm điểm (hands-on)

> Dùng sau khi judge **đã dùng app** theo `ROUND-4-CHECKLISTS.md`. Ghi điểm vào `ROUND-4-FEEDBACK-FORM.md`.

## Thang điểm (mỗi tiêu chí 1–5)

| Điểm | Ý nghĩa ngắn |
|------|----------------|
| **5** | Xuất sắc — sẵn sàng demo hackathon / pilot nội bộ |
| **4** | Tốt — đạt bar; lỗi nhỏ không chặn |
| **3** | Đạt tối thiểu — còn gap rõ, cần CONDITIONAL |
| **2** | Yếu — nhiều lỗ hổng UX/func |
| **1** | Fail — không dùng được / misleading |

## Tiêu chí

### 1. Chức năng (Function)
- **5:** Happy path + edge (HITL / escalate / refuse) chạy đúng; honesty không claim live giả.
- **4:** Happy path chắc; edge có, thiếu polish nhỏ.
- **3:** Happy path chạy; edge thiếu hoặc flaky.
- **2:** Một phần flow gãy.
- **1:** Demo/UI không chạy hoặc sai nghiệp vụ cốt lõi.

### 2. UI/UX
- **5:** Hiện đại, rõ hierarchy, mobile/ops-fit; không cảm giác prototype thô.
- **4:** Đẹp đủ dùng; vài chỗ còn thô.
- **3:** Dùng được nhưng “dev UI”.
- **2:** Khó đọc / thiếu trạng thái quan trọng.
- **1:** Gần như không có UI hoặc gây hiểu nhầm.

### 3. Code quality (quan sát được khi dùng + peek build/test)
- **5:** Build/test xanh; audit/billing rõ; stack khớp domain.
- **4:** Xanh; vài smell nhỏ.
- **3:** Chạy được; thiếu test/docs hoặc build warning nặng.
- **2:** Build/demo flaky.
- **1:** Không build / không prove được.

### 4. Báo cáo (Adv REPORT sau fix — hoặc pitch/docs nếu vòng đầu)
- **5:** Before/after + tip SHA + cách re-use rõ; honesty.
- **4:** Đủ để re-score nhanh.
- **3:** Có report nhưng thiếu tip/path.
- **2:** Mơ hồ / marketing không gắn evidence.
- **1:** Không report khi bị route.

### 5. Độ hoàn thiện (Completeness)
- **5:** Model + pricing + payment sandbox + domain loop khép.
- **4:** Gần đủ; 1 gap nhỏ documented.
- **3:** Core OK; thiếu business/UI polish.
- **2:** Thiếu nhiều phần cốt lõi.
- **1:** Stub rời / không thành sản phẩm.

## Map → verdict

| Verdict | Điều kiện |
|---------|-----------|
| **PASS** | Trung bình ≥ 4.0 **và** không tiêu chí nào = 1 **và** Function ≥ 4 |
| **CONDITIONAL** | TB ≥ 3.0 nhưng có tiêu chí ≤ 3, hoặc Function = 3 |
| **FAIL** | TB < 3.0 **hoặc** Function = 1 **hoặc** UI/UX = 1 với app UI-first |

Gate app: **≥4/5 judge PASS · 0 FAIL**.
