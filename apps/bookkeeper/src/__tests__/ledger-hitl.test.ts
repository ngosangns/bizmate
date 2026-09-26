import { afterEach, describe, expect, it } from "vitest";
import { createCheckout, honestyBanner, stubCharge } from "@bizmate/billing";
import { openLedgerDb } from "../lib/ledger-db.js";
import {
  approvePending,
  bindTestLedger,
  clearUiSingleton,
  getScreenState,
  openProSandbox,
  proposeUtterance,
  refusePending,
  resetUiSession,
} from "../lib/session.js";
import {
  commitApproved,
  createVendorState,
  ingestUtterance,
} from "../lib/agent.js";

afterEach(() => {
  clearUiSingleton();
});

describe("SQLite ledger", () => {
  it("seeds, persists approve, and reloads YTD", () => {
    const db = openLedgerDb({ dbPath: ":memory:", reset: true });
    expect(db.seed.ytdRevenueVnd).toBe(980_000_000);
    let state = db.loadState();
    expect(state.ytdRevenueVnd).toBe(980_000_000);

    const ingested = ingestUtterance(
      state,
      "sql-1",
      "bán 1 áo, 250 nghìn",
      ["ND-141-2026"]
    );
    state = ingested.state;
    expect(ingested.proposal.status).toBe("verified");
    state = commitApproved(state, ingested.proposal);
    db.saveState(state);
    db.appendAudit({
      type: "approve_committed",
      utteranceId: "sql-1",
      detail: "test",
      ytdVnd: state.ytdRevenueVnd,
    });

    const reloaded = db.loadState();
    expect(reloaded.ytdRevenueVnd).toBe(980_250_000);
    expect(reloaded.ledger).toHaveLength(1);
    expect(db.listAudit().some((e) => e.type === "approve_committed")).toBe(
      true
    );
    db.close();
  });

  it("reset restores fixture YTD", () => {
    const db = openLedgerDb({ dbPath: ":memory:", reset: true });
    let state = db.loadState();
    state = { ...state, ytdRevenueVnd: 1_006_110_000, ledger: [] };
    db.saveState(state);
    db.reset();
    expect(db.loadState().ytdRevenueVnd).toBe(980_000_000);
    db.close();
  });
});

describe("HITL session (server-action lib)", () => {
  it("refuse-before-approve does not bump YTD; approve persists", () => {
    const db = openLedgerDb({ dbPath: ":memory:", reset: true });
    bindTestLedger(db);
    resetUiSession();

    let screen = proposeUtterance("sáng nay bán 3 áo, mỗi cái 250 nghìn");
    expect(screen.pending).not.toBeNull();
    expect(screen.pending?.proposal.status).toBe("verified");
    const ytdBefore = screen.ytdRevenueVnd;

    screen = refusePending();
    expect(screen.pending).toBeNull();
    expect(screen.ytdRevenueVnd).toBe(ytdBefore);
    expect(screen.lastStatus).toMatch(/Từ chối/i);

    screen = proposeUtterance("sáng nay bán 3 áo, mỗi cái 250 nghìn");
    screen = approvePending();
    expect(screen.pending).toBeNull();
    expect(screen.ytdRevenueVnd).toBe(ytdBefore + 750_000);
    expect(screen.ledgerCount).toBe(1);
    expect(screen.lastStatus).toMatch(/Duyệt/i);
  });

  it("threshold utterance sets crossedThresholdPending + soft paywall path honesty", () => {
    const db = openLedgerDb({ dbPath: ":memory:", reset: true });
    bindTestLedger(db);
    // seed near threshold already from fixture 980M — large sale crosses
    const screen = proposeUtterance("cuối ngày bán 1 lô áo đặc biệt, 25000 nghìn");
    expect(screen.crossedThresholdPending).toBe(true);
    expect(screen.pending?.proposal.payload.crossedThreshold).toBe(true);

    const { billingLines } = openProSandbox();
    const text = billingLines.join("\n");
    expect(text).toMatch(/STUB|stub|sandbox|SANDBOX/i);
    expect(text).toMatch(/bookkeeper-pro|NEVER live/i);
    expect(honestyBanner("offline_stub")).toMatch(/STUB|stub/i);
    const charge = stubCharge({
      appId: "bookkeeper",
      planId: "bookkeeper-pro",
      amountDisplay: "99.000 ₫",
    });
    expect(charge.mode).toBeTruthy();
    const checkout = createCheckout({
      appId: "bookkeeper",
      planId: "bookkeeper-pro",
      mode: "stripe_test",
    });
    expect(checkout.sessionId).toMatch(/cs_test_/);
  });

  it("getScreenState returns Bà Lan seed", () => {
    const db = openLedgerDb({ dbPath: ":memory:", reset: true });
    bindTestLedger(db);
    const s = getScreenState();
    expect(s.displayName).toMatch(/Bà Lan/);
    expect(s.planIds.free).toBe("bookkeeper-free");
    expect(s.planIds.pro).toBe("bookkeeper-pro");
  });
});

describe("in-memory vendor helper", () => {
  it("createVendorState still works without SQLite", () => {
    const s = createVendorState("v-x", 100);
    expect(s.ledger).toEqual([]);
  });
});
