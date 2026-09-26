import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { answerTaxQuestion } from "./rules.js";
import { commitApproved, ingestUtterance } from "./agent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../fixtures/vendor-an-dong.json"), "utf8")
);

let state = {
  vendorId: fixture.vendorId,
  ytdRevenueVnd: fixture.ytdRevenueVnd,
  ledger: [] as never[],
};

console.log(`\n📒 Bookkeeper demo — ${fixture.displayName}`);
console.log(`YTD trước: ${state.ytdRevenueVnd.toLocaleString("vi-VN")}₫\n`);

const cites = fixture.officialDocs.map((d: { id: string }) => d.id);

for (const u of fixture.utterances) {
  const { proposal } = ingestUtterance(state, u.id, u.text, cites);
  console.log(`Utterance: "${u.text}"`);
  console.log(`  → proposed ${proposal.payload.totalVnd.toLocaleString("vi-VN")}₫ (status=${proposal.status})`);
  if (proposal.payload.crossedThreshold) {
    console.log("  ⚠️  Vượt ngưỡng miễn thuế 1 tỷ — cần human approve trước khi ghi sổ");
  }
  // human decides
  state = commitApproved(state, proposal.payload) as typeof state;
  console.log(`  ✓ approved · YTD sau: ${state.ytdRevenueVnd.toLocaleString("vi-VN")}₫\n`);
}

const q = answerTaxQuestion(
  "Tôi còn bao nhiêu trước ngưỡng miễn thuế 1 tỷ?",
  fixture.officialDocs,
  state.ytdRevenueVnd
);
console.log("Q:", "Tôi còn bao nhiêu trước ngưỡng miễn thuế 1 tỷ?");
console.log("A:", q.answer);
console.log("Citations:", q.citations.join(", "));
