/** Offline NL stub: parse simple Vietnamese sale utterances into line items. */

export interface LineItem {
  description: string;
  qty: number;
  unitPriceVnd: number;
}

const MONEY = /(\d+)\s*(nghìn|ngàn|k)/i;
const QTY = /(\d+)\s*(áo|mét|cai|cái|sp|sản phẩm)?/i;

export function parseUtterance(text: string): LineItem[] {
  const lower = text.toLowerCase();
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
