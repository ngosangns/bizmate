# bookkeeper-002 — Domain UI + e-invoice + week-2 metrics (+ Sid/Lee/TA)

## What to build
Round-1 domain K1–K4 plus Sid/Lee/TA fold-ins: mobile VN one-screen, richer e-invoice + citation excerpts, WEEK-2 seed metrics, soft paywall Pro kê khai, An Đông seller-group channel, approve_rejected audit, idempotent sửa sai beat, “hôm nay không bán” no-op.

## Owner
runtime (Bookkeeper) · GTM hypothesis labels only

## Acceptance checklist
- [x] K1 / TA-K1: `ui/index.html` — Sạp An Đông · YTD · Từ chối/Duyệt · cảnh báo 1B · offline banner
- [x] K1: README / `demo:ui`; `demo:bookkeeper` unchanged exit 0
- [x] K2 / Lee-K1: `e-invoice-sample.json` + citation đoạn/excerpt in CLI
- [x] K3 / Sid-K1: WEEK-2 METRICS — Duyệt, Từ chối-before-Duyệt, 1B warns, citation hits, YTD gap
- [x] Sid-K2: Pro kê khai soft paywall (CLI + UI) when crossedThreshold — no billing
- [x] Sid-K3 / TA-K3: ONE channel = nhóm tiểu thương chợ An Đông (README + FIX + demo)
- [x] Lee-K2: in-memory audit with `approve_rejected` printed at end
- [x] Lee-K3: same utteranceId different amounts → reject (demo + test)
- [x] TA-K2: “hôm nay không bán” no-op + sửa sai path
- [x] K4: scratch 001/002 + split commits
- [x] Kyle-K1: BIG lines ▶ ĐỀ XUẤT / ▶ TỪ CHỐI / ▶ DUYỆT each sale step
- [x] Kyle-K2/K3: PAUSE at 1B; `--reset` at TOP
- [x] Son-K1/K2/K3: scratch checklist + fail→fix 77b8622 + regex stub honesty
- [x] Docs + prove green

## Blocked by
- bookkeeper-001 — done

## HITL vs AFK
- Mode: AFK for code; UI HITL visual/static (labeled offline)

## Merge cadence
- Two commits: (1) metrics + e-invoice + audit/idempotency (2) mobile UI + scratch
- Done: prove commands green; push origin main

## Notes
- Metrics = demo-seed counts, not production KPIs.
- No live tax portal.
