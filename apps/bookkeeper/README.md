# Bookkeeper — sổ hộ kinh doanh (offline)

Persona: **Bà Lan — sạp vải chợ An Đông**. Parse utterance = **regex stub** (offline, chưa ASR) → đề xuất ghi sổ → **human Duyệt** → YTD; cảnh báo vượt ngưỡng miễn thuế **1 tỷ** (rule engine, không LLM).

## Buyer + pricing (hypothesis)

| | Giả thuyết (chưa đo) |
|--|--|
| **Buyer** | Hộ kinh doanh chợ / SME VN cần kê khai sau bỏ thuế khoán |
| **Pricing** | Freemium nhật ký bán; trả phí khi gần ngưỡng 1 tỷ hoặc cần xuất hóa đơn / kê khai |
| **Soft paywall** | Khi `crossedThreshold`: copy **Pro kê khai** (fixture) — không billing live |
| **Không claim** | Không có ARPU / conversion thật — chỉ hypothesis GTM |

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

### Mobile one-screen (offline demo)

Mở `apps/bookkeeper/ui/index.html` (trình duyệt / điện thoại) hoặc:

```bash
npx serve apps/bookkeeper/ui
```

UI: **Sạp An Đông · YTD · Từ chối / Duyệt · cảnh báo 1B** + Pro kê khai soft paywall.  
Banner: *Demo offline — không kết nối cơ quan thuế*.

### Fixtures

- `fixtures/vendor-an-dong.json` — seed utterances (gồm “hôm nay không bán”)
- `fixtures/e-invoice-sample.json` — HĐ điện tử offline + citation đoạn/excerpt
- `fixtures/pro-ke-khai-upsell.json` — soft paywall copy (no billing)

Money: `packages/core/src/money.ts`. Schema: `packages/contracts/schemas/ledger-proposal.v0.1.schema.json`.
