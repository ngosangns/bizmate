import {
  type Domain,
  verdictFor,
  vendorDayFixture,
  pipelineFixture,
  workflowFor,
} from "./samples.js";
import { runDomain, type RunResult } from "./runner.js";

let domain: Domain = "accounting";
let approved = false;
let lastResult: RunResult | null = null;

const app = document.querySelector("#app")!;

function fmtVnd(n: number): string {
  return n.toLocaleString("vi-VN") + " VND";
}

function render(): void {
  const workflow = workflowFor(domain);
  const verdict = verdictFor(domain);
  const fixture =
    domain === "accounting" ? vendorDayFixture : pipelineFixture;

  app.innerHTML = `
    <header>
      <h1>Biz Mate <span class="badge">offline demo</span></h1>
      <p>Generate → Judge → Approve → Run — deterministic runtime, no LLM on money path.</p>
    </header>

    <section class="panel">
      <h2>1. Pick domain</h2>
      <div class="domain-pills">
        <button type="button" data-domain="accounting" class="${domain === "accounting" ? "active" : ""}">Accounting</button>
        <button type="button" data-domain="sales" class="${domain === "sales" ? "active" : ""}">Sales</button>
      </div>
    </section>

    <section class="panel">
      <h2>2. Generated workflow JSON</h2>
      <pre class="json">${escapeHtml(JSON.stringify(workflow, null, 2))}</pre>
    </section>

    <section class="panel">
      <h2>3. Judge verdict</h2>
      <div class="verdict-meta">
        <span><strong>passed</strong><span class="${verdict.passed ? "passed" : "failed"}">${verdict.passed}</span></span>
        <span><strong>score</strong>${verdict.score}</span>
        <span><strong>mode</strong>${verdict.mode}</span>
      </div>
      <pre class="json">${escapeHtml(JSON.stringify(verdict, null, 2))}</pre>
    </section>

    <section class="panel">
      <h2>4. Human approve</h2>
      <div class="actions">
        <button type="button" class="primary" id="btn-approve">${approved ? "Approved ✓" : "Approve workflow"}</button>
        <button type="button" class="secondary" id="btn-revoke" ${approved ? "" : "disabled"}>Revoke</button>
        <span class="status-pill ${approved ? "approved" : ""}" id="approve-status">
          ${approved ? "Status: approved — persist unlocked" : "Status: pending approval"}
        </span>
      </div>
      <p class="hint">Trust boundary: persist / order requires human decide (propose → verify → decide).</p>
    </section>

    <section class="panel">
      <h2>5. Run runtime (embedded fixture)</h2>
      <div class="actions">
        <button type="button" class="primary" id="btn-run">Run ${domain}</button>
      </div>
      <p class="hint">Fixture: <code>${escapeHtml(
        domain === "accounting"
          ? vendorDayFixture.eventId + " — " + vendorDayFixture.transcript
          : pipelineFixture.eventId + " — " + pipelineFixture.leads.length + " leads"
      )}</code></p>
      <div id="run-out">${lastResult ? renderResult(lastResult) : "<p class=\"hint\">Click Run to execute the offline fixture.</p>"}</div>
      <details style="margin-top:0.75rem">
        <summary class="hint" style="cursor:pointer">Embedded fixture JSON</summary>
        <pre class="json" style="margin-top:0.5rem">${escapeHtml(JSON.stringify(fixture, null, 2))}</pre>
      </details>
    </section>
  `;

  app.querySelectorAll<HTMLButtonElement>("[data-domain]").forEach((btn) => {
    btn.addEventListener("click", () => {
      domain = btn.dataset.domain as Domain;
      approved = false;
      lastResult = null;
      render();
    });
  });

  app.querySelector("#btn-approve")?.addEventListener("click", () => {
    approved = true;
    render();
  });
  app.querySelector("#btn-revoke")?.addEventListener("click", () => {
    approved = false;
    lastResult = null;
    render();
  });
  app.querySelector("#btn-run")?.addEventListener("click", () => {
    lastResult = runDomain(domain, approved);
    render();
  });
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
    cards = `
      <div class="ledger-grid">
        <div><dt>Sale total</dt><dd>${fmtVnd(ledger.saleTotalVnd)}</dd></div>
        <div><dt>YTD before</dt><dd>${fmtVnd(ledger.ytdBeforeVnd)}</dd></div>
        <div><dt>YTD after</dt><dd>${fmtVnd(ledger.ytdAfterVnd)}</dd></div>
        <div><dt>Remaining exemption</dt><dd>${fmtVnd(ledger.remainingExemptionVnd)}</dd></div>
        <div><dt>Crossed 1B</dt><dd>${ledger.crossedExemption}</dd></div>
        <div><dt>Persisted</dt><dd>${ledger.persisted}</dd></div>
      </div>`;
  } else if (result.domain === "sales" && Array.isArray(result.summary.leads)) {
    const leads = result.summary.leads as Array<{
      id: string;
      name: string;
      stage: string;
      amountVnd: number;
    }>;
    cards = `<pre class="json" style="margin-top:0.75rem">${escapeHtml(
      JSON.stringify(
        {
          ok: result.ok,
          advanced: result.summary.advanced,
          blocked: result.summary.blocked,
          leads,
        },
        null,
        2
      )
    )}</pre>`;
  }

  return `
    <p style="margin:0.75rem 0 0">
      <strong class="${result.ok ? "passed" : "failed"}">${result.ok ? "PASSED" : "FAILED"}</strong>
      · approved=${result.approved} · ${escapeHtml(result.workflowId)}
    </p>
    <ul class="step-list">${steps}</ul>
    ${cards}
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

render();
