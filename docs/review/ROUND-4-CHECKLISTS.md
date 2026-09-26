# ROUND-4 — CHECKLISTS (per-app hands-on)

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User t19**  
> Judge: tick từng dòng khi **đã làm tay**. Gắn tip SHA ở đầu phiên.  
> Rubric: `ROUND-4-RUBRIC.md` · Form: `ROUND-4-FEEDBACK-FORM.md` · Env: `ROUND-4-ENV.md`.

**Chung (mọi app)**

- [ ] `git pull` · tip SHA ghi vào form
- [ ] `cd /workspace/bizmate` · `npm install` nếu cần
- [ ] Không invent metrics · không claim live SPX/tax/pay
- [ ] Capture log optional → `docs/review/runs/r4-<judge>-<app>.txt`

---

## 1) BizMate — Vite + TS monorepo

**Tip tham chiếu:** `02ad24c` / stack `124e0f7` (hoặc HEAD chứa chúng)  
**Ports:** Vite web mặc định `:5173` · `npm run dev:web`

### Happy path

- [ ] `npm run demo:offline` → EXIT 0 · dòng `demo PASSED`
- [ ] Không approve → thấy `approve_fail` / FAIL human approval
- [ ] Có approve → `approve_ok` + `persist_ok` · ledger/story hoàn tất
- [ ] Who-pays / Sea seat / cost-center **STUB** in CLI (visible)
- [ ] `npm run build -w @bizmate/web` → EXIT 0
- [ ] *(ENV green)* `npm run dev:web` — story Bà Lan / chips Tạo→Chấm→Duyệt→Chạy
- [ ] *(ENV green)* Panel **Giá / subscription** liệt kê Sea seat · Codex · SME roadmap

### Edge

- [ ] HITL money gate: refuse rồi ok (không persist khi từ chối)
- [ ] Audit JSONL có sự kiện approve/persist (path runtime audit)

### Billing honesty

- [ ] `createCheckout` / billing path **labeled** stub hoặc stripe_test
- [ ] Honesty banner / copy: Sea budget ≠ card live; SME Pro = roadmapOnly nếu hiện
- [ ] Không claim ARR/ARPU live

**Runbook:** `docs/review/runbooks/bizmate.md`

---

## 2) Shield — PWA + Service Worker (+ Vite)

**Tip tham chiếu:** `76c6a8c` / feat `d751cef`  
**Ports:** PWA Vite `:5174` · `npm run dev -w @bizmate/shield`

### Happy path

- [ ] `npm run demo:shield` → EXIT 0
- [ ] Inbox fixture: ≥1 **BLOCK** + family alert
- [ ] ≥1 **ALLOW** (tin thật) không false-block cứng
- [ ] `npm run build -w @bizmate/shield` → EXIT 0 (tsc + PWA; có `sw.js` / manifest)
- [ ] *(ENV green)* `npm run preview -w @bizmate/shield` hoặc `dev` — mở family UI
- [ ] *(ENV green)* BLOCK trên UI → tip / alert family cảm được

### Edge

- [ ] Human override / không auto-transfer tiền (guardian rules)
- [ ] Detector deepfake = **fixture** labeled (không claim on-device ML live)
- [ ] Optional: `npm run demo:shield -- --once` hoặc `--subscribe` nếu có

### Billing honesty

- [ ] Plans Free / Family Care / Family Plus (fixture) hiện CLI hoặc UI
- [ ] Subscribe CTA → `stripe_test` hoặc `offline_stub` + **honestyBanner**
- [ ] Sea = distribution only · buyer = family B2C (child pays)
- [ ] SW notify = local stub — không claim remote push production

**Runbook:** `docs/review/runbooks/shield.md`

---

## 3) Bookkeeper — Next.js + better-sqlite3

**Tip tham chiếu:** `55758e1` / feat `37cfd0c`  
**Ports:** Next `:3010` · `npm run demo:ui -w @bizmate/bookkeeper` / `dev`

### Happy path

- [ ] `npm run demo:bookkeeper -- --reset` → EXIT 0
- [ ] Banner Bà Lan · YTD seed ~980tr · week-2 kênh An Đông
- [ ] Flow: đề xuất → **Từ chối** → **Duyệt** → YTD cập nhật
- [ ] SQLite line / `better-sqlite3 · offline` persisted
- [ ] `npm run build -w @bizmate/bookkeeper` → EXIT 0
- [ ] *(ENV green)* Next UI `:3010` — ledger + HITL buttons dùng được

### Edge

- [ ] “hôm nay không bán” → no-op (không ghi sổ)
- [ ] Cảnh báo ngưỡng **1B** khi sale lớn
- [ ] Idempotency: cùng id khác amount → reject (nếu demo in)
- [ ] AUDIT: `approve_rejected` + `approve_committed` (ít nhất một mỗi loại trên --reset)

### Billing honesty

- [ ] Soft paywall **Pro kê khai** khi crossed / gần 1B
- [ ] Free vs Pro fixture · `createCheckout` / stubCharge labeled
- [ ] **NEVER** live tax portal / live billing claim
- [ ] Who pays = tiểu thương (Bà Lan), không phải cơ quan thuế

**Runbook:** `docs/review/runbooks/bookkeeper.md`

---

## 4) FloodOps — Next + Leaflet + worker

**Tip tham chiếu:** `73cac83` / feat `6e4542c`  
**Ports:** Next web `:3011` · `npm run dev -w @bizmate/floodops`

### Happy path

- [ ] `npm run demo:floodops` (hoặc `-- --reset`) → EXIT 0
- [ ] Wave fixture: auto + HUMAN actions in
- [ ] ORD high-COD `propose_refund` → **awaiting_human** (không auto_applied)
- [ ] Demo Duyệt hoàn (ops-lead) → approved + audit
- [ ] `npm run worker -w @bizmate/floodops -- --help` (hoặc worker EXIT 0 path) OK
- [ ] `npm run build:web -w @bizmate/floodops` → **EXIT 0** (R4 bar — Lee CONDITIONAL nếu fail)
- [ ] *(ENV green)* UI `:3011` — map Leaflet + orders panel

### Edge

- [ ] HUMAN+COD escalate khi flooded + SLA sát
- [ ] **COD at-risk ≠ invoice** / ≠ product payment — copy hoặc demo line rõ
- [ ] `--reset` replay được (audit wipe)

### Billing honesty

- [ ] Pricing seats per-site / per-wave fixture in demo hoặc UI
- [ ] Payment = internal stub / sandbox — **no live SPX pay**
- [ ] Buyer = ops org internal budget (không seller/end-customer)

**Runbook:** `docs/review/runbooks/floodops.md`

---

## Sau checklist

1. Điền `ROUND-4-FEEDBACK-FORM.md` (scores + verdict).
2. File optional `docs/review/r4-hands-<judge>.md` + cập nhật matrix trong `ROUND-4-HANDS-ON.md`.
3. Nếu **CONDITIONAL/FAIL** → Orchestrator route Adv → đợi **REPORT** (tip SHA) → re-use + re-score.

