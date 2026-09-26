/**
 * Bookkeeper CLI demo — Vietnamese story cards for tiểu thương (Bà Lan).
 * HITL: always show refuse-before-approve. Support --reset to reload seed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createProposal } from "@bizmate/core";
import {
  createCheckout,
  honestyBanner,
  stubCharge,
} from "@bizmate/billing";
import { answerTaxQuestion, proposeLedgerEntry } from "./rules.js";
import {
  commitApproved,
  createVendorState,
  ingestUtterance,
  verifyLedgerProposal,
  type VendorState,
} from "./agent.js";
import {
  appendAudit,
  createAuditLog,
  formatAuditBlock,
  type AuditEvent,
} from "./audit.js";
import {
  buildWeek2SeedMetrics,
  formatSoftPaywallLine,
  formatWeek2SeedMetricsBlock,
  type Week2SeedMetrics,
} from "./metrics.js";
import { isNoSaleUtterance, parseUtterance } from "./parse-utterance.js";
import { openLedgerDb, DEFAULT_DB_PATH, type LedgerDb } from "./ledger-db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface OfficialDoc {
  id: string;
  title: string;
  excerpt: string;
}

export interface VendorFixture {
  vendorId: string;
  displayName: string;
  ytdRevenueVnd: number;
  utterances: { id: string; text: string; ts?: string }[];
  officialDocs: OfficialDoc[];
}

export interface EInvoiceCitation {
  id: string;
  title: string;
  excerpt: string;
}

export interface EInvoiceFixture {
  _meta?: { demo?: boolean; note?: string; kind?: string };
  invoiceNumber: string;
  issuedAt: string;
  sellerTaxId: string;
  sellerName?: string;
  buyerName: string;
  currency: string;
  status: "drafted" | "issued" | string;
  lineItems: {
    description: string;
    qty: number;
    unitPriceVnd: number;
    lineTotalVnd?: number;
  }[];
  totalVnd: number;
  citationIds: string[];
  citations?: EInvoiceCitation[];
}

export interface DemoOptions {
  reset?: boolean;
  log?: (line: string) => void;
  fixturePath?: string;
  eInvoicePath?: string;
  /** SQLite path. Default: :memory: when opts provided by tests; file DB for CLI. */
  dbPath?: string;
}

export interface DemoResult {
  state: VendorState;
  lines: string[];
  crossedThreshold: boolean;
  finalYtd: number;
  week2Metrics: Week2SeedMetrics;
  audit: AuditEvent[];
}

function loadFixture(fixturePath?: string): VendorFixture {
  const p =
    fixturePath ??
    path.join(__dirname, "../../fixtures/vendor-an-dong.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as VendorFixture;
}

function loadEInvoice(eInvoicePath?: string): EInvoiceFixture | null {
  const p =
    eInvoicePath ??
    path.join(__dirname, "../../fixtures/e-invoice-sample.json");
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as EInvoiceFixture;
  } catch {
    return null;
  }
}

function vnd(n: number): string {
  return `${n.toLocaleString("vi-VN")}₫`;
}

function formatItems(
  items: { description: string; qty: number; unitPriceVnd: number }[]
): string {
  return items
    .map(
      (i) =>
        `${i.qty} ${i.description} × ${vnd(i.unitPriceVnd)} = ${vnd(i.qty * i.unitPriceVnd)}`
    )
    .join("; ");
}

function formatEInvoiceSummary(inv: EInvoiceFixture): string {
  const nLines = inv.lineItems?.length ?? 0;
  return (
    `HĐ điện tử (fixture offline): ${inv.invoiceNumber} · ${inv.status} · ` +
    `${inv.buyerName} · ${nLines} dòng · ${vnd(inv.totalVnd)} ${inv.currency}` +
    ` · MST bán (demo): ${inv.sellerTaxId} — không gửi thuế`
  );
}

/**
 * Run one full demo lifecycle (ingest → refuse draft → human Duyệt → persist).
 */
export function runDemoOnce(opts: DemoOptions = {}): DemoResult {
  const lines: string[] = [];
  const out = (line: string) => {
    lines.push(line);
    if (opts.log) opts.log(line);
    else console.log(line);
  };

  const fixture = loadFixture(opts.fixturePath);
  const audit = createAuditLog();
  const reset =
    opts.reset === true ||
    process.argv.includes("--reset") ||
    process.env.BOOKKEEPER_RESET === "1";

  // SQLite ledger (better-sqlite3). CLI uses file DB; tests default :memory:.
  const isCli =
    opts.log === undefined &&
    (opts.dbPath !== undefined || process.argv[1]?.includes("demo"));
  const dbPath =
    opts.dbPath ??
    (isCli || process.env.BOOKKEEPER_DB
      ? process.env.BOOKKEEPER_DB ?? DEFAULT_DB_PATH
      : ":memory:");
  let ledgerDb: LedgerDb | null = null;
  try {
    ledgerDb = openLedgerDb({
      dbPath,
      fixturePath: opts.fixturePath,
      reset,
    });
  } catch (err) {
    out(
      `⚠️ SQLite open failed (${err instanceof Error ? err.message : err}) — falling back to in-memory only`
    );
    ledgerDb = null;
  }

  if (reset) {
    out(`↺ RESET (top) · seed YTD về ${vnd(fixture.ytdRevenueVnd)}`);
    if (ledgerDb) out(`   SQLite ledger: ${ledgerDb.path} (better-sqlite3 · offline)`);
  } else if (ledgerDb) {
    out(`SQLite ledger: ${ledgerDb.path} (better-sqlite3 · offline)`);
  }

  let state = ledgerDb
    ? ledgerDb.loadState(fixture.vendorId)
    : createVendorState(fixture.vendorId, fixture.ytdRevenueVnd);
  // Ensure vendor id matches fixture even if DB was empty-seeded
  if (state.vendorId !== fixture.vendorId) {
    state = createVendorState(fixture.vendorId, fixture.ytdRevenueVnd);
  }
  if (reset || !ledgerDb) {
    state = createVendorState(fixture.vendorId, fixture.ytdRevenueVnd);
    if (ledgerDb && reset) ledgerDb.saveState(state);
  }
  const cites = fixture.officialDocs.map((d) => d.id);
  const titleById = Object.fromEntries(
    fixture.officialDocs.map((d) => [d.id, d.title])
  );

  out("");
  out(`📒 Bookkeeper — ${fixture.displayName}`);
  out(`YTD hiện tại: ${vnd(state.ytdRevenueVnd)}`);
  out(
    "Giả thuyết mua: hộ kinh doanh chợ / SME VN · freemium → trả phí khi gần ngưỡng 1 tỷ hoặc cần kê khai (giả thuyết, chưa đo ARPU)."
  );
  out(
    "Week-2 kênh (chọn 1): nhóm tiểu thương chợ An Đông — trust láng giềng, CAC thấp, khớp persona Bà Lan (không đại lý thuế / không Shopee Academy trong pilot này)."
  );
  out(
    "Parse utterance = regex stub (offline) — chưa ASR thật."
  );
  out("");

  let crossedThreshold = false;
  let approveCount = 0;
  let refuseBeforeDuyetCount = 0;
  let thresholdWarningCount = 0;
  let citationHits = 0;
  let step = 0;
  let firstApprovedId: string | null = null;

  for (const u of fixture.utterances) {
    step += 1;
    out(`── Bước ${step} ──`);
    out(`Bạn nói: “${u.text}”`);

    // TA-K2: no-sale / empty day — no-op, no ledger proposal
    if (isNoSaleUtterance(u.text) || parseUtterance(u.text).length === 0) {
      out("📭 Không bán hôm nay — không đề xuất ghi sổ (no-op)");
      out("");
      continue;
    }

    const ingested = ingestUtterance(state, u.id, u.text, cites);
    state = ingested.state;
    if (ledgerDb) ledgerDb.saveState(state);
    const proposal = ingested.proposal;

    if (proposal.status === "rejected") {
      out(
        `⛔ Đề xuất bị từ chối (verify): ${proposal.verificationErrors.join("; ")}`
      );
      out("");
      continue;
    }

    const p = proposal.payload;
    out(
      `▶ ĐỀ XUẤT: ${formatItems(p.items)} · tổng ${vnd(p.totalVnd)} (chờ Duyệt)`
    );
    citationHits += p.citations.length;

    if (p.crossedThreshold) {
      crossedThreshold = true;
      thresholdWarningCount += 1;
      out(
        "⏸ PAUSE · CẢNH BÁO 1B: Giao dịch này sẽ vượt ngưỡng miễn thuế 1 tỷ đồng/năm."
      );
      out(
        "   → Dừng lại xem số · Cần bạn Duyệt trước khi ghi sổ."
      );
      out(formatSoftPaywallLine());
      appendAudit(audit, {
        type: "threshold_warned",
        utteranceId: u.id,
        detail: `crossedThreshold · total ${p.totalVnd}`,
        ytdVnd: state.ytdRevenueVnd,
      });
      appendAudit(audit, {
        type: "soft_paywall_shown",
        utteranceId: u.id,
        detail: "Pro kê khai fixture upsell (no live billing)",
        ytdVnd: state.ytdRevenueVnd,
      });
    }

    // HITL: Từ chối-before-Duyệt + Lee-K2 audit trail
    const draftProbe = createProposal(u.id + ":draft-probe", p, "mate");
    let refused = false;
    try {
      commitApproved(state, draftProbe);
    } catch (err) {
      refused = true;
      refuseBeforeDuyetCount += 1;
      out("▶ TỪ CHỐI: ghi sổ khi chưa Duyệt");
      // HITL audit sample reason (R5) — demo fixed string for refuse trail
      const hitlReason = "sai số tiền — demo HITL";
      const rejDetail =
        `Human Từ chối: ${hitlReason} — chưa ghi sổ` +
        (err instanceof Error ? ` · (${err.message})` : "");
      out(`   Lý do Từ chối (HITL): ${hitlReason}`);
      appendAudit(audit, {
        type: "approve_rejected",
        utteranceId: u.id,
        detail: rejDetail,
        ytdVnd: state.ytdRevenueVnd,
      });
      if (ledgerDb) {
        ledgerDb.appendAudit({
          type: "approve_rejected",
          utteranceId: u.id,
          detail: rejDetail,
          ytdVnd: state.ytdRevenueVnd,
        });
      }
    }
    if (!refused) {
      throw new Error("Expected refuse path for unverified draft");
    }

    out("▶ DUYỆT: Người duyệt Bà Lan → Duyệt");
    state = commitApproved(state, proposal);
    approveCount += 1;
    if (!firstApprovedId) firstApprovedId = u.id;
    appendAudit(audit, {
      type: "approve_committed",
      utteranceId: u.id,
      detail: `YTD → ${state.ytdRevenueVnd}`,
      ytdVnd: state.ytdRevenueVnd,
    });
    if (ledgerDb) {
      ledgerDb.saveState(state);
      ledgerDb.appendAudit({
        type: "approve_committed",
        utteranceId: u.id,
        detail: `YTD → ${state.ytdRevenueVnd}`,
        ytdVnd: state.ytdRevenueVnd,
      });
    }
    out(`✓ Đã duyệt · YTD mới: ${vnd(state.ytdRevenueVnd)}`);
    out("");
  }

  // Lee-K3 / TA-K2 sửa sai: same utteranceId, DIFFERENT amounts → reject
  if (firstApprovedId) {
    out("── Sửa sai / idempotent re-ingest ──");
    out(
      `Thử sửa sai cùng id “${firstApprovedId}” với số tiền khác → phải từ chối (idempotency).`
    );
    const conflictEntry = proposeLedgerEntry(
      firstApprovedId,
      [{ description: "áo", qty: 99, unitPriceVnd: 999_000 }],
      fixture.ytdRevenueVnd,
      cites
    );
    const conflict = verifyLedgerProposal(
      state,
      createProposal(firstApprovedId, conflictEntry, "mate")
    );
    if (conflict.proposal.status === "rejected") {
      out(
        `⛔ Idempotency: ${conflict.proposal.verificationErrors.join("; ")}`
      );
      appendAudit(audit, {
        type: "idempotency_conflict",
        utteranceId: firstApprovedId,
        detail: conflict.proposal.verificationErrors.join("; "),
        ytdVnd: state.ytdRevenueVnd,
      });
    } else {
      throw new Error("Expected idempotency reject on different payload");
    }
    out("");
  }

  const q = answerTaxQuestion(
    "Tôi còn bao nhiêu trước ngưỡng miễn thuế 1 tỷ?",
    fixture.officialDocs,
    state.ytdRevenueVnd
  );
  const citeTitles = q.citations.map((id) => titleById[id] ?? id);
  citationHits += q.citations.length;

  out("── Hỏi thuế ──");
  out("Bạn hỏi: Tôi còn bao nhiêu trước ngưỡng miễn thuế 1 tỷ?");
  out(`Trả lời: ${q.answer}`);
  out(`Căn cứ: ${citeTitles.join(" · ")}`);
  out("");

  const eInvoice = loadEInvoice(opts.eInvoicePath);
  if (eInvoice) {
    out("── Hóa đơn điện tử (fixture) ──");
    out(formatEInvoiceSummary(eInvoice));
    citationHits += eInvoice.citationIds?.length ?? 0;
    const excerpts = eInvoice.citations ?? [];
    for (const c of excerpts) {
      out(`  Đoạn citation: [${c.id}] ${c.excerpt}`);
      citationHits += 1;
    }
    out("");
  }

  if (crossedThreshold) {
    out("── Soft paywall + billing path (sandbox/stub) ──");
    out(formatSoftPaywallLine());
    out(`planId=bookkeeper-pro · Free vs Pro · 99.000₫/tháng (hypothesis — chưa đo ARPU)`);
    out(honestyBanner("offline_stub"));
    const charge = stubCharge({
      appId: "bookkeeper",
      planId: "bookkeeper-pro",
      amountDisplay: "99.000 ₫ / tháng (fixture · hypothesis)",
    });
    out(
      `stubCharge: ${charge.chargeId} · ${charge.detail} · live=false · labeled=${charge.mode}`
    );
    const checkout = createCheckout({
      appId: "bookkeeper",
      planId: "bookkeeper-pro",
      mode: "stripe_test",
    });
    out(checkout.honestyBanner);
    out(
      `createCheckout(stripe_test): session=${checkout.sessionId}` +
        (checkout.url ? ` · url=${checkout.url}` : "") +
        ` · ${checkout.detail}`
    );
    out("NEVER live billing / NEVER live tax portal.");
    appendAudit(audit, {
      type: "soft_paywall_shown",
      utteranceId: "billing-path",
      detail: `stubCharge ${charge.chargeId} + checkout ${checkout.sessionId} (sandbox)`,
      ytdVnd: state.ytdRevenueVnd,
    });
    out("");
  }

  const week2Metrics = buildWeek2SeedMetrics({
    approveCount,
    refuseBeforeDuyetCount,
    thresholdWarningCount,
    citationHits,
    finalYtdVnd: state.ytdRevenueVnd,
  });
  for (const line of formatWeek2SeedMetricsBlock(week2Metrics)) {
    out(line);
  }
  out("");

  for (const line of formatAuditBlock(audit)) {
    out(line);
  }
  out("");

  if (ledgerDb) {
    out(`✓ SQLite persisted · entries=${state.ledger.length} · path=${ledgerDb.path}`);
    ledgerDb.close();
  }

  return {
    state,
    lines,
    crossedThreshold,
    finalYtd: state.ytdRevenueVnd,
    week2Metrics,
    audit,
  };
}

function isCliEntry(): boolean {
  const arg = process.argv[1];
  if (!arg) return false;
  try {
    return import.meta.url === pathToFileURL(path.resolve(arg)).href;
  } catch {
    return /demo\.(ts|js)$/.test(arg);
  }
}

if (isCliEntry()) {
  const reset =
    process.argv.includes("--reset") || process.env.BOOKKEEPER_RESET === "1";
  runDemoOnce({ reset, dbPath: process.env.BOOKKEEPER_DB ?? DEFAULT_DB_PATH });
}
