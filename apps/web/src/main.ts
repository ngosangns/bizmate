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
const webAudit: Array<{
  action: string;
  at: string;
  detail: string;
  workflowId?: string;
  workflowVersion?: string;
}> = [];
let lastRunMs: number | null = null;
let lastStepMs: Array<{ stepId: string; kind: string; ms: number }> = [];
/** Kyle-B2: animate chips only after explicit Tạo lại click. */
let animateChips = false;

/** Son-B1: live board counts from apps/em/board.json (7 done / 3 todo) — do not invent. */
const EM_BOARD_DONE = 7;
const EM_BOARD_TODO = 3;

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
  if (!animateChips && progress !== "running" && progress !== "done") {
    // Idle chips — no busy animation until Tạo lại
    if (progress === "ready") {
      if (index <= 1) return "chip done";
      if (index === 2) return approved ? "chip done" : "chip active";
      return "chip";
    }
    return "chip";
  }
  if (progress === "done") return "chip done";
  if (progress === "idle") return "chip";
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
  return "chip";
}

function progressBanner(): string {
  if (!animateChips && progress !== "running") return "";
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
          <p class="impact-line">Chủ sạp biết mình vừa vượt 1 tỷ <strong>trước khi</strong> bị phạt.</p>
        </div>
      </div>`;
  }
  return `
    <div class="persona">
      <div class="persona-avatar" aria-hidden="true">🏪</div>
      <div>
        <h2>Pipeline bán hàng SME <span class="badge">backup domain</span></h2>
        <p>Lead → báo giá → đơn · domain phụ — không phải hero sân khấu.</p>
      </div>
    </div>`;
}

function transcriptBlock(): string {
  if (domain === "accounting") {
    return `
      <div class="transcript-card">
        <div class="label">Ghi âm hôm nay · <span class="seed-badge">seed #${seed}</span></div>
        <blockquote>“${escapeHtml(vendorDayFixture.transcript)}”</blockquote>
      </div>`;
  }
  const names = pipelineFixture.leads.map((l) => l.name).join(", ");
  return `
    <div class="transcript-card">
      <div class="label">Pipeline · <span class="seed-badge">seed #${seed}</span></div>
      <blockquote>${pipelineFixture.leads.length} lead: ${escapeHtml(names)}</blockquote>
    </div>`;
}

/** Kyle-B1: YTD / crossed / remaining ABOVE THE FOLD after Chạy. */
function aboveFoldLedger(): string {
  if (!lastResult) return "";
  const ledger = lastResult.summary.ledger as
    | {
        saleTotalVnd: number;
        ytdBeforeVnd: number;
        ytdAfterVnd: number;
        remainingExemptionVnd: number;
        crossedExemption: boolean;
        persisted: boolean;
      }
    | undefined;
  // Also accept compute-only (denied path) for partial visibility
  const compute = lastResult.summary.compute as
    | {
        saleTotalVnd: number;
        ytdBeforeVnd: number;
        ytdAfterVnd: number;
        remainingExemptionVnd: number;
        crossedExemption: boolean;
      }
    | undefined;
  const data = ledger ?? compute;
  if (!data || lastResult.domain !== "accounting") return "";

  const crossed = data.crossedExemption;
  const persisted = ledger?.persisted ?? false;
  return `
    <section class="panel ledger-above-fold" aria-live="polite">
      <h2>Sổ cái · trên fold <span class="badge">sau Chạy</span></h2>
      <div class="ledger-hero ledger-hero-lg">
        <div class="metric"><dt>YTD sau</dt><dd>${fmtVnd(data.ytdAfterVnd)}</dd></div>
        <div class="metric"><dt>Còn miễn thuế</dt><dd>${fmtVnd(data.remainingExemptionVnd)}</dd></div>
        <div class="metric ${crossed ? "highlight" : "ok-highlight"}">
          <dt>Ngưỡng 1 tỷ</dt>
          <dd>${crossed ? "⚠️ ĐÃ VƯỢT" : "Chưa vượt"} · ghi sổ=${persisted ? "có" : "không"}</dd>
        </div>
      </div>
      ${
        crossed
          ? `<div class="crossed-banner">Chủ sạp biết mình vừa vượt 1 tỷ <strong>trước khi</strong> bị phạt — Bà Lan vừa vượt ngưỡng miễn thuế 1 tỷ ₫ (tính bằng code, không phải LLM).</div>`
          : ""
      }
    </section>`;
}

function blastRadiusCard(): string {
  const wf = workflowFor(domain);
  const affected = webAudit.filter(
    (e) =>
      e.workflowId === wf.id &&
      e.workflowVersion === wf.version
  ).length;
  // Session seed count; CLI AUDIT JSONL is source of truth for offline demo
  const y = affected > 0 ? affected : webAudit.length;
  return `
    <section class="panel blast-card">
      <h2>Blast-radius <span class="badge">demo-derived</span></h2>
      <p class="unpin-msg">unpin workflow version <code>${escapeHtml(wf.id)}@${escapeHtml(wf.version)}</code> → <strong>${y}</strong> executions affected</p>
      <p class="hint">Đếm từ audit phiên (mirror CLI <code>apps/runtime/.audit/events.jsonl</code>) — rollback trước khi BGH hỏi production blast.</p>
    </section>`;
}

function demoDerivedMetricsHtml(): string {
  const approveFail = webAudit.filter((e) => e.action === "approve_fail").length;
  const approveOk = webAudit.filter((e) => e.action === "approve_ok").length;
  const persistOk = webAudit.filter((e) => e.action === "persist_ok").length;
  const ms = lastRunMs != null ? `${lastRunMs} ms` : "—";
  const stepLines =
    lastStepMs.length > 0
      ? `<ul class="audit-mini">${lastStepMs
          .map(
            (s) =>
              `<li>${escapeHtml(s.kind)}:${escapeHtml(s.stepId)} ${s.ms}ms/step</li>`
          )
          .join("")}</ul>`
      : "";
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
      ${stepLines}
      <p class="hint hotpath-footer">HOT-PATH (demo-derived): last run ${ms}${
        lastStepMs.length
          ? ` · ${lastStepMs.map((s) => `${s.kind} ${s.ms}ms/step`).join(" · ")}`
          : ""
      }</p>
      <p class="hint em-money-proof">EM blocked auto-done on money task</p>
      <p class="hint">Payer D-Day: <strong>Sea internal tooling</strong> · SME = roadmap.</p>
    </section>`;
}

function stageHonestyBlock(): string {
  return `
    <section class="panel stage-honesty">
      <h3>Sân khấu · Codex honesty</h3>
      <p class="hint">EM board live: <strong>${EM_BOARD_DONE} done / ${EM_BOARD_TODO} todo</strong> (từ <code>apps/em/board.json</code>).</p>
      <p class="hint stub-callout"><strong>Stub-fail honesty:</strong> <code>BIZMATE_MODE=live</code> Mate/Judge SLM = heuristics — sân khấu demo <em>offline rules</em>, không claim frontier model.</p>
    </section>`;
}

function render(): void {
  const workflow = workflowFor(domain);
  const verdict = verdictFor(domain);
  const fixture =
    domain === "accounting" ? vendorDayFixture : pipelineFixture;
  const busy =
    progress === "generating" ||
    progress === "judging" ||
    progress === "running";

  app.innerHTML = `
    <header>
      <h1>Biz Mate <span class="badge">offline</span> <span class="seed-badge">seed #${seed}</span></h1>
      <p class="tagline">Bà Lan · sổ 1 tỷ ₫. AI đề xuất → code kiểm → người quyết. Payer D-Day: Sea internal.</p>
    </header>

    ${personaBlock()}
    ${transcriptBlock()}
    ${aboveFoldLedger()}

    <div class="step-chips" role="list" aria-label="Các bước">
      ${CHIP_LABELS.map(
        (label, i) =>
          `<span class="${chipClass(i)}" role="listitem">${label}</span>`
      ).join("")}
    </div>

    ${progressBanner()}
    ${blastRadiusCard()}
    ${demoDerivedMetricsHtml()}
    ${stageHonestyBlock()}

    <section class="panel">
      <h3>Domain</h3>
      <div class="domain-pills">
        <button type="button" data-domain="accounting" class="${domain === "accounting" ? "active" : ""}">Kế toán · hero</button>
        <button type="button" data-domain="sales" class="secondary-domain backup-domain ${domain === "sales" ? "active" : ""}" title="Backup domain — không phải hero">Bán hàng · backup domain</button>
      </div>
      <p class="hint">Hero = kế toán tiểu thương. Sales = <strong>backup domain</strong> (không ngang hàng trên pitch).</p>
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
        <button type="button" class="secondary" id="btn-regen" ${busy ? "disabled" : ""}>Tạo lại</button>
        <button type="button" class="reset" id="btn-reset" ${busy ? "disabled" : ""}>Reset · seed #${seed}</button>
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
      // Domain switch = full reset, no chip animation (Kyle-B2)
      seed += 1;
      approved = false;
      lastResult = null;
      webAudit.length = 0;
      lastRunMs = null;
      lastStepMs = [];
      animateChips = false;
      progress = "ready";
      render();
    });
  });

  app.querySelector("#btn-approve")?.addEventListener("click", () => {
    if (busy) return;
    approved = true;
    webAudit.push({
      action: "human_approve",
      at: new Date().toISOString(),
      detail: `${workflow.id}@${workflow.version}`,
      workflowId: workflow.id,
      workflowVersion: workflow.version,
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
      workflowId: workflow.id,
      workflowVersion: workflow.version,
    });
    render();
  });
  app.querySelector("#btn-run")?.addEventListener("click", () => {
    if (busy) return;
    void runWithProgress();
  });
  app.querySelector("#btn-regen")?.addEventListener("click", () => {
    if (busy) return;
    void simulateGenerateJudge();
  });
  app.querySelector("#btn-reset")?.addEventListener("click", () => {
    if (busy) return;
    fullReset();
  });
}

/** Kyle-B3: full reset + visible seed #N (no auto progress animation). */
function fullReset(): void {
  seed += 1;
  approved = false;
  lastResult = null;
  webAudit.length = 0;
  lastRunMs = null;
  lastStepMs = [];
  animateChips = false;
  progress = "ready";
  render();
}

/** Kyle-B2: progress chips/animation only on explicit Tạo lại. */
async function simulateGenerateJudge(): Promise<void> {
  animateChips = true;
  progress = "generating";
  render();
  await sleep(450);
  progress = "judging";
  render();
  await sleep(450);
  progress = "ready";
  animateChips = false;
  render();
}

async function runWithProgress(): Promise<void> {
  progress = "running";
  render();
  await sleep(350);
  const t0 = performance.now();
  lastResult = runDomain(domain, approved);
  lastRunMs = Math.round(performance.now() - t0);
  // Per-step ms proxy from runner (single-threaded; distribute by step count)
  const n = Math.max(1, lastResult.steps.length);
  const per = Math.max(0, Math.round((lastRunMs / n) * 100) / 100);
  lastStepMs = lastResult.steps
    .filter((s) => s.kind === "compute" || s.kind === "persist" || !s.skipped)
    .map((s) => ({ stepId: s.stepId, kind: s.kind, ms: per }));
  const wf = workflowFor(domain);
  const at = new Date().toISOString();
  if (!approved || !lastResult.ok) {
    webAudit.push({
      action: "approve_fail",
      at,
      detail: `${lastResult.workflowId} — gate blocked persist`,
      workflowId: wf.id,
      workflowVersion: wf.version,
    });
  } else {
    webAudit.push({
      action: "approve_ok",
      at,
      detail: `${lastResult.workflowId} human Duyệt`,
      workflowId: wf.id,
      workflowVersion: wf.version,
    });
    webAudit.push({
      action: "persist_ok",
      at,
      detail: `${lastResult.workflowId} ledger/pipeline persisted`,
      workflowId: wf.id,
      workflowVersion: wf.version,
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
    // Compact echo under Chạy — primary numbers already above-fold (Kyle-B1)
    cards = `
      <p class="hint">Chi tiết đơn: ${fmtVnd(ledger.saleTotalVnd)} · YTD trước ${fmtVnd(ledger.ytdBeforeVnd)} (xem panel trên fold).</p>`;
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
      · seed #${seed}
    </p>
    ${cards}
    ${auditHtml}
    <details class="tech">
      <summary>Log bước runtime</summary>
      <ul class="step-list">${steps}</ul>
    </details>
  `;
}

// Initial paint: ready state, no generate animation (Kyle-B2)
render();
