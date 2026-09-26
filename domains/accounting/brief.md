# Accounting / Kế toán SME

**EN — Intent:** Deterministic SME bookkeeping for Vietnamese household businesses (hộ kinh doanh). Mate generates a voucher workflow: intake document → classify accounts/tax codes → compute VND amounts & VAT → **human approve** → persist journal entry. Amounts are always non-negative; tax math is code, never LLM.

**VN — Mục tiêu:** Workflow kế toán deterministic cho hộ kinh doanh VN. Mate sinh quy trình chứng từ: tiếp nhận → phân loại tài khoản/mã thuế → tính số tiền & VAT → **người duyệt** → ghi sổ. Số tiền không âm; tính thuế bằng code, không dùng LLM.

## Constraints / Ràng buộc
- `amount >= 0`, `vat >= 0`
- Human approve **before** persist (HITL gate)
- Offline fixtures must run without API keys
- Optional: flag when YTD revenue crosses VN exemption threshold

## Desired steps
`intake → classify → compute → approve → persist`
