# Shield — STACK-REBUILD prove packet

> Adv · Shield · 2026-09-26 Asia/Saigon  
> Matrix: [`STACK-REBUILD.md`](./STACK-REBUILD.md)  
> Baseline tip: `fd56e9a` · Stack tip: **`d751cef`** (filled after push)

## Stack chosen

**PWA + Service Worker (+ Vite)** — **not Expo**.

| Why PWA | Why not Expo |
|---------|--------------|
| Monorepo proves `demo` + `test` EXIT 0 in Node/CI without Expo Go / simulator | Expo needs simulator / Expo Go for a credible mobile prove path |
| Family installs to home screen; local notifications via SW + Notification API | Native push ceramics are future — labeled `local-sw-stub` for now |
| Rule engine stays pure TS shared by CLI demo and PWA UI | Would fork prove path away from Orchestrator Node gate |

## Keep / migrate

- Rule/blacklist engine: `apps/shield/src/engine.ts`, `blacklist.ts` — risk NEVER LLM
- Fixtures: `fixtures/scam-inbox.json`, `fixtures/family-plans.json`
- `@bizmate/billing` Care subscribe honesty (sandbox/stub labeled)
- Elder VN copy, family alert, `detector: fixture`, `BLACKLIST_VERSION`, shadow mode, human override, allowlist
- Contract: `packages/contracts/schemas/shield-verdict.v0.1.schema.json`
- Root `npm run demo:shield` EXIT 0

## Layout

```
apps/shield/src/{engine,blacklist,demo,detector-stub,notify}.ts
apps/shield/web/          # Vite PWA
apps/shield/web/public/sw.js
```

## Prove commands

```bash
cd /workspace/bizmate
npm run test -w @bizmate/shield
npm run demo -w @bizmate/shield -- --once
npm run demo:shield
npm run build -w @bizmate/shield   # tsc + vite PWA
```

| Command | EXIT | Notes |
|---------|------|-------|
| `npm run test -w @bizmate/shield` | **0** | 24/24 (engine 20 + notify/detector 4) |
| `npm run demo -w @bizmate/shield -- --once` | **0** | allow=1 flag=2 block=3 + BILLING honesty |
| `npm run demo:shield` | **0** | full RESET REPLAY |
| `npm run build -w @bizmate/shield` | **0** | tsc dist/ + vite `web/dist/` |

Evidence: `docs/review/runs/shield-stack-d751cef.txt`

## Honesty banners (UI + CLI)

- `detector: fixture` / `deepfakeScore=fixture` / not live ML
- Care checkout: `@bizmate/billing` `honestyBanner` — SANDBOX / not live payment
- Notifications: `honesty: local-sw-stub` — SW / Notification API only (not remote push)

## PWA how-to

```bash
npm run dev -w @bizmate/shield       # :5174
npm run build -w @bizmate/shield && npm run preview -w @bizmate/shield
```

## Docs touched

- `apps/shield/README.md` — Expo vs PWA rationale
- `docs/review/SHIELD-BUSINESS.md` — stack note
- `docs/review/runbooks/shield.md` — PWA + CLI paths
- `docs/review/STACK-REBUILD.md` — Shield row Done + SHA
