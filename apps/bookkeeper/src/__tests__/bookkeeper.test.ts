import { describe, expect, it } from "vitest";
import { parseUtterance } from "../parse-utterance.js";
import { proposeLedgerEntry } from "../rules.js";

describe("bookkeeper", () => {
  it("parses Vietnamese sale utterance", () => {
    const items = parseUtterance("sáng nay bán 3 áo, mỗi cái 250 nghìn");
    expect(items[0]?.qty).toBe(3);
    expect(items[0]?.unitPriceVnd).toBe(250_000);
  });

  it("flags crossing 1B threshold", () => {
    const entry = proposeLedgerEntry(
      "t1",
      [{ description: "áo", qty: 1, unitPriceVnd: 30_000_000 }],
      980_000_000,
      ["ND-141-2026"]
    );
    expect(entry.crossedThreshold).toBe(true);
    expect(entry.totalVnd).toBe(30_000_000);
  });
});
