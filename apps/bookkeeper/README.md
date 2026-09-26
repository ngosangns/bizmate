# Bookkeeper — sổ hộ kinh doanh (offline)

Persona: **Bà Lan — sạp vải chợ An Đông**. Parse utterance = **regex stub** (offline, chưa ASR) → đề xuất ghi sổ → **human Duyệt** → YTD; cảnh báo vượt ngưỡng miễn thuế **1 tỷ** (rule engine, không LLM).

## Buyer + Free / Pro tiers

| | |
|--|--|
| **Who pays** | Tiểu thương / Bà Lan (freemium→Pro near 1B). **Không** phải cơ quan thuế. |
| **Free** (`bookkeeper-free`) | Nhật ký bán + YTD + cảnh báo ngưỡng 1B + citations — **0₫/tháng** (fixture) |
| **Pro kê khai** (`bookkeeper-pro`) | Free + hỗ trợ kê khai / e-invoice assist — **99.000₫/tháng** *(hypothesis — chưa đo ARPU)* |
| **Payment** | `@bizmate/billing` sandbox/stub (`offline_stub` / `stripe_test`) — **never live** |
| **Không claim** | Không ARPU / conversion / ARR thật |

Chi tiết: `docs/review/BOOKKEEPER-BUSINESS.md`.

## Week-2 distribution (ONE channel)

**Nhóm tiểu thương chợ An Đông** — trust láng giềng, CAC thấp, khớp persona Bà Lan.  
Không pilot đại lý thuế / Shopee Seller Academy trong week-2 này.

## Run

```bash
npm run demo:bookkeeper
npm run demo:bookkeeper -- --reset   # ↺ seed YTD 980tr
npm test -w @bizmate/bookkeeper
npm run demo:ui -w @bizmate/bookkeeper   # prints path to mobile UI
```

Demo on `crossedThreshold` prints honesty banner + `stubCharge` / `createCheckout(stripe_test)` session (labeled sandbox).

### Mobile one-screen (offline demo)

Mở `apps/bookkeeper/ui/index.html` hoặc:

```bash
npx serve apps/bookkeeper/ui
```

UI: **Sạp An Đông · YTD · Từ chối / Duyệt · cảnh báo 1B** + Free/Pro pricing card + **Mở Pro (sandbox)**.  
Banner: *Demo offline — không kết nối cơ quan thuế · billing sandbox/stub only*.

### Fixtures

- `fixtures/vendor-an-dong.json` — seed utterances (gồm “hôm nay không bán”)
- `fixtures/e-invoice-sample.json` — HĐ điện tử offline + citation đoạn/excerpt
- `fixtures/pro-ke-khai-upsell.json` — Free/Pro tiers + `planId` + price hypothesis

Money: `packages/core/src/money.ts`. Billing: `packages/billing`. Schema: `packages/contracts/schemas/ledger-proposal.v0.1.schema.json`.
