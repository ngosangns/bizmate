import {
  assertNonNegativeVnd,
  crossesExemption,
  remainingExemption,
  sumVnd,
  type Vnd,
} from "@bizmate/core";
import type { LineItem } from "./parse-utterance.js";

export interface LedgerEntry {
  id: string;
  items: LineItem[];
  totalVnd: Vnd;
  ytdBefore: Vnd;
  ytdAfter: Vnd;
  remainingExemptionVnd: Vnd;
  crossedThreshold: boolean;
  citations: string[];
  status: "proposed" | "approved" | "rejected";
}

export function proposeLedgerEntry(
  id: string,
  items: LineItem[],
  ytdBefore: Vnd,
  citationIds: string[]
): LedgerEntry {
  const totals = items.map((i) => {
    assertNonNegativeVnd(i.unitPriceVnd);
    assertNonNegativeVnd(i.qty);
    return i.qty * i.unitPriceVnd;
  });
  const totalVnd = sumVnd(totals);
  const ytdAfter = ytdBefore + totalVnd;
  return {
    id,
    items,
    totalVnd,
    ytdBefore,
    ytdAfter,
    remainingExemptionVnd: remainingExemption(ytdAfter),
    crossedThreshold: crossesExemption(ytdBefore, totalVnd),
    citations: citationIds,
    status: "proposed",
  };
}

export function approveEntry(entry: LedgerEntry): LedgerEntry {
  return { ...entry, status: "approved" };
}

export function answerTaxQuestion(
  question: string,
  docs: { id: string; title: string; excerpt: string }[],
  ytd: Vnd
): { answer: string; citations: string[] } {
  const rem = remainingExemption(ytd);
  const cites = docs.map((d) => d.id);
  if (/miễn thuế|ngưỡng|1 tỷ|một tỷ/i.test(question)) {
    return {
      answer: `Doanh thu YTD ${ytd.toLocaleString("vi-VN")}₫. Còn lại ${rem.toLocaleString("vi-VN")}₫ trước ngưỡng miễn thuế 1 tỷ (demo). Số liệu tính bằng rule engine, không phải LLM.`,
      citations: cites,
    };
  }
  return {
    answer:
      "Tôi chỉ trả lời câu hỏi thuế có citation văn bản demo. Hãy hỏi về ngưỡng miễn thuế hoặc hóa đơn.",
    citations: cites.slice(0, 1),
  };
}
