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
import {
  buildWeek2SeedMetrics,
  formatWeek2SeedMetricsBlock,
} from "../metrics.js";
import { isNoSaleUtterance, parseUtterance } from "../parse-utterance.js";
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

  it("parses no-sale day as empty items", () => {
    expect(isNoSaleUtterance("hôm nay không bán")).toBe(true);
    expect(parseUtterance("hôm nay không bán")).toEqual([]);
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

    const again = verifyLedgerProposal(state, createProposal("idem-1", entry, "mate"));
    expect(again.proposal.status).toBe("verified");

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

  it("buildWeek2SeedMetrics counts + remainingExemption", () => {
    const m = buildWeek2SeedMetrics({
      approveCount: 3,
      refuseBeforeDuyetCount: 3,
      thresholdWarningCount: 1,
      citationHits: 8,
      finalYtdVnd: 1_006_110_000,
    });
    expect(m.remainingExemptionVnd).toBe(0);
    expect(m.refuseBeforeDuyetCount).toBe(3);
    expect(m.citationHits).toBe(8);
    const block = formatWeek2SeedMetricsBlock(m).join("\n");
    expect(block).toMatch(/WEEK-2 METRICS/);
    expect(block).toMatch(/Từ chối-before-Duyệt/);
    expect(block).toMatch(/citation hits/);
    expect(block).toMatch(/remainingExemption|YTD gap to 1B/);
  });

  it("runDemoOnce lifecycle: HITL refuse, approve, YTD crosses 1B, metrics+audit", () => {
    const captured: string[] = [];
    const result = runDemoOnce({
      reset: true,
      log: (line) => captured.push(line),
    });

    expect(result.crossedThreshold).toBe(true);
    expect(result.finalYtd).toBeGreaterThanOrEqual(1_000_000_000);
    expect(result.state.ledger.length).toBe(3);

    expect(result.week2Metrics.approveCount).toBe(3);
    expect(result.week2Metrics.refuseBeforeDuyetCount).toBe(3);
    expect(result.week2Metrics.thresholdWarningCount).toBe(1);
    expect(result.week2Metrics.citationHits).toBeGreaterThan(0);
    expect(result.week2Metrics.remainingExemptionVnd).toBe(0);

    expect(result.audit.some((e) => e.type === "approve_rejected")).toBe(true);
    expect(result.audit.some((e) => e.type === "approve_committed")).toBe(true);
    expect(result.audit.some((e) => e.type === "idempotency_conflict")).toBe(
      true
    );

    const text = captured.join("\n");
    expect(text).toMatch(/↺ RESET \(top\)|↺ Reset seed/);
    expect(text).toMatch(/Bà Lan/);
    expect(text).toMatch(/TỪ CHỐI|Từ chối ghi sổ khi chưa Duyệt/);
    expect(text).toMatch(/DUYỆT|Người duyệt: Bà Lan → Duyệt/);
    expect(text).toMatch(/Đã duyệt/);
    expect(text).toMatch(/PAUSE|CẢNH BÁO|vượt ngưỡng|1 tỷ/i);
    expect(text).toMatch(/ĐỀ XUẤT|Đề xuất/);
    expect(text).toMatch(/Căn cứ:/);
    expect(text).toMatch(/WEEK-2 METRICS/);
    expect(text).toMatch(/Không bán hôm nay|no-op/i);
    expect(text).toMatch(/Idempotency|sửa sai/i);
    expect(text).toMatch(/Pro kê khai/);
    expect(text).toMatch(/HĐ điện tử|invoiceNumber|HD-DEMO/i);
    expect(text).toMatch(/Đoạn citation|excerpt/i);
    expect(text).toMatch(/approve_rejected/);
    expect(text).toMatch(/nhóm tiểu thương chợ An Đông/);
    expect(text).toMatch(/regex stub/i);
    expect(text).not.toMatch(/"ytdBefore":/);
    expect(text).not.toMatch(/"crossedThreshold":/);
  });
});
