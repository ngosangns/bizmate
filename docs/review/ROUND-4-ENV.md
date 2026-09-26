# ROUND-4 — ENV (VM / judge environment)

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User lock**  
> Prerequisite cho **full UI walk** (Vite / PWA / Next). CLI demo+build vẫn chạy khi ENV PENDING.

## Status

| Field | Value |
|-------|-------|
| **Gate** | **GREEN** |
| **Owner** | Orchestrator (box `/workspace/bizmate`) |
| **Last check** | 2026-09-26 **19:06 ICT** |
| **Tip SHA** | `be24bb6` (main; contains STACK-REBUILD tips through Bookkeeper `55758e1` / `37cfd0c`) |
| **Bar for GREEN** | Node+npm OK · 4 demos EXIT 0 · 4 builds EXIT 0 · 4 UI ports bind · browser openable |

> **Full UI scoring (C2 UI walk)** is open — all four UIs HTTP 200 on this box.

---

## Machine profile (this box)

| Item | Actual |
|------|--------|
| OS | Linux (shared box) |
| Node | v20.19.2 |
| npm | 9.2.0 |
| Package manager | npm workspaces |
| Browser | use `http://localhost:<port>/` (Vite on `::1` / localhost) |
| Network | Offline demos OK; Stripe = sandbox labeled only |
| Disk | `node_modules` + Next `.next` + SQLite `apps/bookkeeper/data/` |

---

## Bootstrap

```bash
cd /workspace/bizmate
git pull origin main
git rev-parse --short HEAD   # expect be24bb6+ (or tip with all four stacks)
npm install
npm run build -w @bizmate/contracts
npm run build -w @bizmate/billing
npm run build -w @bizmate/core
# apps (also covered by root `npm run build`):
npm run build -w @bizmate/web
npm run build -w @bizmate/bookkeeper
npm run build -w @bizmate/shield
npm run build -w @bizmate/floodops
npm run build:web -w @bizmate/floodops
```

Verified this session: contracts + billing + core + web + bookkeeper + shield + floodops(+web) **EXIT 0**.

---

## Port map (UI) — running on this box

| App | Command | Port | URL | Stack surface |
|-----|---------|------|-----|---------------|
| BizMate web | `npm run dev:web` | **5173** | http://localhost:5173/ | Story + Giá + honesty |
| Shield PWA | `npm run dev -w @bizmate/shield` | **5174** | http://localhost:5174/ | Family UI + SW |
| Bookkeeper | `npm run dev -w @bizmate/bookkeeper` (alias `demo:ui`) | **3010** | http://localhost:3010/ | Ledger + HITL + 1B |
| FloodOps | `npm run dev -w @bizmate/floodops` | **3011** | http://localhost:3011/ | Leaflet + orders |

Conflict check: `ss -ltnp | rg '5173|5174|3010|3011'`.

### Background PIDs (2026-09-26 19:04 ICT)

| App | Shell PID | Server PID | Notes |
|-----|-----------|------------|-------|
| BizMate | 578823 | vite 578988 | HTTP 200 |
| Shield | 578879 | vite 578972 | HTTP 200 |
| Bookkeeper | 578911 | next 579054 | HTTP 200 · `/api/health` OK |
| FloodOps | 578946 | next 579061 | HTTP 200 · `/api/state` OK |
| FloodOps worker | — | one-shot EXIT 0 | writes `apps/floodops/data/orders.json` · re-run: `npm run worker -w @bizmate/floodops` |

Snapshot: `.scratch/r4-pids.txt` · Logs: `.scratch/r4-bizmate-web.log` · `r4-shield.log` · `r4-bookkeeper.log` · `r4-floodops.log` · `r4-floodops-worker.log`

**Vite note:** binds `localhost` (`::1` on this box). Prefer `http://localhost:5173/` / `:5174` over `127.0.0.1` for curl.

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5173/
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5174/
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3010/
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3011/
curl -s http://localhost:3010/api/health
curl -s http://localhost:3011/api/state | head -c 200
```

---

## Demo commands (must EXIT 0)

```bash
npm run demo:offline
npm run demo:bookkeeper -- --reset
npm run demo:shield                    # or: npm run demo -w @bizmate/shield -- --once
npm run demo:floodops -- --reset      # flags: --reset | --replay
```

Relevant tests also EXIT 0 this session: `@bizmate/billing` · `runtime` · `bookkeeper` · `shield` · `floodops`.

### Happy + one edge (judge)

| App | Happy | Edge |
|-----|-------|------|
| BizMate | `demo:offline` + web UI | HITL money / who-pays / Giá honesty |
| Bookkeeper | `demo:bookkeeper -- --reset` + Next | Từ chối→Duyệt · 1B soft paywall |
| Shield | `demo:shield` + PWA | BLOCK tip · Care sandbox subscribe |
| FloodOps | `demo:floodops` + Next (+ worker) | HUMAN+COD · COD ≠ invoice |

---

## Smoke matrix (Orchestrator marks ✓)

| # | Check | Command / action | OK? |
|---|-------|------------------|-----|
| E1 | Tip pull | `git rev-parse HEAD` → `be24bb6` | ✓ |
| E2 | BizMate demo | `npm run demo:offline` EXIT 0 | ✓ |
| E3 | BizMate web build | `npm run build -w @bizmate/web` EXIT 0 | ✓ |
| E4 | BizMate web bind | `dev:web` → :5173 HTTP 200 | ✓ |
| E5 | Shield demo | `npm run demo:shield` EXIT 0 | ✓ |
| E6 | Shield PWA build | `npm run build -w @bizmate/shield` EXIT 0 | ✓ |
| E7 | Shield bind | `dev` → :5174 HTTP 200 | ✓ |
| E8 | Bookkeeper demo | `npm run demo:bookkeeper -- --reset` EXIT 0 | ✓ |
| E9 | Bookkeeper build | `npm run build -w @bizmate/bookkeeper` EXIT 0 | ✓ |
| E10 | Bookkeeper bind | `:3010` HTTP 200 | ✓ |
| E11 | FloodOps demo | `npm run demo:floodops -- --reset` EXIT 0 | ✓ |
| E12 | FloodOps build:web | `npm run build:web -w @bizmate/floodops` EXIT 0 | ✓ |
| E13 | FloodOps worker | `npm run worker -w @bizmate/floodops` EXIT 0 | ✓ |
| E14 | FloodOps bind | `:3011` HTTP 200 | ✓ |
| E15 | Browser | 4 URLs respond (first-paint via HTTP 200) | ✓ |

**GREEN:** E1–E15 all ✓ @ tip `be24bb6` · 2026-09-26 19:06 ICT.

---

## Honesty / safety on ENV

- Không gắn live Stripe key / tax API / SPX credential.
- Modes: `offline_stub` · `stripe_test` · `vn_sandbox` only (`@bizmate/billing`).
- UI must show `honestyBanner(mode)` next to checkout / subscribe.
- Never claim live SPX pay · live tax portal · live ASR · live SMS.
- Sea = internal tooling / distribution — **not** Shield family card payer.
- FloodOps COD at-risk ≠ product invoice.
- SQLite + audit JSONL = local scratch; OK xóa bằng `--reset`.

---

## Sign-off

| Role | Name | ENV verdict | Time (ICT) |
|------|------|-------------|------------|
| Orchestrator | box executor | **GREEN** | 2026-09-26 19:06 |
| Notes | All 4 apps runnable; PIDs in `.scratch/r4-pids.txt`; tip `be24bb6` | | |

Khi GREEN: cập nhật `ROUND-4-HANDS-ON.md` dòng **ENV GATE** → **MET** và mở full UI walk cho panel còn lại.
