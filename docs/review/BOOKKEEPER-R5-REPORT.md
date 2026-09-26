# Adv REPORT — Bookkeeper (R5 UX · Lee + Sidharth + Kyle + Son)

> Adv · Bookkeeper · 2026-09-26 Asia/Saigon · Template: R4 REPORT style  
> Judges: Lee Chon Cheng · Sidharth · Kyle Tran · Son Lê · Pass #1 all **CONDITIONAL** (TB 3.5) on tip `23ec3b4`  
> Tuấn Anh already PASS BK — this tip ships the CONDITIONAL panel fixes only.

### App: Bookkeeper (Next + SQLite)

| Field | Content |
|-------|---------|
| **Before** | **Lee** (`r5-form-lee.md`): TB 3.5 CONDITIONAL — Từ chối không giữ lý do (HITL audit gap); mobile `max-w-phone` at 1280 lãng phí; 1B warn khi propose chưa đủ rõ. **Sidharth** (`r5-form-sidharth.md`): TB 3.5 CONDITIONAL — no explicit who-pays (stall vs Sea pilot vs Pro) in 30s GTM read; phone-sparse desktop. **Kyle** (`r5-form-kyle.md`): TB 3.5 CONDITIONAL — 1B “paywall” chỉ copy, không khóa feature rõ sau vượt ngưỡng (silent/absent lock). **Son** (`r5-form-son.md`): TB 3.5 CONDITIONAL — reset/reject state semantics mờ (YTD/seed lệch cảm nhận); reject reason không giữ rõ. Tip before: `23ec3b4`. |
| **After** | (1) **Lee P0 reject reason:** `actionRefuse(reason?)` / `refusePending(reason?)`; UI textarea bắt buộc trước Từ chối; audit `Human Từ chối: <reason> — chưa ghi sổ`; `ScreenState.lastRejectReason` + Alert sau reject. Dual-column `lg:grid-cols-2` + `lg:max-w-6xl`. Warn **VƯỢT NGƯỠNG 1 TỶ** + YTD trước/sau/còn lại; `_lastStatus` threshold note. (2) **Sid who-pays:** above-fold header line + Free/Pro card GTM line (Free=Bà Lan · Sea pilot=STUB cost-center · Pro=tiểu thương SANDBOX) — no live claims. (3) **Kyle post-1B lock:** `postOneBLocked` when YTD≥1B && !Pro sandbox; Đề xuất gated with visible **KHÓA** copy + why; Pro CTA “mở khóa”; HITL pending cross shows auto-persist KHÓA until Duyệt. (4) **Son reset deterministic:** `resetUiSession` wipe+reseed+rewrite fixture vendor; status includes explicit YTD + `deterministic`; double-reset test same seed. Demo audit reason `sai số tiền — demo HITL`. Kept `BIZMATE_NEXT_DIST=.next-build`. |
| **Tip SHA** | `49f57b4` (`49f57b402cfd14a64db947631e4b30d0c1968456`) · bookkeeper Adv (parent of later FloodOps tip) |
| **Prove** | Commands below — all EXIT 0. test **20/20** · demo --reset EXIT 0 · build EXIT 0 · curl `:3010` **HTTP 200** (+ `/api/health` 200). |
| **How to re-use** | See re-use block below |
| **Honesty** | **Y** — offline demo · STUB/SANDBOX billing · no live tax/pay · Vietnamese Bà Lan · HITL Duyệt/Từ chối · who-pays labeled · post-1B lock soft (sandbox unlock) |
| **UI-POLISH?** | Y — R5 UX panel (reject reason · dual-col · 1B warn · who-pays · post-1B lock · reset) |

### How to re-use (exact)

```bash
cd /workspace/bizmate
npm test -w @bizmate/bookkeeper        # expect 20/20
npm run demo:bookkeeper -- --reset     # EXIT 0
npm run build -w @bizmate/bookkeeper   # .next-build — safe alongside ENV next dev
npm run start -w @bizmate/bookkeeper   # or: npm run dev -w @bizmate/bookkeeper
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3010/
# expect 200
```

### Re-score (Judge điền sau REPORT)

| Criterion / Axis | Before (Lee/Sid/Kyle/Son) | After | Notes |
|------------------|---------------------------|-------|-------|
| Lee D3 reject reason | 3 (gap) | _(blank)_ | lastRejectReason + audit |
| Lee/Sid D2 desktop | 3 (phone@1280) | _(blank)_ | lg dual-col max-w-6xl |
| Sid who-pays GTM | missing | _(blank)_ | header + Free/Pro |
| Kyle D4 post-1B lock | 3 (copy-only) | _(blank)_ | postOneBLocked + why |
| Son reset seed | mờ / lệch | _(blank)_ | deterministic double-reset |
| **Avg / Verdict** | 3.5 CONDITIONAL ×4 | **_(blank)_** | Leave for judges |

### Prove exits (Adv · 2026-09-26 Asia/Saigon)

| Command | Exit |
|---------|------|
| `npm test -w @bizmate/bookkeeper` | **0** (20/20) |
| `npm run demo:bookkeeper -- --reset` | **0** |
| `npm run build -w @bizmate/bookkeeper` | **0** |
| `npm run start` + curl `http://127.0.0.1:3010/` | **HTTP 200** (+ `/api/health` 200) |

### Before → After (must-fix map)

| Judge | Must-fix | After |
|-------|-----------|-------|
| Lee | Retain lý do Từ chối | reason required · audit · lastRejectReason Alert |
| Lee | Dual-column ~1280 | `lg:grid-cols-2` · `lg:max-w-6xl` |
| Lee | Warn 1B rõ hơn | **VƯỢT NGƯỠNG 1 TỶ** + YTD trước/sau + status note |
| Sidharth | Who-pays explicit | Header + Free/Pro: Bà Lan / Sea STUB / Pro SANDBOX |
| Kyle | Post-1B lock state | Gated Đề xuất + KHÓA copy + Pro unlock path |
| Son | Reset seed deterministic | reset rewrite fixture · two-reset test equal seed |
