/**
 * Deterministic accounting handler — money via @bizmate/core only, never LLM.
 */
import {
  assertNonNegativeVnd,
  crossesExemption,
  remainingExemption,
  sumVnd,
  type Vnd,
} from "@bizmate/core";

export interface SaleItem {
  qty: number;
  unitPriceVnd: Vnd;
  sku?: string;
}

/** Structured input from a sale voice-note (Mate/ASR already structured). */
export interface SaleVoiceInput {
  items: SaleItem[];
  ytdRevenueVnd: Vnd;
}

export interface LedgerEntry {
  id: string;
  saleTotalVnd: Vnd;
  ytdBeforeVnd: Vnd;
  ytdAfterVnd: Vnd;
  remainingExemptionVnd: Vnd;
  crossedExemption: boolean;
  items: SaleItem[];
  persisted: boolean;
}

export interface AccountingComputeResult {
  saleTotalVnd: Vnd;
  ytdBeforeVnd: Vnd;
  ytdAfterVnd: Vnd;
  remainingExemptionVnd: Vnd;
  crossedExemption: boolean;
  items: SaleItem[];
}

function lineTotal(item: SaleItem): Vnd {
  if (!Number.isInteger(item.qty) || item.qty <= 0) {
    throw new Error(`Invalid qty: ${item.qty}`);
  }
  const unit = assertNonNegativeVnd(item.unitPriceVnd);
  return unit * item.qty;
}

/** Pure compute: sum sales + exemption remaining / threshold crossing. */
export function computeSale(input: SaleVoiceInput): AccountingComputeResult {
  if (!input.items?.length) {
    throw new Error("Sale requires at least one item");
  }
  const lineTotals = input.items.map(lineTotal);
  const saleTotalVnd = sumVnd(lineTotals);
  const ytdBeforeVnd = assertNonNegativeVnd(input.ytdRevenueVnd);
  const ytdAfterVnd = ytdBeforeVnd + saleTotalVnd;
  return {
    saleTotalVnd,
    ytdBeforeVnd,
    ytdAfterVnd,
    remainingExemptionVnd: remainingExemption(ytdAfterVnd),
    crossedExemption: crossesExemption(ytdBeforeVnd, saleTotalVnd),
    items: input.items.map((i) => ({ ...i })),
  };
}

/**
 * Process sale → ledger entry + threshold status.
 * Requires `approved === true` before persist (HITL gate).
 */
export function processSale(
  input: SaleVoiceInput,
  approved: boolean,
  entryId = `ledger-${Date.now()}`
): LedgerEntry {
  const computed = computeSale(input);
  if (!approved) {
    return {
      id: entryId,
      ...computed,
      persisted: false,
    };
  }
  return {
    id: entryId,
    ...computed,
    persisted: true,
  };
}
