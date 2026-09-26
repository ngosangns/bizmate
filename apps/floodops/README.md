# FloodOps — điều phối đơn ngày ngập / flood-day last-mile replan

**Offline, deterministic rule engine** for HCMC flood-day logistics. When wards flood, FloodOps replans COD orders: auto-reschedule, reroute to a clear ward, hold, or escalate a refund to a human.

> **Không** gọi live Shopee Express / SPX API. Fixture `hcm-flood-day.json` là analogy last-mile (đơn COD + phường ngập) — cùng pattern ops SPX quan tâm, nhưng chạy 100% offline.

## Buyer nội bộ (GTM persona)

| Role | Why |
|------|-----|
| **Last-mile ops lead / control tower** (Sea/SPX-style nội bộ) | Người chịu trách nhiệm ca mưa: dời giao, chuyển tuyến, duyệt hoàn COD |

**Tuần-2 metrics (fixture estimate, không phải KPI live):**
- **COD at-risk avoided** = Σ COD của đơn trên ward `flooded` nếu không replan (deterministic từ fixture).
- **% human queue** = số action `requiresHuman` / tổng action trong wave.

Ai trả tiền? Internal cost-avoidance (COD loss + phí 2 chiều) — champion = ops lead, không phải seller app store.

## What it is / Là gì

| VI | EN |
|----|----|
| Agent/rule engine đọc cảnh báo ngập + đơn COD | Rule engine reads flood alerts + COD orders |
| Tự áp dụng hành động nhỏ (dời giao, chuyển tuyến khô) | Auto-applies small actions (reschedule, reroute) |
| Đẩy hoàn COD cao / SLA ≤2h cho người duyệt | Escalates high COD refund / tight SLA to human |
| Mẫu tin nhắn buyer VN khi dời/chuyển/giữ (`buyerNotifyVi`) | Sample VN buyer SMS copy on reschedule/reroute/hold |
| Audit JSONL bất biến + `approveRefund` | Immutable JSONL audit + human approve helper |

Trust boundary (Biz Mate): **AI proposes → code verifies → human decides**. Runtime ở đây là code thuần — không LLM trên hot path. Policy thresholds hôm nay nằm trong fixture; Mate/Judge *có thể* codegen policy offline sau — xem `.scratch/floodops-001.md`.

## COD / SLA policy

Thresholds come from the fixture `policy`:

| COD (VND) | Clear wards? | Action | Human? |
|-----------|--------------|--------|--------|
| Ward `clear` | — | `noop` | no |
| `<= autoRescheduleMaxCodVnd` | yes | `reschedule` | **yes if SLA ≤2h** |
| `auto < COD < refund` | yes | `reroute_clear_ward` | **yes if SLA ≤2h** |
| `>= refundRequiresHumanAboveVnd` | any | `propose_refund` | **yes (never auto)** |
| flooded, no clear / courier cancel blocking reschedule | — | `hold` | **yes if SLA ≤2h** |

Default fixture: auto ≤ **500_000**, refund ≥ **1_000_000**.

**Lee rule:** mọi đơn trên ward flooded với `slaHoursLeft <= 2` → `requiresHuman: true` + `status: awaiting_human` (kể cả reschedule/hold/reroute).

`courier_cancel` trên phường đang ngập: **ưu tiên `hold`** thay vì `reschedule`. Mid-COD vẫn có thể `reroute` sang ward khô.

## Offline HCMC fixture

`fixtures/hcm-flood-day.json` — TP.HCM wards (An Đông, Bến Nghé, Hòa Hưng, Thủ Đức), **7 orders**, flood alerts + one `courier_cancel`. Pure JSON so `JSON.parse` is safe on D-Day.

## Run

```bash
# from monorepo root
npm run demo:floodops
npm run demo:floodops -- --reset    # xóa audit JSONL
npm run demo:floodops -- --replay   # đọc Duyệt ORD-1003 từ JSONL
npm test -w @bizmate/floodops
```

Demo story (90s): **honesty/schema → ① alerts → ② actions (HUMAN+COD) → ②b Duyệt/replay + phí 2 chiều → ②c Shop An Đông (3 dòng) → ③ audit**.

## Shopee Express relevance (analogy only)

Sea last-mile ops care about rain/flood disruption, COD risk, and courier drop-offs. FloodOps shows the **same decision shape** (auto small moves, human on money) without claiming a live SPX integration. Post-hackathon path: plug real ward/order feeds behind the same `replanOrder` / `runWave` interface.

## Post-hackathon roadmap (not built)

> Honest path after demo day — **roadmap, not shipped**.

| Item | Intent | Status |
|------|--------|--------|
| **Live flood feed** | Ingest ward flood alerts from a real feed (or ops CSV) behind the same `FloodEvent` shape | Roadmap |
| **Hub capacity** | Cap auto-reschedule/reroute by hub/courier capacity so one wave doesn't overload dry hubs | Roadmap |
| **Multi-wave throttle** | Stagger auto actions across waves when many wards flood at once (CS/ops queue protection) | Roadmap |

Still **no live SPX / Shopee Express API** in this repo. Plug feeds behind `replanOrder` / `runWave` when ready.

## Layout

```
apps/floodops/
  fixtures/hcm-flood-day.json
  .audit/wave.jsonl          # append-only (gitignored); --reset clears
  src/engine.ts              # replanOrder, runWave, summarizeEvents, codAtRiskVnd
  src/audit.ts               # persistWaveActions, approveRefund
  src/demo.ts                # offline CLI story
  src/__tests__/
  README.md
packages/contracts/schemas/flood-decision.v0.1.schema.json
```
