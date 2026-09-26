import { describe, expect, it } from "vitest";
import { createProposal } from "@bizmate/core";
import {
  assertValid,
  validateLedgerProposal,
  type LedgerProposal,
} from "@bizmate/contracts";
import {
  commitApproved,
  createVendorState,
  fingerprintLedgerPayload,
  ingestUtterance,
  verifyLedgerProposal,
} from "../agent.js";
import { runDemoOnce } from "../demo.js";
import { parseUtterance } from "../parse-utterance.js";
import { proposeLedgerEntry } from "../rules.js";

function goodPayload(overrides: Partial<LedgerProposal> = {}): LedgerProposal {
  return {
    id: "u-test",
    items: [{ description: "áo", qty: 1, unitPriceVnd: 250_000 }],
    totalVnd: 250_000,
    ytdBefore: 980_000_000,
    ytdAfter: 980_250_000,
    remainingExemptionVnd: 19_750_000,
    crossedThreshold: false,
    citations: ["ND-141-2026"],
    status: "proposed",
    ...overrides,
  };
}

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
    const state0 = createVendorState("v1", 980_000_000);
    const { proposal, state: stateAfterIngest } = ingestUtterance(
      state0,
      "u1",
      "bán 1 áo, 25000 nghìn",
      ["ND-141-2026"]
    );
    expect(proposal.status).toBe("verified");
    expect(proposal.payload.crossedThreshold).toBe(true);
    const state1 = commitApproved(stateAfterIngest, proposal);
    expect(state1.ytdRevenueVnd).toBe(1_005_000_000);
    expect(state1.ledger).toHaveLength(1);
    expect(state1.ledger[0]?.status).toBe("approved");
  });

  it("refuses to persist a draft proposal", () => {
    const state0 = createVendorState("v1", 100_000);
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

  it("Ajv validateLedgerProposal accepts good / rejects bad", () => {
    const good = goodPayload();
    expect(validateLedgerProposal(good)).toBe(true);
    expect(assertValid(validateLedgerProposal, good, "ledger-proposal")).toEqual(
      good
    );

    const badMissing = { id: "x" };
    expect(validateLedgerProposal(badMissing)).toBe(false);

    const badStatus = goodPayload({ status: "draft" as unknown as "proposed" });
    expect(validateLedgerProposal(badStatus)).toBe(false);

    const badEmptyItems = goodPayload({ items: [] });
    expect(validateLedgerProposal(badEmptyItems)).toBe(false);
  });

  it("idempotent verify: same id+payload is no-op; different payload rejects", () => {
    let state = createVendorState("v1", 980_000_000);
    const entry = proposeLedgerEntry(
      "idem-1",
      [{ description: "áo", qty: 1, unitPriceVnd: 100_000 }],
      980_000_000,
      ["ND-141-2026"]
    );
    const draft = createProposal("idem-1", entry, "mate");
    const first = verifyLedgerProposal(state, draft);
    expect(first.proposal.status).toBe("verified");
    state = first.state;
    expect(state.verifiedFingerprints["idem-1"]).toBe(
      fingerprintLedgerPayload(entry)
    );

    // same payload again → no-op success
    const again = verifyLedgerProposal(state, createProposal("idem-1", entry, "mate"));
    expect(again.proposal.status).toBe("verified");

    // different payload same id → reject
    const other = proposeLedgerEntry(
      "idem-1",
      [{ description: "áo", qty: 2, unitPriceVnd: 100_000 }],
      980_000_000,
      ["ND-141-2026"]
    );
    const conflict = verifyLedgerProposal(
      state,
      createProposal("idem-1", other, "mate")
    );
    expect(conflict.proposal.status).toBe("rejected");
    expect(conflict.proposal.verificationErrors.join(" ")).toMatch(/Idempotency/i);
  });

  it("ingest rejects invalid Ajv payload before verify", () => {
    const state = createVendorState("v1", 100_000);
    // Force a bad payload through verifyLedgerProposal
    const bad = createProposal(
      "bad-1",
      {
        id: "bad-1",
        items: [],
        totalVnd: 0,
        ytdBefore: 100_000,
        ytdAfter: 100_000,
        remainingExemptionVnd: 900_000_000,
        crossedThreshold: false,
        citations: [],
        status: "proposed" as const,
      },
      "mate"
    );
    const { proposal } = verifyLedgerProposal(state, bad);
    expect(proposal.status).toBe("rejected");
    expect(proposal.verificationErrors.length).toBeGreaterThan(0);
  });

  it("runDemoOnce lifecycle: HITL refuse, approve, YTD crosses 1B", () => {
    const captured: string[] = [];
    const result = runDemoOnce({
      reset: true,
      log: (line) => captured.push(line),
    });

    expect(result.crossedThreshold).toBe(true);
    expect(result.finalYtd).toBeGreaterThanOrEqual(1_000_000_000);
    expect(result.state.ledger.length).toBe(3);

    const text = captured.join("\n");
    expect(text).toMatch(/↺ Reset seed/);
    expect(text).toMatch(/Bà Lan/);
    expect(text).toMatch(/Từ chối ghi sổ khi chưa Duyệt/);
    expect(text).toMatch(/Người duyệt: Bà Lan → Duyệt/);
    expect(text).toMatch(/Đã duyệt/);
    expect(text).toMatch(/CẢNH BÁO|vượt ngưỡng|1 tỷ/i);
    expect(text).toMatch(/Căn cứ:/);
    // no raw JSON wall of full proposal objects
    expect(text).not.toMatch(/"ytdBefore":/);
    expect(text).not.toMatch(/"crossedThreshold":/);
  });
});
