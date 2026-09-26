import "./style.css";

/** Adv · BizMate R6 — thin mount/render/events over split modules. */
import {
  type Domain,
  verdictFor,
  vendorDayFixture,
  pipelineFixture,
  workflowFor,
} from "./samples.js";
import { runDomain } from "./runner.js";
import { badgeVariants, buttonVariants, card, cn } from "./ui/index.js";
import { escapeHtml, sleep } from "./format.js";
import { resetSessionFields, state } from "./state.js";
import {
  chipRowHtml,
  opsRailHtml,
  progressBanner,
} from "./hitl/ops-rail.js";
import {
  applySeaStubCharge,
  applyStripeCheckout,
  pricingPanelHtml,
} from "./ui/pricing-panel.js";
import { aboveFoldLedgerHtml } from "./ui/ledger-panel.js";
import {
  personaBlockHtml,
  stageDetailsHtml,
  transcriptBlockHtml,
} from "./ui/stage-details.js";

const app = document.querySelector("#app")!;

function isBusy(): boolean {
  return (
    state.progress === "generating" ||
    state.progress === "judging" ||
    state.progress === "running"
  );
}

function render(): void {
  const workflow = workflowFor(state.domain);
  const verdict = verdictFor(state.domain);
  const fixture =
    state.domain === "accounting" ? vendorDayFixture : pipelineFixture;
  const busy = isBusy();

  app.innerHTML = `
    <header class="mb-6 space-y-2">
      <h1 class="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
        Biz Mate
        <span class="${badgeVariants({ variant: "default" })}">offline</span>
        <span class="${badgeVariants({ variant: "outline", className: "font-mono" })}">seed #${state.seed}</span>
      </h1>
      <p class="text-sm text-muted-foreground sm:text-[0.95rem]">
        Bà Lan · sổ 1 tỷ ₫. AI đề xuất → code kiểm → người quyết. Payer D-Day: Sea internal.
      </p>
    </header>

    ${personaBlockHtml()}
    ${transcriptBlockHtml()}
    ${chipRowHtml()}
    ${progressBanner()}
    ${opsRailHtml(busy)}
    ${aboveFoldLedgerHtml()}

    ${pricingPanelHtml()}

    <section class="${card.root("mb-4")}">
      <div class="${card.content()}">
        <h3 class="${card.title("mb-3")}">Domain</h3>
        <div class="mb-2 flex flex-col gap-2 sm:flex-row">
          <button type="button" data-domain="accounting"
            class="${cn(
              buttonVariants({
                variant: state.domain === "accounting" ? "default" : "outline",
                className: "flex-1",
              })
            )}">Kế toán · hero</button>
          <button type="button" data-domain="sales"
            class="${cn(
              buttonVariants({
                variant: state.domain === "sales" ? "secondary" : "dashed",
                className: "flex-1 text-xs opacity-70 sm:text-sm",
              }),
              state.domain === "sales" && "opacity-90"
            )}"
            title="Backup domain — không phải hero">Bán hàng · backup domain</button>
        </div>
        <p class="text-xs text-muted-foreground">
          Hero = kế toán tiểu thương. Sales = <strong>backup domain</strong> (không ngang hàng trên pitch).
        </p>
      </div>
    </section>

    <section class="${card.root("mb-4")}">
      <div class="${card.content()}">
        <h3 class="${card.title("mb-3")}">Điểm Judge</h3>
        <div class="inline-flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3">
          <span class="font-mono text-2xl font-bold text-ok">${verdict.score}</span>
          <span class="text-sm text-muted-foreground">${verdict.passed ? "Đạt" : "Chưa đạt"} · ${verdict.mode}</span>
        </div>
        <p class="mt-2 text-xs text-muted-foreground">${escapeHtml(verdict.highLevelSummary ?? "")}</p>
      </div>
    </section>

    ${stageDetailsHtml(
      JSON.stringify(workflow, null, 2),
      JSON.stringify(verdict, null, 2),
      JSON.stringify(fixture, null, 2),
      `Workflow ${workflow.id} v${workflow.version}`
    )}

    <footer class="mt-8 border-t border-border pt-4 text-center">
      <p class="font-mono text-[0.7rem] text-muted-foreground">
        stack: Vite + Tailwind + shadcn-style · Node runtime · TS monorepo (mate / judge / em / runtime / web) · stubs labeled
      </p>
    </footer>
  `;

  wireEvents(busy, workflow.id, workflow.version);
}

function wireEvents(
  busy: boolean,
  workflowId: string,
  workflowVersion: string
): void {
  app.querySelectorAll<HTMLButtonElement>("[data-domain]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (busy) return;
      state.domain = btn.dataset.domain as Domain;
      state.seed += 1;
      resetSessionFields();
      render();
    });
  });

  app.querySelector("#btn-approve")?.addEventListener("click", () => {
    if (busy) return;
    state.approved = true;
    state.webAudit.push({
      action: "human_approve",
      at: new Date().toISOString(),
      detail: `${workflowId}@${workflowVersion}`,
      workflowId,
      workflowVersion,
    });
    render();
  });
  app.querySelector("#btn-revoke")?.addEventListener("click", () => {
    if (busy) return;
    state.approved = false;
    state.lastResult = null;
    state.webAudit.push({
      action: "approve_revoke",
      at: new Date().toISOString(),
      detail: workflowId,
      workflowId,
      workflowVersion,
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

  app.querySelector("#btn-sea-stub")?.addEventListener("click", () => {
    if (busy) return;
    applySeaStubCharge();
    render();
  });
  app.querySelector("#btn-stripe-sme")?.addEventListener("click", () => {
    if (busy) return;
    applyStripeCheckout("bizmate-sme-pro");
    render();
  });
  app.querySelector("#btn-stripe-codex")?.addEventListener("click", () => {
    if (busy) return;
    applyStripeCheckout("bizmate-codex-partnership");
    render();
  });
}

/** Kyle-B3: full reset + visible seed #N (no auto progress animation). */
function fullReset(): void {
  state.seed += 1;
  state.lastBilling = null;
  resetSessionFields();
  render();
}

/** Kyle-B2: progress chips/animation only on explicit Tạo lại. */
async function simulateGenerateJudge(): Promise<void> {
  state.animateChips = true;
  state.progress = "generating";
  render();
  await sleep(450);
  state.progress = "judging";
  render();
  await sleep(450);
  state.progress = "ready";
  state.animateChips = false;
  render();
}

async function runWithProgress(): Promise<void> {
  state.progress = "running";
  render();
  await sleep(350);
  const t0 = performance.now();
  state.lastResult = runDomain(state.domain, state.approved);
  state.lastRunMs = Math.round(performance.now() - t0);
  const n = Math.max(1, state.lastResult.steps.length);
  const per = Math.max(0, Math.round((state.lastRunMs / n) * 100) / 100);
  state.lastStepMs = state.lastResult.steps
    .filter((s) => s.kind === "compute" || s.kind === "persist" || !s.skipped)
    .map((s) => ({ stepId: s.stepId, kind: s.kind, ms: per }));
  const wf = workflowFor(state.domain);
  const at = new Date().toISOString();
  if (!state.approved || !state.lastResult.ok) {
    state.webAudit.push({
      action: "approve_fail",
      at,
      detail: `${state.lastResult.workflowId} — gate blocked persist`,
      workflowId: wf.id,
      workflowVersion: wf.version,
    });
    state.lastRunFeedback = {
      kind: "blocked",
      text: `BỊ CHẶN · chưa Duyệt — approve_fail +1 · Last run ${state.lastRunMs} ms (persist không ghi).`,
    };
  } else {
    state.webAudit.push({
      action: "approve_ok",
      at,
      detail: `${state.lastResult.workflowId} human Duyệt`,
      workflowId: wf.id,
      workflowVersion: wf.version,
    });
    state.webAudit.push({
      action: "persist_ok",
      at,
      detail: `${state.lastResult.workflowId} ledger/pipeline persisted`,
      workflowId: wf.id,
      workflowVersion: wf.version,
    });
    state.lastRunFeedback = {
      kind: "ok",
      text: `THÀNH CÔNG · persist_ok +1 · Last run ${state.lastRunMs} ms.`,
    };
  }
  state.flashMetrics = true;
  state.progress = "done";
  render();
  requestAnimationFrame(() => {
    document
      .getElementById("ops-metrics")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    window.setTimeout(() => {
      state.flashMetrics = false;
    }, 1200);
  });
}

render();
