# Bookkeeper — sổ hộ kinh doanh (offline)

Persona: **Bà Lan — sạp vải chợ An Đông**. Voice stub → đề xuất ghi sổ → **human Duyệt** → YTD; cảnh báo vượt ngưỡng miễn thuế **1 tỷ** (rule engine, không LLM).

## Buyer + pricing (hypothesis)

| | Giả thuyết (chưa đo) |
|--|--|
| **Buyer** | Hộ kinh doanh chợ / SME VN cần kê khai sau bỏ thuế khoán |
| **Pricing** | Freemium nhật ký bán; trả phí khi gần ngưỡng 1 tỷ hoặc cần xuất hóa đơn / kê khai |
| **Không claim** | Không có ARPU / conversion thật — chỉ hypothesis GTM |

## Run

```bash
npm run demo:bookkeeper
npm run demo:bookkeeper -- --reset   # ↺ seed YTD 980tr
npm test -w @bizmate/bookkeeper
```

Money: `packages/core/src/money.ts`. Schema: `packages/contracts/schemas/ledger-proposal.v0.1.schema.json`.
