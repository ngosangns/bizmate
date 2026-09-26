/** Offline NL stub: parse simple Vietnamese sale utterances into line items. */

export interface LineItem {
  description: string;
  qty: number;
  unitPriceVnd: number;
}

const MONEY = /(\d+)\s*(nghìn|ngàn|k)/i;
const QTY = /(\d+)\s*(áo|mét|cai|cái|sp|sản phẩm)?/i;

/** Empty / no-sale day — e.g. “hôm nay không bán”. */
export function isNoSaleUtterance(text: string): boolean {
  return /không\s*bán|chẳng\s*bán|không\s*có\s*bán|hôm nay nghỉ|zero\s*sale/i.test(
    text
  );
}

/** Correction / “sửa sai” intent (demo: triggers re-ingest conflict path). */
export function isCorrectionUtterance(text: string): boolean {
  return /sửa\s*sai|sửa\s*lại|đổi\s*lại|nhầm/i.test(text);
}

export function parseUtterance(text: string): LineItem[] {
  const lower = text.toLowerCase();
  if (isNoSaleUtterance(lower)) return [];

  const qtyMatch = lower.match(QTY);
  const moneyMatch = lower.match(MONEY);
  const qty = qtyMatch ? Number(qtyMatch[1]) : 1;
  let unit = 0;
  if (moneyMatch) {
    unit = Number(moneyMatch[1]) * 1000;
  }
  const desc = lower.includes("vải")
    ? "vải"
    : lower.includes("áo")
      ? "áo"
      : "hàng";
  if (unit <= 0) return [];
  return [{ description: desc, qty, unitPriceVnd: unit }];
}
