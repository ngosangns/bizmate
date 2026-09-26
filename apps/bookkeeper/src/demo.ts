/**
 * Bookkeeper CLI demo — Vietnamese story cards for tiểu thương (Bà Lan).
 * HITL: always show refuse-before-approve. Support --reset to reload seed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createProposal } from "@bizmate/core";
import { answerTaxQuestion } from "./rules.js";
import {
  commitApproved,
  createVendorState,
  ingestUtterance,
  type VendorState,
} from "./agent.js";

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

export interface DemoOptions {
  /** Reload fixture seed (YTD 980tr) and replay full story. */
  reset?: boolean;
  /** Capture lines instead of / in addition to console. */
  log?: (line: string) => void;
  fixturePath?: string;
}

export interface DemoResult {
  state: VendorState;
  lines: string[];
  crossedThreshold: boolean;
  finalYtd: number;
}

function loadFixture(fixturePath?: string): VendorFixture {
  const p =
    fixturePath ??
    path.join(__dirname, "../fixtures/vendor-an-dong.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as VendorFixture;
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

/**
 * Run one full demo lifecycle (ingest → refuse draft → human Duyệt → persist).
 * Preferred entry for tests (no process spawn).
 */
export function runDemoOnce(opts: DemoOptions = {}): DemoResult {
  const lines: string[] = [];
  const out = (line: string) => {
    lines.push(line);
    if (opts.log) opts.log(line);
    else console.log(line);
  };

  const fixture = loadFixture(opts.fixturePath);
  const reset =
    opts.reset === true ||
    process.argv.includes("--reset") ||
    process.env.BOOKKEEPER_RESET === "1";

  if (reset) {
    out(`↺ Reset seed · YTD về ${vnd(fixture.ytdRevenueVnd)}`);
  }

  let state = createVendorState(fixture.vendorId, fixture.ytdRevenueVnd);
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
  out("");

  let crossedThreshold = false;
  let step = 0;

  for (const u of fixture.utterances) {
    step += 1;
    const ingested = ingestUtterance(state, u.id, u.text, cites);
    state = ingested.state;
    const proposal = ingested.proposal;

    out(`── Bước ${step} ──`);
    out(`Bạn nói: “${u.text}”`);

    if (proposal.status === "rejected") {
      out(
        `⛔ Đề xuất bị từ chối (verify): ${proposal.verificationErrors.join("; ")}`
      );
      out("");
      continue;
    }

    const p = proposal.payload;
    out(
      `Đề xuất ghi sổ: ${formatItems(p.items)} · tổng ${vnd(p.totalVnd)} (chờ Duyệt)`
    );

    if (p.crossedThreshold) {
      crossedThreshold = true;
      out(
        "⚠️  CẢNH BÁO: Giao dịch này sẽ vượt ngưỡng miễn thuế 1 tỷ đồng/năm. Cần bạn Duyệt trước khi ghi sổ."
      );
    }

    // HITL gate — refuse draft (human has not approved yet)
    const draftProbe = createProposal(u.id + ":draft-probe", p, "mate");
    let refused = false;
    try {
      commitApproved(state, draftProbe);
    } catch {
      refused = true;
      out("⛔ Từ chối ghi sổ khi chưa Duyệt");
    }
    if (!refused) {
      throw new Error("Expected refuse path for unverified draft");
    }

    out("👤 Người duyệt: Bà Lan → Duyệt");
    state = commitApproved(state, proposal);
    out(`✓ Đã duyệt · YTD mới: ${vnd(state.ytdRevenueVnd)}`);
    out("");
  }

  const q = answerTaxQuestion(
    "Tôi còn bao nhiêu trước ngưỡng miễn thuế 1 tỷ?",
    fixture.officialDocs,
    state.ytdRevenueVnd
  );
  const citeTitles = q.citations.map(
    (id) => titleById[id] ?? id
  );

  out("── Hỏi thuế ──");
  out("Bạn hỏi: Tôi còn bao nhiêu trước ngưỡng miễn thuế 1 tỷ?");
  out(`Trả lời: ${q.answer}`);
  out(`Căn cứ: ${citeTitles.join(" · ")}`);
  out("");

  return {
    state,
    lines,
    crossedThreshold,
    finalYtd: state.ytdRevenueVnd,
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
  runDemoOnce({ reset });
}
