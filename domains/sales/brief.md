# Sales / Pipeline bán hàng SME

**EN — Intent:** Simple sales pipeline for SME quotes and deals. Mate generates: intake lead/order → classify stage & priority → emit quote/notification → **human approve** → persist opportunity. Deal amounts non-negative; discount caps are rule-enforced.

**VN — Mục tiêu:** Pipeline bán hàng đơn giản cho SME. Mate sinh: tiếp nhận lead/đơn → phân loại giai đoạn & ưu tiên → phát hành báo giá/thông báo → **người duyệt** → lưu cơ hội. Giá trị deal không âm; trần giảm giá do rule kiểm soát.

## Constraints / Ràng buộc
- `dealAmount >= 0`
- Human approve before persist
- Optional discount cap (e.g. ≤ 20%)
- Offline demo without network

## Desired steps
`intake → classify → emit → approve → persist`
