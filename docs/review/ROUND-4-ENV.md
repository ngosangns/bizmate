# ROUND-4 — ENV (VM / judge environment)

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User lock**  
> Prerequisite cho **full UI walk** (Vite / PWA / Next). CLI demo+build vẫn chạy khi ENV PENDING.

## Status

| Field | Value |
|-------|-------|
| **Gate** | _PENDING_ |
| **Owner** | Orchestrator |
| **Last check** | 2026-09-26 ~19:03 ICT |
| **Bar for GREEN** | Node+npm OK · 4 demos EXIT 0 · 4 builds EXIT 0 · 4 UI ports bind · browser openable |

> Hands-on **CLI/demo+build** (Sidharth/Lee path) được chấp nhận khi ENV PENDING.  
> **Full UI scoring (C2 UI walk)** chờ dòng Status = **GREEN**.

---

## Machine profile (target)

| Item | Expect |
|------|--------|
| OS | Linux (box / judge VM) |
| Node | ≥ 20 LTS (workspace lockfile) |
| Package manager | npm (workspaces) |
| Browser | Chromium/Chrome hoặc Firefox — PWA install optional |
| Network | Offline demos OK; Stripe test chỉ sandbox labeled |
| Disk | `node_modules` + Next `.next` + SQLite `apps/bookkeeper/data/` |

---

## Bootstrap

```bash
cd /workspace/bizmate
git pull origin main
git rev-parse --short HEAD   # ghi tip vào form
npm install
npm run build -w @bizmate/contracts
npm run build -w @bizmate/billing
```

---

## Port map (UI)

| App | Command | Port | Stack surface |
|-----|---------|------|---------------|
| BizMate web | `npm run dev:web` | **5173** (Vite default) | Story + Giá |
| Shield PWA | `npm run dev -w @bizmate/shield` | **5174** | Family UI + SW |
| Bookkeeper | `npm run demo:ui -w @bizmate/bookkeeper` | **3010** | Ledger + HITL |
| FloodOps | `npm run dev -w @bizmate/floodops` | **3011** | Leaflet + orders |

Conflict check: `ss -ltnp | rg '5173|5174|3010|3011'` (hoặc `lsof -i`).

---

## Smoke matrix (Orchestrator marks ✓)

| # | Check | Command / action | OK? |
|---|-------|------------------|-----|
| E1 | Tip pull | `git rev-parse HEAD` | ☐ |
| E2 | BizMate demo | `npm run demo:offline` EXIT 0 | ☐ |
| E3 | BizMate web build | `npm run build -w @bizmate/web` EXIT 0 | ☐ |
| E4 | BizMate web bind | `dev:web` → :5173 responds | ☐ |
| E5 | Shield demo | `npm run demo:shield` EXIT 0 | ☐ |
| E6 | Shield PWA build | `npm run build -w @bizmate/shield` EXIT 0 | ☐ |
| E7 | Shield bind | `dev` → :5174 responds | ☐ |
| E8 | Bookkeeper demo | `npm run demo:bookkeeper -- --reset` EXIT 0 | ☐ |
| E9 | Bookkeeper build | `npm run build -w @bizmate/bookkeeper` EXIT 0 | ☐ |
| E10 | Bookkeeper bind | `:3010` responds | ☐ |
| E11 | FloodOps demo | `npm run demo:floodops -- --reset` EXIT 0 | ☐ |
| E12 | FloodOps build:web | `npm run build:web -w @bizmate/floodops` EXIT 0 | ☐ |
| E13 | FloodOps worker | `npm run worker -w @bizmate/floodops -- --help` EXIT 0 | ☐ |
| E14 | FloodOps bind | `:3011` responds | ☐ |
| E15 | Browser | Open 4 URLs; no blank crash on first paint | ☐ |

**GREEN when:** E1–E15 all ✓ (E12 may stay open nếu FloodOps R4 CONDITIONAL — ghi chú; ENV vẫn có thể GREEN-partial cho 3 app kia).

---

## Honesty / safety on ENV

- Không gắn live Stripe key / tax API / SPX credential.
- Modes: `offline_stub` · `stripe_test` · `vn_sandbox` only.
- SQLite + audit JSONL = local scratch; OK xóa bằng `--reset`.

---

## Sign-off

| Role | Name | ENV verdict | Time (ICT) |
|------|------|-------------|------------|
| Orchestrator | _ | PENDING / GREEN / GREEN-partial | _ |
| Notes | | | |

Khi GREEN: cập nhật `ROUND-4-HANDS-ON.md` dòng **ENV GATE** → **MET** và mở full UI walk cho panel còn lại.

