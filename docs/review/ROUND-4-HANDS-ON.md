# ROUND-4 — HANDS-ON (rebuilt stacks)

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User lock**  
> **Bắt buộc sau STACK-REBUILD 4/4 Verified.** Judge phải **dùng app đã rebuild** như user thật (UI/PWA/demo/billing), không docs-only.  
> Tech R1 · Business R2 · Hands-on R3 giữ riêng — vòng này = stack-fit UX trên tip mới.

## Judging kit (t19)

| File | Role |
|------|------|
| [`ROUND-4-RUBRIC.md`](./ROUND-4-RUBRIC.md) | Criteria C1–C5 · scale 1–5 · PASS / CONDITIONAL / FAIL map |
| [`ROUND-4-CHECKLISTS.md`](./ROUND-4-CHECKLISTS.md) | Per-app hands-on: happy + edge + billing honesty |
| [`ROUND-4-FEEDBACK-FORM.md`](./ROUND-4-FEEDBACK-FORM.md) | Scores · notes · verdict · must-fix · Adv REPORT |
| [`ROUND-4-ENV.md`](./ROUND-4-ENV.md) | VM/judge ports · smoke matrix · ENV gate |
| [`UI-POLISH.md`](./UI-POLISH.md) | Parallel P0 polish tracking (4 Advs) |

## STACK GATE (prerequisite)

**MET** · `docs/review/STACK-REBUILD.md` · 4/4 Orchestrator Verified.

## ENV GATE (prerequisite)

**MET · GREEN** · `docs/review/ROUND-4-ENV.md` · tip `687e652` · 2026-09-26 19:07 ICT.  
4 demos + builds + tests EXIT 0 · UIs :5173 / :5174 / :3010 / :3011 HTTP 200. **Full UI HOLD lifted** rồi **C2 HOLD** sau Sidharth walk (BK/FO :3010/:3011 HTTP 500). CLI path vẫn OK.

## Per-app tip + how to use

| App | Stack | Tip | Use path (happy + 1 edge) |
|-----|-------|-----|---------------------------|
| BizMate | Vite + TS monorepo | `02ad24c` / `124e0f7` | `npm run demo:offline` · optional `npm run build -w @bizmate/web` / `dev:web` · HITL money + who-pays |
| Bookkeeper | Next + better-sqlite3 | `55758e1` / `37cfd0c` | `npm run demo:bookkeeper -- --reset` · Next UI `npm run dev -w @bizmate/bookkeeper` (:3010) · Từ chối→Duyệt · 1B paywall |
| Shield | PWA + SW (+ Vite) | `76c6a8c` / `d751cef` | `npm run demo:shield` / `--once` · PWA `npm run build -w @bizmate/shield` · BLOCK tip · Care sandbox |
| FloodOps | Next + Leaflet + worker | `73cac83` / `6e4542c` | `npm run demo:floodops` · `npm run worker -w @bizmate/floodops` · Next UI `dev` (:3011) · HUMAN+COD · COD≠invoice |

Pull tip per app (or latest main containing all four) before scoring. Honesty: stub/sandbox labeled; no fake live SPX/tax/pay.

## Protocol loop (Pstack/User P0)

```
USE (checklist) → score FEEDBACK-FORM → route Adv (if CONDITIONAL/FAIL)
    → Adv fix + REPORT (before/after · tip SHA) → judge re-use → re-score
    → repeat until gate
```

1. **ENV GREEN** — follow `ROUND-4-ENV.md` · ports :5173/:5174/:3010/:3011 · tip `687e652`.
2. Judge **USE** rebuilt apps — tick `ROUND-4-CHECKLISTS.md` (happy + edge + billing honesty).
3. Judge **score** per `ROUND-4-RUBRIC.md` → fill `ROUND-4-FEEDBACK-FORM.md` → matrix + optional `r4-hands-<judge>.md`.
4. **CONDITIONAL/FAIL** → Orchestrator route Adv → **fix** → tip + prove.
5. Adv **REPORT** (form § Adv REPORT: before/after · tip SHA · how to re-use) — not silent.
6. Judges **score the report** (C4) + re-use app if needed → new form pass.
7. Loop until **≥4/5 PASS · 0 FAIL** per app (use-score + report-score as required).

## Score matrix

| App | Sidharth | Lee | Tuấn Anh | Kyle | Son Lê | Aggregate |
|-----|----------|-----|----------|------|--------|-----------|
| BizMate | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| Bookkeeper | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** (re-score `53c147f`) | **PASS** |
| Shield | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| FloodOps | **PASS** (`d2df47c`) | **PASS** (`e3f2956`) | **PASS** (`d2df47c`) | **PASS** (`d2df47c`) | **PASS** (re-score `d2df47c`) | **5/5 PASS** |

## Routed CONDITIONAL / FAIL

| App | Judge | Status | Fix | Tip after |
|-----|-------|--------|-----|-----------|
| FloodOps | Trần Tuấn Anh | **PASS** (re-score avg 4.8) | missing `./ui/*` cleared · `:3011` walk | **PASS** |
| Bookkeeper | Son Lê | **CLEARED → PASS** (avg 4.8) | Next `build` FAIL pages-manifest/next-font on `687e652` | `53c147f` / `e3f2956` · Son re-score 19:18 ICT |
| FloodOps | Lee | **CLEARED → PASS** (avg 4.8) | `build:web` missing `pages/_app.js` | **PASS** |
| FloodOps | Sidharth | **CLEARED → PASS** (avg 4.8) | `build:web` EXIT 1 `/_document` / next-font | `d2df47c`/`e3f2956` · Sid · BK C2↑ |
| FloodOps | Kyle Tran | **CLEARED → PASS** (avg 4.8) | `build:web` `/_not-found` (HEAD `ddd5276`) | `d2df47c`/`e3f2956` · Kyle · shot |
| FloodOps | Son Lê | **CLEARED → PASS** (avg 4.8) | `build:web` /404 Html/_document (tip `687e652`) | `d2df47c`/`e3f2956` · Son · shot `r4-son-ui-floodops.png` |

Routed → Adv · FloodOps · **Lee + Sidharth + Tuấn Anh + Kyle**. After fix: tip + prove + **REPORT** (panel) → re-use + re-score form (C4).  
`build:web` symptoms: `_app`/`_document` (Lee/Sid) **và** missing `./ui/card|badge|separator` (TA @ `b54a2d8`) — harden cả hai.  
Also: UI-POLISH P0 parallel — `docs/review/UI-POLISH.md`.

## GATE STATUS

_GATE MET_ · 2026-09-26 ~19:23 ICT — **4 apps × ≥4/5 PASS · 0 FAIL · 0 open CONDITIONAL**. Mate/BK/Shield/FO all **5/5 PASS**. UI-POLISH Verified ×4. Tech R1 · Business R2 · Hands-on R3 untouched.

### Sidharth filed
- Packet: `r4-hands-sidharth.md` — Mate/BK/Shield **PASS** · FloodOps **CONDITIONAL** (`build:web`)
- Form kit: `r4-form-sidharth.md` (C2=3 CLI-only · ENV PENDING) · runs `r4-sid-*.txt`

### Lee filed
- Packet: `r4-hands-lee.md` — Mate/BK/Shield **PASS** · FloodOps **CONDITIONAL** (`build:web`)
- Form kit: `r4-form-lee.md` (avg ≥4 ×3 · FO avg 3.0 · C2=3 ENV PENDING) · tip `55758e1` · runs `r4-lee-*.txt`

### Trần Tuấn Anh filed
- FloodOps re-score **PASS** avg 4.8 · tip `d2df47c` · `:3011` walk · `FLOODOPS-R4-REPORT.md` §3
- Form kit: `r4-form-tuananh.md` · packet `r4-hands-tuananh.md`
- **PASS** Mate · BK · Shield · FloodOps (FO re-score PASS avg 4.8)
- Form updated: Mate/Shield C2 **3→4** (UI walk :5173/:5174) · BK/FO **C2 HOLD**
- Chờ Adv FO REPORT → re-score; BK C2 sau Adv fix ports


### Kyle Tran filed
- Form kit: `r4-form-kyle.md` · packet `r4-hands-kyle.md`
- Tip `ddd5276` · **PASS** Mate · BK · Shield · **CONDITIONAL** FloodOps (`build:web` `/_not-found`)
- C2 CLI-first (BK `:3010` 500 this session) · runs `r4-kyle-*.txt`
- Chờ Adv FO REPORT → re-score C4

- **C2 bump** Mate/Shield UI walk (`r4-kyle-ui-bizmate.png` · `r4-kyle-ui-shield.png`) → C2 **3→4** · avg **4.5** · PASS giữ · BK/FO C2 HOLD · FO CONDITIONAL giữ

### Sidharth UI walk (post ENV GREEN)
- Tip walk: Mate/Shield ports từng 200 nhưng browser pass 1 refused; **BK :3010 HTTP 500** (`.next` manifest); **FO :3011 HTTP 500**; `build -w bookkeeper` type FAIL.
- **C2 bump HOLD** · CLI PASS Mate/BK/Shield + FO CONDITIONAL giữ.
- Routed → Adv · Bookkeeper + Adv · FloodOps · 2026-09-26 19:08 ICT.

### Sidharth C2 bump (BizMate)
- Walk `:5173` OK → C2 3→**4** · PASS giữ · shot `runs/r4-sid-ui-bizmate.png` · form updated.
- Shield `:5174` vẫn refused · C2=3. BK/FO C2 HOLD chờ Adv tip.

### Son Lê filed
- **BK re-score PASS** tip `53c147f` · avg 4.8 · `BOOKKEEPER-R4-REPORT-SON.md` Re-score filled · `r4-form-son.md` updated
- Form kit: `r4-form-son.md` · tip `687e652`
- **PASS** BizMate · Shield · Bookkeeper (re-score `53c147f` avg 4.8) · FloodOps (re-score `d2df47c` avg 4.8) — **Son R4 4/4 PASS**
- **FO re-score PASS** · REPORT §5 filled · shot `r4-son-ui-floodops.png` · logs `r4-son-fo-rescore-*.txt`
- ENV docs GREEN nhưng curl partial (5174 OK · 5173/3010 down · 3011→500) · C2 CLI-primary
- Runs: `docs/review/runs/r4-son-*.txt`
- Chờ Adv BK + FO REPORT → re-score

### Shield `:5174` host fix (Adv)
Vite `::1`-only → `127.0.0.1` refused. Adv restart + `server.host: true` → localhost **and** 127.0.0.1 HTTP 200. Judging Room briefed retry. Tip polish còn gộp.

### Trần Tuấn Anh C2 bump
- Mate `:5173` C2 3→**4** · Shield `:5174` C2 3→**4** · PASS giữ · form `r4-form-tuananh.md`
- BK/FO C2 HOLD (connection refused). FloodOps CONDITIONAL `build:web` unchanged.

### Pstack re-probe (19:10 ICT)
- Tip `ddd5276` (dirty WIP): `:5173/:5174/:3010/:3011` all HTTP 200.
- **C2 HOLD** giữ đến khi BK/FO (và polish) land **clean tip + prove** — Sid 500 = mid-polish.
- Orchestrator flips ENV GREEN / GREEN-partial in `ROUND-4-ENV.md` sau verify tip sạch.

### Sidharth C2 bump (Shield)
- Walk `127.0.0.1:5174` OK → C2 3→**4** · PASS giữ · avg 4.25 · shot `runs/r4-sid-ui-shield.png` · form updated.
- Mate C2=4 · Shield C2=4 · BK/FO C2 HOLD · FO CONDITIONAL giữ.

### Orchestrator probe (Sid UI 500)
- HEAD clean `ddd5276`: BK build EXIT 0 after `rm -rf .next` (+ npm install); FO `build:web` EXIT 0. Fresh `dev` :3010/:3011 HTTP 200.
- Sid 500 / FO build FAIL / “type errors” ≈ **stale `.next` + SWC + dead Next**, not tip TS break. Prefer `localhost` over `127.0.0.1` when Vite binds `::1`.
- **C2 HOLD** vẫn đến Adv tip sạch + prove + REPORT (Son BK · FO ×5) — không clear CONDITIONAL chỉ vì probe xanh.

### Lee C2 bump (Mate/Shield)
- Tip walk `e541439` · Mate `:5173` C2 3→**4** · Shield `:5174` C2 3→**4** · PASS giữ · form `r4-form-lee.md` · `r4-lee-ui-walk.txt`
- BK/FO C2 HOLD · FO CONDITIONAL `build:web` giữ

### Kyle C2 bump (Mate/Shield)
- Mate `:5173` C2 3→**4** · Shield `:5174` C2 3→**4** · PASS giữ · form `r4-form-kyle.md` · shots `r4-kyle-ui-*.png`
- BK/FO C2 HOLD · FO CONDITIONAL giữ

### Son C2 bump (Mate)
- BizMate C2 3→**4** (PASS avg 4.5) · Shield C2=4 giữ · form `r4-form-son.md` · shots `r4-son-ui-*.png`
- BK/FO C2 HOLD + CONDITIONAL unchanged — chờ Adv REPORT

### Orchestrator verify FloodOps (2026-09-26 ~19:15 ICT)
- Tip `d2df47c` (fix `c93ea43`) · REPORT `FLOODOPS-R4-REPORT.md` ×5 · **PASS_VERIFY**
- Prove: `build:web` EXIT 0 · test 24/24 · fresh `:3011` HTTP 200/200 · UI-POLISH **Verified**
- Pinged Lee · Sidharth · Tuấn Anh · Kyle · Son → re-score FloodOps (+ C2 walk `:3011`)

### Orchestrator verify Bookkeeper (2026-09-26 ~19:16 ICT)
- Tip `53c147f` (docs `e3f2956`) · REPORT `BOOKKEEPER-R4-REPORT-SON.md` · **PASS_VERIFY**
- Prove: build `.next-build` EXIT 0 · test 16/16 · demo EXIT 0 · fresh `:3010` HTTP 200 · UI-POLISH **Verified**
- Pinged Son Lê → re-score Bookkeeper (+ C2 walk `:3010`); Sidharth optional C2 BK if walkable


### Lee FloodOps re-score
`e3f2956` · **PASS** (4.8) · form `r4-form-lee.md` · REPORT table filled. Lee R4 **4/4 PASS**.

### Son Lê Bookkeeper re-score
- Tip `53c147f` · **PASS** avg 4.8 (was CONDITIONAL 3.25) · C2 walk `:3010` · form `r4-form-son.md` · shot `runs/r4-son-ui-bookkeeper.png`
- Bookkeeper aggregate **5/5 PASS**. FloodOps Son still CONDITIONAL — nudged re-score on REPORT.

### Trần Tuấn Anh FloodOps re-score
- Tip `d2df47c` · **PASS** avg 4.8 (was CONDITIONAL missing ui/*) · C2 `:3011` · REPORT §3 · form `r4-form-tuananh.md`

### Sidharth FloodOps re-score
- Tip `d2df47c`/`e3f2956` · **PASS** avg 4.8 · REPORT §2 · form · BK C2 3→4 · Sid R4 **4/4 PASS**

### Kyle FloodOps re-score
- Tip `d2df47c`/`e3f2956` · **PASS** avg 4.8 · `:3011` fresh · shot `r4-kyle-ui-floodops.png` · REPORT §4 · Kyle R4 **4/4 PASS**

### Son FloodOps re-score
- 2026-09-26 ~19:23 ICT · tip `d2df47c` / HEAD `e3f2956` · avg **4.8 PASS** · Son R4 **4/4 PASS** · FO aggregate **5/5**

### Orchestrator CLOSE ROUND-4 (2026-09-26 ~19:23 ICT)
- Son FloodOps re-score **PASS** avg 4.8 · tip `d2df47c` · shot `runs/r4-son-ui-floodops.png`
- Score matrix: BizMate · Bookkeeper · Shield · FloodOps — all **5/5 PASS**
- **GATE MET** ≥4/5 PASS · 0 FAIL × 4 apps

