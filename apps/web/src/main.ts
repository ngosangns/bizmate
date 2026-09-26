import {
  type Domain,
  verdictFor,
  vendorDayFixture,
  pipelineFixture,
  workflowFor,
} from "./samples.js";
import { runDomain, type RunResult } from "./runner.js";

type Progress = "idle" | "generating" | "judging" | "ready" | "running" | "done";

let domain: Domain = "accounting";
let approved = false;
let lastResult: RunResult | null = null;
let progress: Progress = "ready";
let seed = 1;
/** Lightweight client-side audit mirror (optional Lee ask). */
const webAudit: Array<{ action: string; at: string; detail: string }> = [];
let lastRunMs: number | null = null;

function demoDerivedMetricsHtml(): string {
  const approveFail = webAudit.filter((e) => e.action === "approve_fail").length;
  const approveOk = webAudit.filter((e) => e.action === "approve_ok").length;
  const persistOk = webAudit.filter((e) => e.action === "persist_ok").length;
  const ms = lastRunMs != null ? `${lastRunMs} ms` : "—";
  return `
    <section class="panel metrics-demo">
      <h2>Chỉ số <span class="badge">demo-derived</span></h2>
      <p class="hint">Từ audit phiên offline — không phải baseline field study.</p>
      <div class="ledger-hero">
        <div class="metric"><dt>approve_fail</dt><dd>${approveFail}</dd></div>
        <div class="metric"><dt>approve_ok</dt><dd>${approveOk}</dd></div>
        <div class="metric"><dt>persist_ok</dt><dd>${persistOk}</dd></div>
        <div class="metric"><dt>Last run</dt><dd>${ms}</dd></div>
      </div>
      <p class="hint">Payer D-Day: <strong>Sea internal tooling</strong> · SME = roadmap.</p>
    </section>`;
}


const app = document.querySelector("#app")!;

const CHIP_LABELS = ["Tạo", "Chấm", "Duyệt", "Chạy"] as const;

function fmtVnd(n: number): string {
  return n.toLocaleString("vi-VN") + " ₫";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function chipClass(index: number): string {
  const order: Progress[] = ["generating", "judging", "ready", "running"];
  if (progress === "done") return "chip done";
  if (progress === "idle") return "chip";
  const current = order.indexOf(progress === "ready" ? "ready" : progress);
  // ready means generate+judge done, waiting approve
  if (progress === "ready") {
    if (index <= 1) return "chip done";
    if (index === 2) return approved ? "chip done" : "chip active";
    return "chip";
  }
  if (progress === "generating") {
    return index === 0 ? "chip busy" : "chip";
  }
  if (progress === "judging") {
    if (index === 0) return "chip done";
    if (index === 1) return "chip busy";
    return "chip";
  }
  if (progress === "running") {
    if (index < 3) return "chip done";
    return "chip busy";
  }
  void current;
  return "chip";
}

function progressBanner(): string {
  switch (progress) {
    case "generating":
      return `<div class="progress-banner">⏳ Đang tạo workflow…</div>`;
    case "judging":
      return `<div class="progress-banner">⚖️ Đang chấm workflow (Laya offline)…</div>`;
    case "running":
      return `<div class="progress-banner">▶️ Đang chạy runtime deterministic…</div>`;
    default:
      return "";
  }
}

function personaBlock(): string {
  if (domain === "accounting") {
    return `
      <div class="persona">
        <div class="persona-avatar" aria-hidden="true">👵</div>
        <div>
          <h2>Bà Lan · tiểu thương chợ An Đông</h2>
          <p>Ghi sổ bán hàng bằng giọng nói · theo dõi ngưỡng miễn thuế 1 tỷ ₫ (ND-141).</p>
        </div>
      </div>`;
  }
  return `
    <div class="persona">
      <div class="persona-avatar" aria-hidden="true">🏪</div>
      <div>
        <h2>Pipeline bán hàng SME <span class="badge">phụ</span></h2>
        <p>Lead → báo giá → đơn · cần người duyệt trước khi chốt order.</p>
      </div>
    </div>`;
}

function transcriptBlock(): string {
  if (domain === "accounting") {
    return `
      <div class="transcript-card">
        <div class="label">Ghi âm hôm nay · seed #${seed}</div>
        <blockquote>“${escapeHtml(vendorDayFixture.transcript)}”</blockquote>
      </div>`;
  }
  const names = pipelineFixture.leads.map((l) => l.name).join(", ");
  return `
    <div class="transcript-card">
      <div class="label">Pipeline · seed #${seed}</div>
      <blockquote>${pipelineFixture.leads.length} lead: ${escapeHtml(names)}</blockquote>
    </div>`;
}

function render(): void {
  const workflow = workflowFor(domain);
  const verdict = verdictFor(domain);
  const fixture =
    domain === "accounting" ? vendorDayFixture : pipelineFixture;
  const busy = progress === "generating" || progress === "judging" || progress === "running";

  app.innerHTML = `
    <header>
      <h1>Biz Mate <span class="badge">offline</span></h1>
      <p class="tagline">AI đề xuất → code kiểm → người quyết. Mate = creation-time · runtime deterministic · registry = EM + human. Payer D-Day: Sea internal.</p>
    </header>

    ${personaBlock()}
    ${transcriptBlock()}

    <div class="step-chips" role="list" aria-label="Các bước">
      ${CHIP_LABELS.map(
        (label, i) =>
          `<span class="${chipClass(i)}" role="listitem">${label}</span>`
      ).join("")}
    </div>

    ${progressBanner()}
    ${demoDerivedMetricsHtml()}

    <section class="panel">
      <h3>Domain</h3>
      <div class="domain-pills">
        <button type="button" data-domain="accounting" class="${domain === "accounting" ? "active" : ""}">Kế toán · hero</button>
        <button type="button" data-domain="sales" class="secondary-domain ${domain === "sales" ? "active" : ""}">Bán hàng · phụ</button>
      </div>
      <p class="hint">Mặc định: kế toán tiểu thương. Đổi domain sẽ reset seed.</p>
    </section>

    <section class="panel">
      <h3>Điểm Judge</h3>
      <div class="score-badge">
        <span class="score-num">${verdict.score}</span>
        <span class="score-label">${verdict.passed ? "Đạt" : "Chưa đạt"} · ${verdict.mode}</span>
      </div>
      <p class="hint">${escapeHtml(verdict.highLevelSummary ?? "")}</p>
    </section>

    <section class="panel">
      <h3>Người duyệt (HITL)</h3>
      <div class="actions">
        <button type="button" class="primary" id="btn-approve" ${busy ? "disabled" : ""}>${approved ? "Đã duyệt ✓" : "Duyệt workflow"}</button>
        <button type="button" class="secondary" id="btn-revoke" ${approved && !busy ? "" : "disabled"}>Thu hồi</button>
        <span class="status-pill ${approved ? "approved" : ""}">
          ${approved ? "Đã mở khóa ghi sổ" : "Chờ duyệt trước khi persist"}
        </span>
      </div>
    </section>

    <section class="panel">
      <h3>Chạy offline</h3>
      <div class="actions">
        <button type="button" class="primary" id="btn-run" ${busy ? "disabled" : ""}>Chạy ${domain === "accounting" ? "sổ kế toán" : "pipeline"}</button>
        <button type="button" class="reset" id="btn-reset" ${busy ? "disabled" : ""}>Reset seed</button>
      </div>
      <div id="run-out">${lastResult ? renderResult(lastResult) : '<p class="hint">Bấm Chạy để ghi sổ / cập nhật pipeline (fixture offline).</p>'}</div>
    </section>

    <details class="tech">
      <summary>Chi tiết kỹ thuật (workflow + verdict JSON)</summary>
      <p class="hint" style="margin-top:0.5rem">Workflow ${escapeHtml(workflow.id)} v${escapeHtml(workflow.version)}</p>
      <pre class="json">${escapeHtml(JSON.stringify(workflow, null, 2))}</pre>
      <pre class="json">${escapeHtml(JSON.stringify(verdict, null, 2))}</pre>
      <pre class="json">${escapeHtml(JSON.stringify(fixture, null, 2))}</pre>
    </details>
  `;

  app.querySelectorAll<HTMLButtonElement>("[data-domain]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (busy) return;
      domain = btn.dataset.domain as Domain;
      resetSeed(false);
      void simulateGenerateJudge();
    });
  });

  app.querySelector("#btn-approve")?.addEventListener("click", () => {
    if (busy) return;
    approved = true;
    webAudit.push({
      action: "human_approve",
      at: new Date().toISOString(),
      detail: `${workflow.id}@${workflow.version}`,
    });
    render();
  });
  app.querySelector("#btn-revoke")?.addEventListener("click", () => {
    if (busy) return;
    approved = false;
    lastResult = null;
    webAudit.push({
      action: "approve_revoke",
      at: new Date().toISOString(),
      detail: workflow.id,
    });
    render();
  });
  app.querySelector("#btn-run")?.addEventListener("click", () => {
    if (busy) return;
    void runWithProgress();
  });
  app.querySelector("#btn-reset")?.addEventListener("click", () => {
    if (busy) return;
    resetSeed(true);
  });
}

function resetSeed(rerunProgress: boolean): void {
  seed += 1;
  approved = false;
  lastResult = null;
  webAudit.length = 0;
  lastRunMs = null;
  progress = "ready";
  if (rerunProgress) {
    void simulateGenerateJudge();
  } else {
    render();
  }
}

async function simulateGenerateJudge(): Promise<void> {
  progress = "generating";
  render();
  await sleep(450);
  progress = "judging";
  render();
  await sleep(450);
  progress = "ready";
  render();
}

async function runWithProgress(): Promise<void> {
  progress = "running";
  render();
  await sleep(350);
  const t0 = performance.now();
  lastResult = runDomain(domain, approved);
  lastRunMs = Math.round(performance.now() - t0);
  const at = new Date().toISOString();
  if (!approved || !lastResult.ok) {
    webAudit.push({
      action: "approve_fail",
      at,
      detail: `${lastResult.workflowId} — gate blocked persist`,
    });
  } else {
    webAudit.push({
      action: "approve_ok",
      at,
      detail: `${lastResult.workflowId} human Duyệt`,
    });
    webAudit.push({
      action: "persist_ok",
      at,
      detail: `${lastResult.workflowId} ledger/pipeline persisted`,
    });
  }
  progress = "done";
  render();
}

function renderResult(result: RunResult): string {
  const steps = result.steps
    .map((s) => {
      const tag = s.ok ? "tag-ok" : "tag-fail";
      const label = s.ok ? "ok" : s.skipped ? "skip" : "FAIL";
      const err = s.error ? ` — ${escapeHtml(s.error)}` : "";
      return `<li><span class="${tag}">[${label}]</span> ${escapeHtml(s.kind)}:${escapeHtml(s.stepId)}${err}</li>`;
    })
    .join("");

  let cards = "";
  const ledger = result.summary.ledger as
    | {
        saleTotalVnd: number;
        ytdBeforeVnd: number;
        ytdAfterVnd: number;
        remainingExemptionVnd: number;
        crossedExemption: boolean;
        persisted: boolean;
      }
    | undefined;

  if (ledger) {
    const crossClass = ledger.crossedExemption ? "highlight" : "ok-highlight";
    cards = `
      <div class="ledger-hero">
        <div class="metric"><dt>Doanh thu đơn</dt><dd>${fmtVnd(ledger.saleTotalVnd)}</dd></div>
        <div class="metric"><dt>YTD trước</dt><dd>${fmtVnd(ledger.ytdBeforeVnd)}</dd></div>
        <div class="metric"><dt>YTD sau</dt><dd>${fmtVnd(ledger.ytdAfterVnd)}</dd></div>
        <div class="metric"><dt>Còn miễn thuế</dt><dd>${fmtVnd(ledger.remainingExemptionVnd)}</dd></div>
        <div class="metric ${crossClass}">
          <dt>Ngưỡng 1 tỷ</dt>
          <dd>${ledger.crossedExemption ? "⚠️ ĐÃ VƯỢT" : "Chưa vượt"} · ghi sổ=${ledger.persisted ? "có" : "không"}</dd>
        </div>
      </div>
      ${
        ledger.crossedExemption
          ? `<div class="crossed-banner">Bà Lan vừa vượt ngưỡng miễn thuế 1 tỷ ₫ — cần lưu ý nghĩa vụ thuế (tính bằng code, không phải LLM).</div>`
          : ""
      }`;
  } else if (result.domain === "sales" && Array.isArray(result.summary.leads)) {
    const leads = result.summary.leads as Array<{
      id: string;
      name: string;
      stage: string;
      amountVnd: number;
    }>;
    cards = `<ul class="step-list">${leads
      .map(
        (l) =>
          `<li>${escapeHtml(l.name)} · ${escapeHtml(l.stage)} · ${fmtVnd(l.amountVnd)}</li>`
      )
      .join("")}</ul>`;
  }

  const auditHtml =
    webAudit.length > 0
      ? `<ul class="audit-mini">${webAudit
          .map(
            (e) =>
              `<li>[${escapeHtml(e.action)}] ${escapeHtml(e.detail)}</li>`
          )
          .join("")}</ul>`
      : "";

  return `
    <p style="margin:0.75rem 0 0">
      <strong class="${result.ok ? "passed" : "failed"}">${result.ok ? "THÀNH CÔNG" : "BỊ CHẶN"}</strong>
      · duyệt=${result.approved ? "có" : "không"}
    </p>
    ${cards}
    ${auditHtml}
    <details class="tech">
      <summary>Log bước runtime</summary>
      <ul class="step-list">${steps}</ul>
    </details>
  `;
}

void simulateGenerateJudge();
