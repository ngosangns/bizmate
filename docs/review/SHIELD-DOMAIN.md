# Shield domain — S1–S4 + Sid / Lee / Tuấn Anh (2026-09-26 Asia/Saigon)

Maps ROUND-1-DOMAIN Shield rows + late Sid/Lee/TA packets → evidence in code/demo/docs.

## Status map

| ID | Source | Improvement | Status | Evidence |
|----|--------|-------------|--------|----------|
| **S1** | Tuấn Anh / Sidharth | Stage = backup 30s only; not hero; buyer-trust QR | **Done** | `demo.ts` opener: `STAGE: 30s backup only — not hero; not seller KPI` + `buyer-trust QR / phishing adjacent (no live SPX)`; README stage posture |
| **S2** | Lee / Sidharth | Pitch: deepfakeScore = fixture meta, not detector | **Done** | Header `deepfakeScore=fixture` + `HONESTY: deepfakeScore = fixture meta (not a live detector)`; m2 still prints fixture stub |
| **S3** | Sidharth | Shadow 7 ngày: calendar / per-pattern | **Done** | `introducedAt` + `shadowUntil` (= +7d) on each `SCRIPT_PATTERNS`; `SHADOW_DAYS`, `isPatternInShadow(shadowUntil)`; demo lists shadow ids |
| **S4** | Lee | Shadow mode cho pattern mới trước enforce | **Done** | Shadow hits FLAG only (not count toward hard-block); hard URL/QR/deepfake still BLOCK; audit `shadowPatternIds` |
| **Sid-S1** | Sidharth | Opener literal `backup 30s · family B2C` + `deepfakeScore=fixture` | **Done** | `demo.ts` printHeader first lines after title |
| **Sid-S2** | Sidharth | Sea wedge sentence (distribution, not payer) | **Done** | `Sea wedge: Shopee Buyer Protection surface for fake QR hoàn tiền (distribution only; payer = family).` in demo + README |
| **Sid-S3** | Sidharth | Explicit `shadowUntil`; in shadow while `now < shadowUntil` | **Done** | `blacklist.ts` stores/computes both; mature patterns past; OTP/CSKH future (introduced 2026-09-24/25) |
| **Lee-S1** | Lee | AUDIT flash: deepfake=fixture + blacklistVersion/hash | **Done** | AUDIT SUMMARY: `blacklistVersion=… hash=… deepfake=fixture`; m2 detector fixture line |
| **Lee-S2** | Lee | New patterns in shadowUntil → FLAG never BLOCK; hard signals BLOCK | **Done** | `engine.ts` enforceableCodes exclude `shadowSoft`; tests |
| **Lee-S3** | Lee | FP SLA line after human override | **Done** | `FP SLA: trusted-contact false-block target <1%; override = human decide` |
| **TA-S1** | Tuấn Anh | Opener `30s backup · ba/mẹ mua Shopee`; no seller opener | **Done** | First pitch line in demo header; README forbids seller KPI framing |
| **TA-S2** | Tuấn Anh | Buyer VN tip after m3 QR block | **Done** | `Tip buyer: Đừng quét QR hoàn tiền từ shipper lạ — mở app Shopee để kiểm tra đơn.` |
| **TA-S3** | Tuấn Anh | familyAlert = one everyday VN sentence; hash/version only in AUDIT | **Done** | `familyAlert` plain VN; elder unchanged plain; version/hash only AUDIT SUMMARY |

## Prove

```bash
cd /workspace/bizmate
npm run test -w @bizmate/shield
npm run demo:shield
npm run demo -w @bizmate/shield -- --once
```

Expect: all tests green; demo EXIT 0; ~3 block / 2 flag / 1 allow; OTP/CSKH stay flag (shadow).


## Kyle / Son follow-on (post `13cde1b`)

| ID | Source | Improvement | Status | Evidence |
|----|--------|-------------|--------|----------|
| **Kyle-S1** | Kyle | Main STEP = icon + pill + 💬 one elder sentence; `reasons[]` only in AUDIT | **Done** | `demo.ts` runInboxPass: no inline reasons; AUDIT SUMMARY prints machine reasons per messageId |
| **Kyle-S2** | Kyle | CLI `--once` skips RESET REPLAY; default keeps reset | **Done** | `process.argv.includes("--once")`; README documents `npm run demo -w @bizmate/shield -- --once` |
| **Kyle-S3** | Kyle | STEP pill live counts | **Done** | `STEP k/N · action` + `live allow=… flag=… block=…` each message |
| **Son-S1** | Son | `detector: fixture` above-the-fold | **Done** | Header prints `detector: fixture` before honesty/Sea; m2 still prints detector fixture line |
| **Son-S2** | Son | `.scratch/shield-001.md` Codex/task evidence | **Done** | `.scratch/shield-001.md` — goal, trust boundary rules-not-LLM, self-review, acceptance |
| **Son-S3** | Son | Do not claim Mate codegen for Shield | **Done** | Demo `ENGINE: rule engine + fixture score — not Mate codegen`; README honesty section |

### Prove (Kyle/Son)

```bash
cd /workspace/bizmate
npm run test -w @bizmate/shield
npm run demo:shield
npm run demo -w @bizmate/shield -- --once
```

Expect: all EXIT 0; default still runs RESET REPLAY; `--once` prints `skip RESET REPLAY` and one inbox pass only.

## Remaining gaps (non-blockers)

- No live SMS/Zalo/QR channels / live SPX
- Deepfake remains fixture meta (intentional)
- In-memory audit only
- No on-device UI
