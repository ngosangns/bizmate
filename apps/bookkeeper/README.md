# Bookkeeper — sổ hộ kinh doanh (STACK-REBUILD)

Persona: **Bà Lan — sạp vải chợ An Đông**. Parse utterance = **regex stub** (offline, chưa ASR) → đề xuất ghi sổ → **human Duyệt** (server actions) → SQLite ledger YTD; cảnh báo vượt ngưỡng miễn thuế **1 tỷ** (rule engine `@bizmate/core`, không LLM).

## Stack chosen (STACK-REBUILD)

| Layer | Choice | Why |
|-------|--------|-----|
| UI | **Next.js App Router** | Domain-fit one-screen HITL for tiểu thương |
| API | **Route Handlers + Server Actions** (not tRPC) | Less workspace friction; HITL `Duyệt` / `Từ chối` as server actions |
| Ledger | **better-sqlite3** (not Prisma) | Offline-first demo, zero migrate toolchain, sync CLI + Next |
| Voice→ledger | Regex stub (labeled offline) | Keep prior behavior judges PASS'd |

Shared (non-negotiable): `@bizmate/contracts` (Ajv ledger-proposal) · `@bizmate/billing` (honestyBanner / createCheckout / stubCharge / planIds) · `@bizmate/core` money helpers.

## Buyer + Free / Pro tiers

| | |
|--|--|
| **Who pays** | Tiểu thương / Bà Lan (freemium→Pro near 1B). **Không** phải cơ quan thuế. |
| **Free** (`bookkeeper-free`) | Nhật ký bán + YTD + cảnh báo ngưỡng 1B + citations — **0₫/tháng** (fixture) |
| **Pro kê khai** (`bookkeeper-pro`) | Free + hỗ trợ kê khai / e-invoice assist — **99.000₫/tháng** *(hypothesis — chưa đo ARPU)* |
| **Payment** | `@bizmate/billing` sandbox/stub (`offline_stub` / `stripe_test`) — **never live** |

Chi tiết: `docs/review/BOOKKEEPER-BUSINESS.md`.

## Run

```bash
# After pull / workspace changes:
npm run build -w @bizmate/contracts
npm run build -w @bizmate/billing
# (+ core if money helpers changed)

npm run demo:bookkeeper
npm run demo:bookkeeper -- --reset   # ↺ seed YTD 980tr + wipe SQLite
npm test -w @bizmate/bookkeeper
npm run dev -w @bizmate/bookkeeper   # Next UI http://localhost:3010
npm run demo:ui -w @bizmate/bookkeeper
npm run build -w @bizmate/bookkeeper # optional Next build
```

SQLite file: `apps/bookkeeper/data/bookkeeper.db` (gitignored; seeded on `--reset` / first open).

Demo on `crossedThreshold` prints honesty banner + `stubCharge` / `createCheckout(stripe_test)` (labeled sandbox).

### Static offline fallback

`ui/index.html` remains as a zero-server HITL mock. Prefer Next UI for SQLite-backed HITL.

### Fixtures

- `fixtures/vendor-an-dong.json` — seed utterances (gồm “hôm nay không bán”)
- `fixtures/e-invoice-sample.json` — HĐ điện tử offline + citation đoạn/excerpt
- `fixtures/pro-ke-khai-upsell.json` — Free/Pro tiers + `planId` + price hypothesis

### Layout

```
apps/bookkeeper/
  src/lib/     domain: agent · rules · parse · audit · metrics · ledger-db · demo · session
  src/actions/ HITL server actions (Duyệt / Từ chối / Pro sandbox)
  src/app/     Next.js App Router UI + /api/health
  data/        SQLite ledger (gitignored *.db)
  fixtures/    offline seeds
```
