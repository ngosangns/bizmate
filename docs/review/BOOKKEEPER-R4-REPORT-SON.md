# Adv REPORT — Bookkeeper (Son Lê R4 CONDITIONAL)

> Adv · Bookkeeper · 2026-09-26 Asia/Saigon · Template: `ROUND-4-FEEDBACK-FORM.md` § Adv REPORT  
> Judge: Son Lê · Pass #1 verdict **CONDITIONAL** (avg 3.25) on tip `687e652`

### App: Bookkeeper (Next + SQLite)

| Field | Content |
|-------|---------|
| **Before** | Son Lê R4: `npm run build -w @bizmate/bookkeeper` **EXIT 1** after “Compiled successfully” — `ENOENT …/.next/server/pages-manifest.json` then retry `Cannot find module …/next-font-manifest.json`. `:3010` DOWN / no UI walk. Root class (Orchestrator): **stale `.next` race with ENV `next dev --port 3010`** sharing the same distDir — not type errors. Evidence: `runs/r4-son-bookkeeper-build.txt` · `r4-son-bookkeeper-build-retry.txt`. Must-fix #1: build EXIT 0 ổn định. |
| **After** | (1) `next.config.mjs` `distDir: process.env.BIZMATE_NEXT_DIST \|\| ".next"` — production build/start use `.next-build`; ENV `next dev` keeps `.next`. (2) Scripts: `build` = `rm -rf .next-build && BIZMATE_NEXT_DIST=.next-build next build`; `start` = `BIZMATE_NEXT_DIST=.next-build next start --port 3010`. (3) `.gitignore` `.next-build/`. (4) Same tip: Tailwind + shadcn-style UI (`src/lib/utils.ts` `cn()` **before** `components/ui/*`; Card/Button/Badge/Progress/Alert · HITL Duyệt/Từ chối). Progress hand-rolled (no orphan `@radix-ui/react-progress`). |
| **Tip SHA** | `53c147f` (`53c147fc05c053b90e47f85b45b3ef62cbe54c39`) · docs stamp tip follows |
| **Prove** | Commands below — all EXIT 0 on this tip. Logs: `/tmp/bk-build-racefix.log` · `/tmp/bk-test.log` · `/tmp/bk-demo.log` · curl HTTP 200. Prove packet: `BOOKKEEPER-UI-POLISH-PROVE.md` |
| **How to re-use** | See re-use block below |
| **Honesty** | **Y** — offline demo banner · sandbox/stub billing · no live tax/pay · Vietnamese Bà Lan · HITL approve/refuse · Free/Pro fixture labels kept |
| **UI-POLISH?** | **Y** — gộp cùng tip `53c147f` → stamp `UI-POLISH.md` Bookkeeper row |

### How to re-use (exact)

```bash
cd /workspace/bizmate
npm run build -w @bizmate/bookkeeper   # .next-build — safe alongside ENV next dev
npm test -w @bizmate/bookkeeper        # expect 16/16
npm run demo:bookkeeper -- --reset     # EXIT 0
# optional UI smoke:
npm run start -w @bizmate/bookkeeper   # or: npm run dev -w @bizmate/bookkeeper
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3010/
# expect 200
```

### Re-score (Judge điền sau REPORT)

| Criterion | Before | After | Notes |
|-----------|--------|-------|-------|
| C1 | 4/5 | | |
| C2 | 3/5 | | |
| C3 | 3/5 | | build race fixed |
| C4 | N/A | | chấm REPORT này |
| C5 | 3/5 | | |
| **Avg / Verdict** | 3.25 CONDITIONAL | **PASS \| CONDITIONAL \| FAIL** | |

### Prove exits (Adv · 2026-09-26 Asia/Saigon)

| Command | Exit |
|---------|------|
| `npm run build -w @bizmate/bookkeeper` | **0** |
| `npm test -w @bizmate/bookkeeper` | **0** (16/16) |
| `npm run demo:bookkeeper -- --reset` | **0** |
| `npm run start` + curl `http://127.0.0.1:3010/` | **HTTP 200** (+ `/api/health` 200) |
