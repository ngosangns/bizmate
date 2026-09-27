/**
 * Server-side session for Next HITL UI — one pending proposal + vendor state.
 * Backed by SQLite ledger (file under data/ or :memory: for tests).
 */
import {
  commitApproved,
  createVendorState,
  ingestUtterance,
  type VendorState,
} from "./agent.js";
import type { AiLedgerProposal } from "./ai-ledger-proposer.js";
import {
  appendAudit,
  createAuditLog,
  type AuditEvent,
} from "./audit.js";
import { openLedgerDb, type LedgerDb } from "./ledger-db.js";
import {
  isNoSaleUtterance,
  parseUtterance,
} from "./parse-utterance.js";
import type { Proposal } from "@bizmate/core";
import type { LedgerEntry } from "./rules.js";
import {
  createCheckout,
  honestyBanner,
  listPlans,
  stubCharge,
} from "@bizmate/billing";
import { remainingExemption } from "@bizmate/core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface PendingProposal {
  proposal: Proposal<LedgerEntry>;
  utteranceText: string;
  /** Honesty label from AiLedgerProposer (stub vs live fallback). */
  aiLabelVi: string;
  aiClassificationNote: string;
  aiMode: AiLedgerProposal["meta"]["mode"];
  aiFallbackUsed: boolean;
}

export interface ScreenState {
  vendorId: string;
  displayName: string;
  ytdRevenueVnd: number;
  remainingExemptionVnd: number;
  ledgerCount: number;
  pending: PendingProposal | null;
  lastStatus: string;
  crossedThresholdPending: boolean;
  /** Last human Từ chối reason (HITL audit) — shown after pending cleared. */
  lastRejectReason: string | null;
  /** YTD already >= 1B after a Duyệt. */
  ytdCrossedOneB: boolean;
  /** Pro sandbox opened this session (soft unlock for post-1B gate). */
  proSandboxOpened: boolean;
  /**
   * Kyle R5: post-1B lock — YTD crossed and Pro not opened.
   * Gated actions must show unavailable + why (not silent disable).
   */
  postOneBLocked: boolean;
  planIds: { free: string; pro: string };
  honestyOffline: string;
  citations: { id: string; title: string }[];
}

let _db: LedgerDb | null = null;
let _pending: PendingProposal | null = null;
let _lastStatus = "";
let _lastRejectReason: string | null = null;
let _proSandboxOpened = false;
let _memoryAudit: AuditEvent[] = createAuditLog();

function fixturePath(): string {
  return path.join(__dirname, "../../fixtures/vendor-an-dong.json");
}

function loadDocs(): { id: string; title: string }[] {
  const raw = JSON.parse(fs.readFileSync(fixturePath(), "utf8")) as {
    officialDocs: { id: string; title: string }[];
  };
  return raw.officialDocs.map((d) => ({ id: d.id, title: d.title }));
}

/** Singleton ledger for Next server actions (file DB). Tests pass explicit db. */
export function getUiLedger(reset = false): LedgerDb {
  if (!_db) {
    _db = openLedgerDb({ reset: false });
  }
  if (reset) {
    _db.reset();
    // Belt-and-suspenders: rewrite vendor row from fixture seed (deterministic).
    const seed = _db.seed;
    _db.saveState({
      vendorId: seed.vendorId,
      ytdRevenueVnd: seed.ytdRevenueVnd,
      ledger: [],
      verifiedFingerprints: {},
    });
    _pending = null;
    _lastRejectReason = null;
    _proSandboxOpened = false;
    _memoryAudit = createAuditLog();
    const ytd = seed.ytdRevenueVnd.toLocaleString("vi-VN");
    _lastStatus = `↺ RESET · seed YTD về ${ytd}₫ · ledger=0 (deterministic)`;
  }
  return _db;
}

export function resetUiSession(): ScreenState {
  const db = getUiLedger(true);
  const screen = toScreen(db);
  // Guarantee seed match every time (Son R5).
  if (
    screen.ytdRevenueVnd !== db.seed.ytdRevenueVnd ||
    screen.ledgerCount !== 0 ||
    screen.pending !== null
  ) {
    db.reset();
    db.saveState({
      vendorId: db.seed.vendorId,
      ytdRevenueVnd: db.seed.ytdRevenueVnd,
      ledger: [],
      verifiedFingerprints: {},
    });
    _pending = null;
    _lastRejectReason = null;
    _proSandboxOpened = false;
    const ytd = db.seed.ytdRevenueVnd.toLocaleString("vi-VN");
    _lastStatus = `↺ RESET · seed YTD về ${ytd}₫ · ledger=0 (deterministic)`;
    return toScreen(db);
  }
  return screen;
}

function toScreen(db: LedgerDb): ScreenState {
  const state = db.loadState();
  const pending = _pending;
  const ytdCrossedOneB = state.ytdRevenueVnd >= 1_000_000_000;
  const postOneBLocked = ytdCrossedOneB && !_proSandboxOpened;
  return {
    vendorId: state.vendorId,
    displayName: db.seed.displayName,
    ytdRevenueVnd: state.ytdRevenueVnd,
    remainingExemptionVnd: remainingExemption(state.ytdRevenueVnd),
    ledgerCount: state.ledger.length,
    pending,
    lastStatus: _lastStatus,
    crossedThresholdPending: pending?.proposal.payload.crossedThreshold ?? false,
    lastRejectReason: _lastRejectReason,
    ytdCrossedOneB,
    proSandboxOpened: _proSandboxOpened,
    postOneBLocked,
    planIds: { free: "bookkeeper-free", pro: "bookkeeper-pro" },
    honestyOffline: honestyBanner("offline_stub"),
    citations: loadDocs(),
  };
}

export function getScreenState(): ScreenState {
  const db = getUiLedger(false);
  return toScreen(db);
}

export function proposeUtterance(text: string): ScreenState {
  const db = getUiLedger(false);
  let state = db.loadState();
  const cites = loadDocs().map((d) => d.id);
  const utteranceId = `ui-${Date.now().toString(36)}`;
  _lastRejectReason = null;

  // Kyle R5: post-1B lock — further Free đề xuất unavailable until Pro sandbox
  if (state.ytdRevenueVnd >= 1_000_000_000 && !_proSandboxOpened) {
    _pending = null;
    _lastStatus =
      "🔒 KHÓA sau 1B — Đề xuất Free không khả dụng · cần mở Pro (sandbox) hoặc ↺ Reset seed";
    return toScreen(db);
  }

  if (isNoSaleUtterance(text) || parseUtterance(text).length === 0) {
    _pending = null;
    _lastStatus = "📭 Không bán hôm nay — không đề xuất ghi sổ (no-op)";
    return toScreen(db);
  }

  const ingested = ingestUtterance(state, utteranceId, text, cites);
  state = ingested.state;
  db.saveState(state);

  if (ingested.proposal.status === "rejected") {
    _pending = null;
    _lastStatus = `⛔ Đề xuất bị từ chối: ${ingested.proposal.verificationErrors.join("; ")}`;
    return toScreen(db);
  }

  _pending = {
    proposal: ingested.proposal,
    utteranceText: text,
    aiLabelVi: ingested.ai.meta.labelVi,
    aiClassificationNote: ingested.ai.classificationNote,
    aiMode: ingested.ai.meta.mode,
    aiFallbackUsed: ingested.ai.fallbackUsed,
  };
  if (ingested.proposal.payload.crossedThreshold) {
    _lastStatus =
      "▶ ĐỀ XUẤT chờ Duyệt / Từ chối (HITL) · ⚠️ VƯỢT NGƯỠNG 1 TỶ";
    db.appendAudit({
      type: "threshold_warned",
      utteranceId,
      detail: `crossedThreshold · total ${ingested.proposal.payload.totalVnd}`,
      ytdVnd: state.ytdRevenueVnd,
    });
    db.appendAudit({
      type: "soft_paywall_shown",
      utteranceId,
      detail: "Pro kê khai fixture upsell (no live billing)",
      ytdVnd: state.ytdRevenueVnd,
    });
  } else {
    _lastStatus = "▶ ĐỀ XUẤT chờ Duyệt / Từ chối (HITL)";
  }
  return toScreen(db);
}

/**
 * HITL Từ chối — drop pending; retain human reason in audit + ScreenState.
 * Prefer non-empty reason (UI requires it); empty falls back to generic detail.
 */
export function refusePending(reason?: string): ScreenState {
  const db = getUiLedger(false);
  const state = db.loadState();
  if (!_pending) {
    _lastStatus = "Không có đề xuất đang chờ";
    return toScreen(db);
  }
  const id = _pending.proposal.id;
  const trimmed = (reason ?? "").trim();
  const detail = trimmed
    ? `Human Từ chối: ${trimmed} — chưa ghi sổ`
    : "Human Từ chối — chưa ghi sổ";
  appendAudit(_memoryAudit, {
    type: "approve_rejected",
    utteranceId: id,
    detail,
    ytdVnd: state.ytdRevenueVnd,
  });
  db.appendAudit({
    type: "approve_rejected",
    utteranceId: id,
    detail,
    ytdVnd: state.ytdRevenueVnd,
  });
  _pending = null;
  _lastRejectReason = trimmed || null;
  _lastStatus = trimmed
    ? `⛔ Đã Từ chối — ${trimmed} · chưa ghi sổ (HITL)`
    : "⛔ Đã Từ chối — chưa ghi sổ (HITL)";
  return toScreen(db);
}

/** HITL Duyệt — commit verified proposal to SQLite ledger. */
export function approvePending(): ScreenState {
  const db = getUiLedger(false);
  let state = db.loadState();
  if (!_pending) {
    _lastStatus = "Không có đề xuất đang chờ";
    return toScreen(db);
  }
  if (_pending.proposal.status !== "verified") {
    _lastStatus = "⛔ Refuse: proposal chưa verified";
    return toScreen(db);
  }
  const id = _pending.proposal.id;
  state = commitApproved(state, _pending.proposal);
  db.saveState(state);
  db.appendAudit({
    type: "approve_committed",
    utteranceId: id,
    detail: `YTD → ${state.ytdRevenueVnd}`,
    ytdVnd: state.ytdRevenueVnd,
  });
  _pending = null;
  _lastRejectReason = null;
  _lastStatus = `✓ Đã Duyệt · YTD mới: ${state.ytdRevenueVnd.toLocaleString("vi-VN")}₫`;
  return toScreen(db);
}

export function openProSandbox(): {
  screen: ScreenState;
  billingLines: string[];
} {
  const db = getUiLedger(false);
  const state = db.loadState();
  const plans = listPlans("bookkeeper");
  const charge = stubCharge({
    appId: "bookkeeper",
    planId: "bookkeeper-pro",
    amountDisplay: "99.000 ₫ / tháng (fixture · hypothesis)",
  });
  const checkout = createCheckout({
    appId: "bookkeeper",
    planId: "bookkeeper-pro",
    mode: "stripe_test",
  });
  const lines = [
    honestyBanner("offline_stub"),
    `plans: ${plans.map((p) => p.id).join(", ")}`,
    `stubCharge: ${charge.chargeId} · ${charge.detail} · live=false · labeled=${charge.mode}`,
    checkout.honestyBanner,
    `createCheckout(stripe_test): session=${checkout.sessionId}` +
      (checkout.url ? ` · url=${checkout.url}` : "") +
      ` · ${checkout.detail}`,
    "NEVER live billing / NEVER live tax portal.",
  ];
  db.appendAudit({
    type: "soft_paywall_shown",
    utteranceId: "billing-path",
    detail: `stubCharge ${charge.chargeId} + checkout ${checkout.sessionId} (sandbox)`,
    ytdVnd: state.ytdRevenueVnd,
  });
  _proSandboxOpened = true;
  _lastStatus =
    "💎 Pro sandbox mở — stub/stripe_test only · post-1B gate unlocked (SANDBOX)";
  return { screen: toScreen(db), billingLines: lines };
}

/** Test helper: wire an explicit in-memory ledger. */
export function bindTestLedger(db: LedgerDb): void {
  if (_db) _db.close();
  _db = db;
  _pending = null;
  _lastStatus = "";
  _lastRejectReason = null;
  _proSandboxOpened = false;
  _memoryAudit = createAuditLog();
}

export function clearUiSingleton(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
  _pending = null;
  _lastStatus = "";
  _lastRejectReason = null;
  _proSandboxOpened = false;
  _memoryAudit = createAuditLog();
}

export function createFreshMemoryState(
  vendorId: string,
  ytd: number
): VendorState {
  return createVendorState(vendorId, ytd);
}

/** Test helper: expose in-memory audit trail. */
export function getMemoryAudit(): AuditEvent[] {
  return _memoryAudit;
}
