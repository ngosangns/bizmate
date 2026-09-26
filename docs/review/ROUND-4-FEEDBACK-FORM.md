# ROUND-4 — FEEDBACK FORM (template)

> Copy section dưới → `docs/review/r4-hands-<judge>.md` hoặc paste vào packet.  
> Rubric: `ROUND-4-RUBRIC.md` · Checklists: `ROUND-4-CHECKLISTS.md`.

---

## Meta

| Field | Value |
|-------|-------|
| **Judge** | _tên_ |
| **Date** | 2026-09-26 Asia/Saigon |
| **Tip SHA (HEAD hoặc per-app)** | `_sha_` |
| **ENV** | green / PENDING (CLI-only) |
| **Round** | ROUND-4 hands-on (stack rebuild) |
| **Pass #** | 1st score / re-score after Adv REPORT |

---

## Per-app scores

Scale **1–5** (xem descriptors trong rubric). C4 = **N/A** nếu chưa có Adv REPORT.

### BizMate (Vite)

| Criterion | Score | Notes |
|-----------|-------|-------|
| C1 Chức năng | _/_ | |
| C2 UI/UX | _/_ | |
| C3 Code quality | _/_ | |
| C4 Báo cáo (Adv) | _/_ \| N/A | |
| C5 Độ hoàn thiện | _/_ | |
| **Avg** | _._ | |
| **Verdict** | PASS \| CONDITIONAL \| FAIL | |

**Must-fix (Adv)** — chỉ khi CONDITIONAL/FAIL:

1. _
2. _

**Evidence:** commands chạy · log path · screenshot notes

---

### Shield (PWA)

| Criterion | Score | Notes |
|-----------|-------|-------|
| C1 Chức năng | _/_ | |
| C2 UI/UX | _/_ | |
| C3 Code quality | _/_ | |
| C4 Báo cáo (Adv) | _/_ \| N/A | |
| C5 Độ hoàn thiện | _/_ | |
| **Avg** | _._ | |
| **Verdict** | PASS \| CONDITIONAL \| FAIL | |

**Must-fix (Adv):**

1. _

**Evidence:**

---

### Bookkeeper (Next + SQLite)

| Criterion | Score | Notes |
|-----------|-------|-------|
| C1 Chức năng | _/_ | |
| C2 UI/UX | _/_ | |
| C3 Code quality | _/_ | |
| C4 Báo cáo (Adv) | _/_ \| N/A | |
| C5 Độ hoàn thiện | _/_ | |
| **Avg** | _._ | |
| **Verdict** | PASS \| CONDITIONAL \| FAIL | |

**Must-fix (Adv):**

1. _

**Evidence:**

---

### FloodOps (Next + Leaflet)

| Criterion | Score | Notes |
|-----------|-------|-------|
| C1 Chức năng | _/_ | |
| C2 UI/UX | _/_ | |
| C3 Code quality | _/_ | |
| C4 Báo cáo (Adv) | _/_ \| N/A | |
| C5 Độ hoàn thiện | _/_ | |
| **Avg** | _._ | |
| **Verdict** | PASS \| CONDITIONAL \| FAIL | |

**Must-fix (Adv):**

1. _

**Evidence:**

---

## Board (fill after all 4)

| App | Avg | Verdict | Must-fix P0? |
|-----|-----|---------|---------------|
| BizMate | | | Y/N |
| Shield | | | Y/N |
| Bookkeeper | | | Y/N |
| FloodOps | | | Y/N |

**Judge total:** _ PASS · _ CONDITIONAL · _ FAIL

---

## Adv REPORT section (Adv điền khi được route)

> Bắt buộc khi judge = CONDITIONAL hoặc FAIL. Ping Orchestrator + judges — **không silent**.

### App: ________

| Field | Content |
|-------|---------|
| **Before** | Triệu chứng judge thấy (quote verdict + tip cũ) |
| **After** | Đã sửa gì (files / behavior) |
| **Tip SHA** | `_full_or_short_sha_` |
| **Prove** | Commands EXIT 0 (demo / build / test) + log path |
| **How to re-use** | Exact commands judge chạy lại |
| **Honesty** | Stub/sandbox labels giữ? (Y/N + note) |
| **UI-POLISH?** | Có gộp polish cùng tip không? → `UI-POLISH.md` |

### Re-score (Judge điền sau REPORT)

| Criterion | Before | After | Notes |
|-----------|--------|-------|-------|
| C1 | | | |
| C2 | | | |
| C3 | | | |
| C4 | N/A hoặc _ | | chấm luôn REPORT |
| C5 | | | |
| **Avg / Verdict** | | **PASS \| CONDITIONAL \| FAIL** | |

---

## Loop reminder

`USE (checklist) → score form → [CONDITIONAL/FAIL → Adv fix + REPORT] → re-use → re-score`  
Lặp until **PASS** (avg ≥ 4, no FAIL criterion) hoặc Orchestrator đóng gate.

