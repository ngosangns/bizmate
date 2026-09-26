# Shield — BUSINESS-READY (BR1–BR3)

> Adv · Shield · 2026-09-26 Asia/Saigon  
> Matrix: `docs/review/BUSINESS-READY.md`  
> Billing: consume `@bizmate/billing` (sandbox/stub only — **never live payment**).

## BR1 — Business model

| Lens | Demo-derived fact |
|------|-------------------|
| **Who pays (buyer)** | **Family B2C** — con/cháu trả subscription bảo vệ ba/mẹ (child pays). |
| **Sea role** | **Distribution wedge only** (Shopee Buyer Protection surface for fake QR hoàn tiền / phishing adjacent). **Not** the payer. No live SPX claim. |
| **Value prop** | 30s backup: rule-based inbox shield before elder taps link / transfers money; family alert + human override. Risk engine stays rule-based; billing is packaging only. |
| **Unit economics** | **Fixture / demo only** — no invented live ARR/ARPU. |

### Unit economics sketch (demo-derived)

| Input | Source | Value |
|-------|--------|-------|
| Plan prices | `@bizmate/billing` `listPlans("shield")` + `apps/shield/fixtures/family-plans.json` | Free **0₫** · Family Care **99.000₫/mo** · Family Plus **199.000₫/mo** |
| Demo subscribe count | One CTA in `npm run demo:shield` (Family Care) | **1** sandbox session / demo run |
| Live ARR / ARPU / paid seats | — | **Not claimed** |

Pitch one-liner: *Child pays · elders protected · Sea distributes (not pays) · sandbox checkout labeled.*

## BR2 — Subscription / pricing

Family monthly plans via `listPlans("shield")`:

| Plan id | Name | Price (fixture) | Entitlement |
|---------|------|-----------------|-------------|
| `shield-free` | Free | 0₫/mo | 1 elder |
| `shield-family-care` | Family Care | 99.000₫/mo | 2 elders + SMS alert |
| `shield-family-plus` | Family Plus | 199.000₫/mo | 4 elders + priority |

Reflected in:

- `packages/billing` plan fixtures (`listPlans("shield")`)
- `apps/shield/fixtures/family-plans.json`
- Demo pricing table (`src/demo.ts` BILLING section)

## BR3 — Payment path

- Dependency: `"@bizmate/billing": "0.1.0"`
- Demo CTA: `createCheckout({ appId: "shield", planId: "shield-family-care", mode: "stripe_test" })` (or `offline_stub`)
- **Always** print `result.honestyBanner` / `honestyBanner(mode)` next to CTA
- Optional: `npm run demo:shield -- --subscribe` forces explicit subscribe print; default demo always ends with a short BILLING section
- Modes: `stripe_test` \| `vn_sandbox` \| `offline_stub` — never claim live payment

## Prove

```bash
cd /workspace/bizmate
npm run build -w @bizmate/billing
npm run test -w @bizmate/billing
npm run test -w @bizmate/shield
npm run demo:shield
npm run demo -w @bizmate/shield -- --subscribe --once
```

Expect: all EXIT 0; pricing table + honesty banner visible; no live ARR claims.

## Out of scope

- Live Stripe / VN pay / real card charge
- Seller KPI framing / Sea-as-payer pitch
- Changing risk engine (stays rule-based)


## Stack (STACK-REBUILD)

**Chosen: PWA + Service Worker (+ Vite)** — not Expo.

- Rule engine stays pure TS (`src/engine.ts` / `blacklist.ts`) shared by CLI `demo` and PWA UI.
- Local notifications via SW / Notification API (`honesty: local-sw-stub`) — not remote push.
- Optional on-device ML = `detector-stub.ts` labeled **fixture**.
- Why not Expo: monorepo must prove `demo` + `test` EXIT 0 in Node/CI without Expo Go/simulator.
- Prove packet: [`SHIELD-STACK.md`](./SHIELD-STACK.md) · matrix: [`STACK-REBUILD.md`](./STACK-REBUILD.md).
