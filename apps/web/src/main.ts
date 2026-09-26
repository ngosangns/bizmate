import "./style.css";
import {
  type Domain,
  verdictFor,
  vendorDayFixture,
  pipelineFixture,
  workflowFor,
} from "./samples.js";
import { runDomain, type RunResult } from "./runner.js";
import {
  createCheckout,
  honestyBanner,
  listPlans,
  stubCharge,
  type BillingMode,
  type CheckoutResult,
  type StubChargeResult,
} from "@bizmate/billing";
import {
  alertVariants,
  badgeVariants,
  buttonVariants,
  card,
  cn,
} from "./ui/index.js";

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
/** BR2/BR3: last sandbox/stub checkout or cost-center stub. */
let lastBilling:
  | { kind: "checkout"; result: CheckoutResult }
  | { kind: "stub"; result: StubChargeResult }
  | null = null;
let billingMode: BillingMode = "stripe_test";

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
  let msg = "";
  switch (progress) {
    case "generating":
      msg = "⏳ Đang tạo workflow…";
      break;
    case "judging":
      msg = "⚖️ Đang chấm workflow (Laya offline)…";
      break;
    case "running":
      msg = "▶️ Đang chạy runtime deterministic…";
      break;
    default:
      return "";
  }
  return `<div class="${alertVariants({ variant: "info", className: "mb-4 font-medium" })}" role="status">${msg}</div>`;
}

function personaBlock(): string {
  if (domain === "accounting") {
    return `
      <div class="${card.root("mb-4 overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card")}">
        <div class="${card.content("flex gap-4 items-start")}">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl ring-1 ring-primary/30" aria-hidden="true">👵</div>
          <div class="min-w-0 space-y-1">
            <h2 class="text-base font-semibold tracking-tight sm:text-lg">Bà Lan · tiểu thương chợ An Đông</h2>
            <p class="text-sm text-muted-foreground">Ghi sổ bán hàng bằng giọng nói · theo dõi ngưỡng miễn thuế 1 tỷ ₫ (ND-141).</p>
            <p class="text-sm font-semibold text-warn">Chủ sạp biết mình vừa vượt 1 tỷ <strong>trước khi</strong> bị phạt.</p>
          </div>
        </div>
      </div>`;
  }
  return `
    <div class="${card.root("mb-4")}">
      <div class="${card.content("flex gap-4 items-start")}">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl ring-1 ring-border" aria-hidden="true">🏪</div>
        <div class="min-w-0 space-y-1">
          <h2 class="text-base font-semibold tracking-tight sm:text-lg">
            Pipeline bán hàng SME
            <span class="${badgeVariants({ variant: "secondary", className: "ml-1.5 align-middle" })}">backup domain</span>
          </h2>
          <p class="text-sm text-muted-foreground">Lead → báo giá → đơn · domain phụ — không phải hero sân khấu.</p>
        </div>
      </div>
    </div>`;
}

function transcriptBlock(): string {
  if (domain === "accounting") {
    return `
      <div class="${card.root("mb-4")}">
        <div class="${card.content()}">
          <div class="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Ghi âm hôm nay · <span class="${badgeVariants({ variant: "default", className: "font-mono" })}">seed #${seed}</span>
          </div>
          <blockquote class="border-l-2 border-primary pl-4 text-base font-medium leading-snug sm:text-lg">
            “${escapeHtml(vendorDayFixture.transcript)}”
          </blockquote>
        </div>
      </div>`;
  }
  const names = pipelineFixture.leads.map((l) => l.name).join(", ");
  return `
    <div class="${card.root("mb-4")}">
      <div class="${card.content()}">
        <div class="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Pipeline · <span class="${badgeVariants({ variant: "default", className: "font-mono" })}">seed #${seed}</span>
        </div>
        <blockquote class="border-l-2 border-primary pl-4 text-base font-medium leading-snug">
          ${pipelineFixture.leads.length} lead: ${escapeHtml(names)}
        </blockquote>
      </div>
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
    <section class="${card.root("mb-4 border-warn/40 bg-gradient-to-b from-warn/5 to-card")}" aria-live="polite">
      <div class="${card.content()}">
        <h2 class="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold tracking-tight sm:text-base">
          Sổ cái · trên fold
          <span class="${badgeVariants({ variant: "warn" })}">sau Chạy</span>
        </h2>
        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div class="metric-tile"><dt>YTD sau</dt><dd>${fmtVnd(data.ytdAfterVnd)}</dd></div>
          <div class="metric-tile"><dt>Còn miễn thuế</dt><dd>${fmtVnd(data.remainingExemptionVnd)}</dd></div>
          <div class="metric-tile ${crossed ? "highlight" : "ok-highlight"}">
            <dt>Ngưỡng 1 tỷ</dt>
            <dd>${crossed ? "⚠️ ĐÃ VƯỢT" : "Chưa vượt"} · ghi sổ=${persisted ? "có" : "không"}</dd>
          </div>
        </div>
        ${
          crossed
            ? `<div class="${alertVariants({ variant: "warn", className: "mt-3 font-semibold" })}">Chủ sạp biết mình vừa vượt 1 tỷ <strong>trước khi</strong> bị phạt — Bà Lan vừa vượt ngưỡng miễn thuế 1 tỷ ₫ (tính bằng code, không phải LLM).</div>`
            : ""
        }
      </div>
    </section>`;
}

function blastRadiusCard(): string {
  const wf = workflowFor(domain);
  const affected = webAudit.filter(
    (e) =>
      e.workflowId === wf.id &&
      e.workflowVersion === wf.version
  ).length;
  const y = affected > 0 ? affected : webAudit.length;
  return `
    <section class="${card.root("mb-4")}">
      <div class="${card.content()}">
        <h2 class="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
          Blast-radius
          <span class="${badgeVariants({ variant: "secondary" })}">demo-derived</span>
        </h2>
        <p class="text-sm sm:text-[0.95rem]">
          unpin workflow version <code>${escapeHtml(wf.id)}@${escapeHtml(wf.version)}</code>
          → <strong>${y}</strong> executions affected
        </p>
        <p class="mt-2 text-xs text-muted-foreground">
          Đếm từ audit phiên (mirror CLI <code>apps/runtime/.audit/events.jsonl</code>) — rollback trước khi BGH hỏi production blast.
        </p>
      </div>
    </section>`;
}

function demoDerivedMetricsHtml(): string {
  const approveFail = webAudit.filter((e) => e.action === "approve_fail").length;
  const approveOk = webAudit.filter((e) => e.action === "approve_ok").length;
  const persistOk = webAudit.filter((e) => e.action === "persist_ok").length;
  const ms = lastRunMs != null ? `${lastRunMs} ms` : "—";
  const stepLines =
    lastStepMs.length > 0
      ? `<ul class="mt-3 space-y-1 font-mono text-xs text-muted-foreground">${lastStepMs
          .map(
            (s) =>
              `<li>${escapeHtml(s.kind)}:${escapeHtml(s.stepId)} ${s.ms}ms/step</li>`
          )
          .join("")}</ul>`
      : "";
  return `
    <section class="${card.root("mb-4")}">
      <div class="${card.content()}">
        <h2 class="mb-1 flex flex-wrap items-center gap-2 text-sm font-semibold">
          Chỉ số
          <span class="${badgeVariants({ variant: "secondary" })}">demo-derived</span>
        </h2>
        <p class="mb-3 text-xs text-muted-foreground">Từ audit phiên offline — không phải baseline field study.</p>
        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div class="metric-tile"><dt>approve_fail</dt><dd>${approveFail}</dd></div>
          <div class="metric-tile"><dt>approve_ok</dt><dd>${approveOk}</dd></div>
          <div class="metric-tile"><dt>persist_ok</dt><dd>${persistOk}</dd></div>
          <div class="metric-tile"><dt>Last run</dt><dd>${ms}</dd></div>
        </div>
        ${stepLines}
        <p class="mt-3 font-mono text-xs text-muted-foreground">HOT-PATH (demo-derived): last run ${ms}${
          lastStepMs.length
            ? ` · ${lastStepMs.map((s) => `${s.kind} ${s.ms}ms/step`).join(" · ")}`
            : ""
        }</p>
        <p class="mt-1 font-mono text-xs font-semibold text-warn">EM blocked auto-done on money task</p>
        <p class="mt-1 text-xs text-muted-foreground">Payer D-Day: <strong>Sea internal tooling</strong> · SME = roadmap.</p>
      </div>
    </section>`;
}

function pricingPanel(): string {
  const plans = listPlans("bizmate");
  const bannerStripe = honestyBanner("stripe_test");
  const bannerStub = honestyBanner("offline_stub");
  const rows = plans
    .map((p) => {
      const road = p.roadmapOnly
        ? `<span class="${badgeVariants({ variant: "roadmap" })}">roadmap</span>`
        : `<span class="${badgeVariants({ variant: "ok" })}">D-Day</span>`;
      return `<li class="rounded-lg border border-border bg-background/40 p-4">
        <div class="mb-1 flex flex-wrap items-baseline gap-2">
          <strong class="text-sm">${escapeHtml(p.nameVi)}</strong> ${road}
          <span class="ml-auto font-mono text-sm text-primary">${escapeHtml(p.priceDisplay)}</span>
        </div>
        <p class="text-xs text-muted-foreground">${escapeHtml(p.honestyNote)}</p>
        <ul class="mt-2 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">${p.features
          .map((f) => `<li>${escapeHtml(f)}</li>`)
          .join("")}</ul>
      </li>`;
    })
    .join("");

  let outcome = "";
  if (lastBilling?.kind === "checkout") {
    const r = lastBilling.result;
    outcome = `<div class="mt-4 rounded-lg border border-border bg-background/50 p-3" role="status">
      <p class="${alertVariants({ variant: "warn", className: "mb-2 font-semibold" })}">${escapeHtml(r.honestyBanner)}</p>
      <p class="text-xs text-muted-foreground"><code>${escapeHtml(r.sessionId)}</code> · ok=${r.ok} · stub=${r.stub}
      ${r.url ? ` · <span class="break-all font-mono text-[0.75rem]">${escapeHtml(r.url)}</span>` : ""}
      ${r.costCenter ? ` · CC=${escapeHtml(r.costCenter)}` : ""}</p>
      <p class="mt-1 text-xs text-muted-foreground">${escapeHtml(r.detail)}</p>
    </div>`;
  } else if (lastBilling?.kind === "stub") {
    const r = lastBilling.result;
    outcome = `<div class="mt-4 rounded-lg border border-border bg-background/50 p-3" role="status">
      <p class="${alertVariants({ variant: "warn", className: "mb-2 font-semibold" })}">${escapeHtml(r.honestyBanner)}</p>
      <p class="text-xs text-muted-foreground"><code>${escapeHtml(r.chargeId)}</code> · CC=${escapeHtml(r.costCenter)}</p>
      <p class="mt-1 text-xs text-muted-foreground">${escapeHtml(r.detail)}</p>
    </div>`;
  }

  return `
    <section class="${card.root("mb-4")}" id="pricing">
      <div class="${card.content()}">
        <h2 class="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
          Giá / subscription
          <span class="${badgeVariants({ variant: "secondary" })}">BR2 · fixture</span>
        </h2>
        <p class="mb-3 text-xs text-muted-foreground">
          Payer D-Day: <strong>Sea internal tooling</strong> (cost-center). SME Pro = roadmap. Giá = fixture — không phải catalog live.
        </p>
        <ul class="mb-4 flex list-none flex-col gap-3 p-0">${rows}</ul>
        <div class="mb-4 flex flex-col gap-2">
          <p class="${alertVariants({ variant: "warn", className: "font-semibold" })}">${escapeHtml(bannerStub)}</p>
          <p class="${alertVariants({ variant: "warn", className: "font-semibold" })}">${escapeHtml(bannerStripe)}</p>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" class="${buttonVariants()}" id="btn-sea-stub">Cost-center Sea (stub)</button>
          <button type="button" class="${buttonVariants({ variant: "outline" })}" id="btn-stripe-sme">Checkout SME · Stripe TEST</button>
          <button type="button" class="${buttonVariants({ variant: "outline" })}" id="btn-stripe-codex">Checkout Codex · Stripe TEST</button>
        </div>
        <p class="mt-3 text-xs text-muted-foreground">
          Mode hiện tại CTA Stripe: <code>${billingMode}</code> · Sea path luôn <code>offline_stub</code>.
        </p>
        ${outcome}
      </div>
    </section>`;
}

function stageHonestyBlock(): string {
  return `
    <section class="${card.root("mb-4")}">
      <div class="${card.content()}">
        <h3 class="mb-2 text-sm font-semibold">Sân khấu · Codex honesty</h3>
        <p class="text-xs text-muted-foreground">
          EM board live: <strong>${EM_BOARD_DONE} done / ${EM_BOARD_TODO} todo</strong> (từ <code>apps/em/board.json</code>).
        </p>
        <div class="${alertVariants({ variant: "warn", className: "mt-3 border-l-4 border-l-warn" })}">
          <strong>Stub-fail honesty:</strong>
          <code>BIZMATE_MODE=live</code> Mate/Judge SLM = heuristics — sân khấu demo <em>offline rules</em>, không claim frontier model.
        </div>
      </div>
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
    <header class="mb-6 space-y-2">
      <h1 class="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
        Biz Mate
        <span class="${badgeVariants({ variant: "default" })}">offline</span>
        <span class="${badgeVariants({ variant: "outline", className: "font-mono" })}">seed #${seed}</span>
      </h1>
      <p class="text-sm text-muted-foreground sm:text-[0.95rem]">
        Bà Lan · sổ 1 tỷ ₫. AI đề xuất → code kiểm → người quyết. Payer D-Day: Sea internal.
      </p>
    </header>

    ${personaBlock()}
    ${transcriptBlock()}
    ${aboveFoldLedger()}

    <div class="mb-4 flex flex-wrap gap-2" role="list" aria-label="Các bước">
      ${CHIP_LABELS.map(
        (label, i) =>
          `<span class="${chipClass(i)}" role="listitem">${label}</span>`
      ).join("")}
    </div>

    ${progressBanner()}
    ${blastRadiusCard()}
    ${demoDerivedMetricsHtml()}
    ${stageHonestyBlock()}
    ${pricingPanel()}

    <section class="${card.root("mb-4")}">
      <div class="${card.content()}">
        <h3 class="${card.title("mb-3")}">Domain</h3>
        <div class="mb-2 flex flex-col gap-2 sm:flex-row">
          <button type="button" data-domain="accounting"
            class="${cn(
              buttonVariants({
                variant: domain === "accounting" ? "default" : "outline",
                className: "flex-1",
              })
            )}">Kế toán · hero</button>
          <button type="button" data-domain="sales"
            class="${cn(
              buttonVariants({
                variant: domain === "sales" ? "secondary" : "dashed",
                className: "flex-1 text-xs opacity-70 sm:text-sm",
              }),
              domain === "sales" && "opacity-90"
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

    <section class="${card.root("mb-4")}">
      <div class="${card.content()}">
        <h3 class="${card.title("mb-3")}">Người duyệt (HITL)</h3>
        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="button" class="${buttonVariants()}" id="btn-approve" ${busy ? "disabled" : ""}>${approved ? "Đã duyệt ✓" : "Duyệt workflow"}</button>
          <button type="button" class="${buttonVariants({ variant: "outline" })}" id="btn-revoke" ${approved && !busy ? "" : "disabled"}>Thu hồi</button>
          <span class="${cn(
            "text-sm",
            approved ? "font-medium text-ok" : "text-muted-foreground"
          )}">
            ${approved ? "Đã mở khóa ghi sổ" : "Chờ duyệt trước khi persist"}
          </span>
        </div>
      </div>
    </section>

    <section class="${card.root("mb-4")}">
      <div class="${card.content()}">
        <h3 class="${card.title("mb-3")}">Chạy offline</h3>
        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" class="${buttonVariants()}" id="btn-run" ${busy ? "disabled" : ""}>Chạy ${domain === "accounting" ? "sổ kế toán" : "pipeline"}</button>
          <button type="button" class="${buttonVariants({ variant: "outline" })}" id="btn-regen" ${busy ? "disabled" : ""}>Tạo lại</button>
          <button type="button" class="${buttonVariants({ variant: "dashed", size: "sm" })}" id="btn-reset" ${busy ? "disabled" : ""}>Reset · seed #${seed}</button>
        </div>
        <div id="run-out" class="mt-3">${lastResult ? renderResult(lastResult) : '<p class="text-xs text-muted-foreground">Bấm Chạy để ghi sổ / cập nhật pipeline (fixture offline).</p>'}</div>
      </div>
    </section>

    <details class="mt-2 rounded-lg border border-border bg-background/40 p-3 open:pb-4">
      <summary class="cursor-pointer text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
        Chi tiết kỹ thuật (workflow + verdict JSON)
      </summary>
      <p class="mt-2 text-xs text-muted-foreground">Workflow ${escapeHtml(workflow.id)} v${escapeHtml(workflow.version)}</p>
      <pre class="mt-2 max-h-56 overflow-auto rounded-md bg-background p-3 font-mono text-[0.7rem] leading-snug text-muted-foreground">${escapeHtml(JSON.stringify(workflow, null, 2))}</pre>
      <pre class="mt-2 max-h-56 overflow-auto rounded-md bg-background p-3 font-mono text-[0.7rem] leading-snug text-muted-foreground">${escapeHtml(JSON.stringify(verdict, null, 2))}</pre>
      <pre class="mt-2 max-h-56 overflow-auto rounded-md bg-background p-3 font-mono text-[0.7rem] leading-snug text-muted-foreground">${escapeHtml(JSON.stringify(fixture, null, 2))}</pre>
    </details>

    <footer class="mt-8 border-t border-border pt-4 text-center">
      <p class="font-mono text-[0.7rem] text-muted-foreground">
        stack: Vite + Tailwind + shadcn-style · Node runtime · TS monorepo (mate / judge / em / runtime / web) · stubs labeled
      </p>
    </footer>
  `;

  app.querySelectorAll<HTMLButtonElement>("[data-domain]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (busy) return;
      domain = btn.dataset.domain as Domain;
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

  app.querySelector("#btn-sea-stub")?.addEventListener("click", () => {
    if (busy) return;
    lastBilling = {
      kind: "stub",
      result: stubCharge({
        appId: "bizmate",
        planId: "bizmate-sea-seat",
        costCenter: "SEA-INTERNAL-TOOLING",
      }),
    };
    render();
  });
  app.querySelector("#btn-stripe-sme")?.addEventListener("click", () => {
    if (busy) return;
    billingMode = "stripe_test";
    lastBilling = {
      kind: "checkout",
      result: createCheckout({
        appId: "bizmate",
        planId: "bizmate-sme-pro",
        mode: "stripe_test",
      }),
    };
    render();
  });
  app.querySelector("#btn-stripe-codex")?.addEventListener("click", () => {
    if (busy) return;
    billingMode = "stripe_test";
    lastBilling = {
      kind: "checkout",
      result: createCheckout({
        appId: "bizmate",
        planId: "bizmate-codex-partnership",
        mode: "stripe_test",
      }),
    };
    render();
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
  lastBilling = null;
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
      const tag = s.ok ? "text-ok" : "text-destructive";
      const label = s.ok ? "ok" : s.skipped ? "skip" : "FAIL";
      const err = s.error ? ` — ${escapeHtml(s.error)}` : "";
      return `<li class="border-b border-border/60 py-1 font-mono text-xs text-muted-foreground"><span class="${tag} font-semibold">[${label}]</span> ${escapeHtml(s.kind)}:${escapeHtml(s.stepId)}${err}</li>`;
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
      <p class="text-xs text-muted-foreground">Chi tiết đơn: ${fmtVnd(ledger.saleTotalVnd)} · YTD trước ${fmtVnd(ledger.ytdBeforeVnd)} (xem panel trên fold).</p>`;
  } else if (result.domain === "sales" && Array.isArray(result.summary.leads)) {
    const leads = result.summary.leads as Array<{
      id: string;
      name: string;
      stage: string;
      amountVnd: number;
    }>;
    cards = `<ul class="mt-2 list-none space-y-1 p-0">${leads
      .map(
        (l) =>
          `<li class="font-mono text-xs text-muted-foreground">${escapeHtml(l.name)} · ${escapeHtml(l.stage)} · ${fmtVnd(l.amountVnd)}</li>`
      )
      .join("")}</ul>`;
  }

  const auditHtml =
    webAudit.length > 0
      ? `<ul class="mt-2 space-y-1 font-mono text-xs text-muted-foreground">${webAudit
          .map(
            (e) =>
              `<li>[${escapeHtml(e.action)}] ${escapeHtml(e.detail)}</li>`
          )
          .join("")}</ul>`
      : "";

  return `
    <p class="mt-3">
      <strong class="${result.ok ? "text-ok" : "text-destructive"} font-semibold">${result.ok ? "THÀNH CÔNG" : "BỊ CHẶN"}</strong>
      · duyệt=${result.approved ? "có" : "không"}
      · seed #${seed}
    </p>
    ${cards}
    ${auditHtml}
    <details class="mt-3 rounded-md border border-border bg-background/40 p-2">
      <summary class="cursor-pointer text-xs text-muted-foreground">Log bước runtime</summary>
      <ul class="mt-2 list-none p-0">${steps}</ul>
    </details>
  `;
}

render();
