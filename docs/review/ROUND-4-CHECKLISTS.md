# ROUND-4 — Checklist demo (hands-on)

Môi trường: theo `docs/review/ROUND-4-ENV.md` (khi xanh). Honesty: billing = sandbox/stub có label.

## BizMate (Vite + runtime)
- [ ] `npm run demo:offline` — vendor-day, HITL khi cần
- [ ] (UI) `npm run dev:web` — story Bà Lan / progress / Reset
- [ ] Xác nhận propose→verify→decide; không LLM trên hot path tiền
- [ ] Billing: listPlans / checkout stub + honesty banner
- [ ] Edge: refuse hoặc approve vượt ngưỡng (nếu có trong story)

## Bookkeeper (Next + SQLite)
- [ ] `npm run demo:bookkeeper -- --reset` — vượt 1B + citation
- [ ] UI `:3010` (hoặc port trong ENV) — one-screen VN
- [ ] HITL: Từ chối → Duyệt
- [ ] Soft paywall / Free·Pro + billing chung
- [ ] Edge: “hôm nay không bán” hoặc refuse-audit

## Shield (PWA + SW)
- [ ] `npm run demo:shield` / `--once` — BLOCK scam + ALLOW family
- [ ] PWA build/serve — home screen / SW (theo ENV)
- [ ] Care tip / family alert copy VN
- [ ] deepfake = fixture honesty
- [ ] Edge: warn hoặc human override nếu có

## FloodOps (Next + Leaflet + worker)
- [ ] `npm run demo:floodops` — AUTO + HUMAN COD
- [ ] Worker + Next UI (map Leaflet) theo ENV
- [ ] COD at-risk ≠ product invoice
- [ ] Approve hoàn / VND display
- [ ] Edge: courier_cancel hoặc SLA→human

Tick hết checklist trước khi ghi form.
