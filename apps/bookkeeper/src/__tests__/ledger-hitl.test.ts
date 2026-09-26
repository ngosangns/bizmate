import { afterEach, describe, expect, it } from "vitest";
import { createCheckout, honestyBanner, stubCharge } from "@bizmate/billing";
import { openLedgerDb } from "../lib/ledger-db.js";
import {
  approvePending,
  bindTestLedger,
  clearUiSingleton,
  getMemoryAudit,
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

    screen = refusePending("sai số tiền");
    expect(screen.pending).toBeNull();
    expect(screen.ytdRevenueVnd).toBe(ytdBefore);
    expect(screen.lastStatus).toMatch(/Từ chối/i);
    expect(screen.lastRejectReason).toBe("sai số tiền");
    const auditRow = db
      .listAudit()
      .find((e) => e.type === "approve_rejected");
    expect(auditRow?.detail).toMatch(/Human Từ chối: sai số tiền — chưa ghi sổ/);
    expect(getMemoryAudit().some((e) => /sai số tiền/.test(e.detail))).toBe(
      true
    );

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

  it("refuse stores lastRejectReason and requires reason in audit detail", () => {
    const db = openLedgerDb({ dbPath: ":memory:", reset: true });
    bindTestLedger(db);
    resetUiSession();

    let screen = proposeUtterance("sáng nay bán 3 áo, mỗi cái 250 nghìn");
    expect(screen.pending).not.toBeNull();
    expect(screen.lastRejectReason).toBeNull();

    screen = refusePending("  nhầm mặt hàng  ");
    expect(screen.pending).toBeNull();
    expect(screen.lastRejectReason).toBe("nhầm mặt hàng");
    expect(screen.lastStatus).toMatch(/nhầm mặt hàng/);
    expect(
      db.listAudit().some(
        (e) =>
          e.type === "approve_rejected" &&
          e.detail === "Human Từ chối: nhầm mặt hàng — chưa ghi sổ"
      )
    ).toBe(true);

    // re-propose clears reject reason
    screen = proposeUtterance("sáng nay bán 3 áo, mỗi cái 250 nghìn");
    expect(screen.lastRejectReason).toBeNull();
    expect(screen.crossedThresholdPending).toBe(false);
  });

  it("propose crossing 1B sets threshold note in lastStatus", () => {
    const db = openLedgerDb({ dbPath: ":memory:", reset: true });
    bindTestLedger(db);
    const screen = proposeUtterance(
      "cuối ngày bán 1 lô áo đặc biệt, 25000 nghìn"
    );
    expect(screen.crossedThresholdPending).toBe(true);
    expect(screen.lastStatus).toMatch(/VƯỢT NGƯỠNG 1 TỶ/);
  });

  it("reset seed is deterministic across two mutations", () => {
    const db = openLedgerDb({ dbPath: ":memory:", reset: true });
    bindTestLedger(db);
    const seedYtd = db.seed.ytdRevenueVnd;

    let a = resetUiSession();
    expect(a.ytdRevenueVnd).toBe(seedYtd);
    expect(a.ledgerCount).toBe(0);
    expect(a.pending).toBeNull();
    expect(a.lastRejectReason).toBeNull();
    expect(a.postOneBLocked).toBe(false);
    expect(a.proSandboxOpened).toBe(false);
    expect(a.lastStatus).toMatch(/RESET.*980/);

    // mutate: propose + approve crossing sale
    a = proposeUtterance("cuối ngày bán 1 lô áo đặc biệt, 25000 nghìn");
    a = approvePending();
    expect(a.ytdRevenueVnd).toBeGreaterThanOrEqual(1_000_000_000);
    expect(a.postOneBLocked).toBe(true);

    const r1 = resetUiSession();
    expect(r1.ytdRevenueVnd).toBe(seedYtd);
    expect(r1.ledgerCount).toBe(0);
    expect(r1.pending).toBeNull();
    expect(r1.lastRejectReason).toBeNull();
    expect(r1.postOneBLocked).toBe(false);
    expect(r1.proSandboxOpened).toBe(false);

    // mutate again differently then reset — must match r1 exactly on seed fields
    let b = proposeUtterance("sáng nay bán 3 áo, mỗi cái 250 nghìn");
    b = refusePending("demo");
    b = proposeUtterance("sáng nay bán 3 áo, mỗi cái 250 nghìn");
    b = approvePending();
    expect(b.ytdRevenueVnd).not.toBe(seedYtd);

    const r2 = resetUiSession();
    expect(r2.ytdRevenueVnd).toBe(r1.ytdRevenueVnd);
    expect(r2.ledgerCount).toBe(r1.ledgerCount);
    expect(r2.pending).toBeNull();
    expect(r2.ytdCrossedOneB).toBe(false);
    expect(r2.postOneBLocked).toBe(false);
    expect(r2.lastStatus).toMatch(/deterministic/i);
  });

  it("post-1B lock gates propose until Pro sandbox; copy explains why", () => {
    const db = openLedgerDb({ dbPath: ":memory:", reset: true });
    bindTestLedger(db);
    resetUiSession();

    let screen = proposeUtterance(
      "cuối ngày bán 1 lô áo đặc biệt, 25000 nghìn"
    );
    expect(screen.crossedThresholdPending).toBe(true);
    expect(screen.postOneBLocked).toBe(false);

    screen = approvePending();
    expect(screen.ytdCrossedOneB).toBe(true);
    expect(screen.postOneBLocked).toBe(true);
    expect(screen.proSandboxOpened).toBe(false);

    const locked = proposeUtterance("sáng nay bán 3 áo, mỗi cái 250 nghìn");
    expect(locked.pending).toBeNull();
    expect(locked.postOneBLocked).toBe(true);
    expect(locked.lastStatus).toMatch(/KHÓA sau 1B/i);

    const { screen: unlocked } = openProSandbox();
    expect(unlocked.proSandboxOpened).toBe(true);
    expect(unlocked.postOneBLocked).toBe(false);
    expect(unlocked.lastStatus).toMatch(/unlocked|Pro sandbox/i);

    const after = proposeUtterance("sáng nay bán 3 áo, mỗi cái 250 nghìn");
    expect(after.pending).not.toBeNull();
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
