import { describe, expect, it } from "vitest";
import { createProposal } from "@bizmate/core";
import { commitApproved, ingestUtterance } from "../agent.js";
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

  it("persists only after verified human approve", () => {
    const state0 = {
      vendorId: "v1",
      ytdRevenueVnd: 980_000_000,
      ledger: [],
    };
    const { proposal } = ingestUtterance(
      state0,
      "u1",
      "bán 1 áo, 25000 nghìn",
      ["ND-141-2026"]
    );
    expect(proposal.status).toBe("verified");
    expect(proposal.payload.crossedThreshold).toBe(true);
    const state1 = commitApproved(state0, proposal);
    expect(state1.ytdRevenueVnd).toBe(1_005_000_000);
    expect(state1.ledger).toHaveLength(1);
    expect(state1.ledger[0]?.status).toBe("approved");
  });

  it("refuses to persist a draft proposal", () => {
    const state0 = {
      vendorId: "v1",
      ytdRevenueVnd: 100_000,
      ledger: [],
    };
    const draft = createProposal(
      "x",
      proposeLedgerEntry(
        "x",
        [{ description: "áo", qty: 1, unitPriceVnd: 1000 }],
        100_000,
        []
      ),
      "mate"
    );
    expect(() => commitApproved(state0, draft)).toThrow(/verified/i);
  });
});
