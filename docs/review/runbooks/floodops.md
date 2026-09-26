# FloodOps Round 1 runbook

## Offline run
```
cd /workspace/bizmate
npm install   # if needed
npm run demo:floodops
npm run demo:floodops -- --reset   # clear audit JSONL, replay
npm test -w @bizmate/floodops
```
No API keys. Offline fixture only. **Không** live Shopee Express / SPX API.

## Key paths
- `apps/floodops/src/engine.ts` — replanOrder, runWave, codAtRiskVnd, SLA≤2h escalate
- `apps/floodops/src/audit.ts` — persistWaveActions JSONL, approveRefund
- `apps/floodops/src/demo.ts` — ① alerts ② actions ②b Duyệt hoàn ③ audit
- `apps/floodops/fixtures/hcm-flood-day.json` — 7 orders, 4 wards, courier_cancel
- `packages/contracts/schemas/flood-decision.v0.1.schema.json`
- `.scratch/floodops-001.md` — Codex task note

## Success signals (engine 7-order, post Round-1 clear)
| Order | Expected |
|-------|----------|
| ORD-1001 | AUTO hold (courier_cancel An Đông; SLA 4h) |
| ORD-1002 | AUTO noop (Bến Nghé clear) |
| ORD-1003 | HUMAN propose_refund → demo **Duyệt hoàn** `ops-lead-demo` → `approved` |
| ORD-1004 | AUTO noop (Thủ Đức clear) |
| ORD-1005 | HUMAN hold (SLA 1h + courier_cancel; never auto_applied) |
| ORD-1006 | AUTO reroute_clear_ward → q1-bnghe |
| ORD-1007 | AUTO reschedule |
| Counts | ~4–5 auto · ~2–3 human before approve; audit JSONL written |
| Metric | COD at-risk (fixture Σ flooded COD) printed |

## Rules to verify
- High COD `propose_refund` **never** `auto_applied`
- Flooded + `slaHoursLeft <= 2` → `awaiting_human` even if kind is reschedule/hold/reroute
- `approveRefund` only flips `propose_refund` awaiting_human → approved + audit line
- `--reset` deletes `.audit/wave.jsonl` so demo is replayable

## Pitch (≤90s)
Buyer = **last-mile ops lead / control tower** nội bộ Sea. Mùa mưa TP.HCM → FloodOps replan COD: auto dời/chuyển tuyến; hoàn tiền + SLA sát → human. Demo: flash 👤 HUMAN ORD-1003 → Duyệt hoàn → audit. Offline fixture — analogy SPX, không live API. Metric tuần-2: COD at-risk avoided (từ fixture).
