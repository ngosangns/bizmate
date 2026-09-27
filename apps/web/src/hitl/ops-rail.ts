/**
 * Ops-rail HITL: Duyệt / Thu hồi / Chạy, chips, run feedback, compact metrics.
 */
import {
  alertVariants,
  badgeVariants,
  buttonVariants,
  card,
  cn,
} from "../ui/index.js";
import { escapeHtml, fmtVnd } from "../format.js";
import { state } from "../state.js";
import type { RunResult } from "../runner.js";
import { aiHonestyStripHtml } from "./ai-badges.js";

const CHIP_LABELS = ["Tạo", "Chấm", "Duyệt", "Chạy"] as const;

function chipClass(index: number): string {
  const { animateChips, progress, approved } = state;
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

export function progressBanner(): string {
  if (!state.animateChips && state.progress !== "running") return "";
  let msg = "";
  switch (state.progress) {
    case "generating":
      msg = "⏳ AI đang đề xuất · Đang tạo workflow…";
      break;
    case "judging":
      msg = "⚖️ đang verify · Đang chấm workflow (Laya offline)…";
      break;
    case "running":
      msg = "▶️ runtime deterministic · không LLM · Đang chạy…";
      break;
    default:
      return "";
  }
  return `<div class="${alertVariants({ variant: "info", className: "mb-4 font-medium" })}" role="status">${msg}</div>`;
}

export function chipRowHtml(): string {
  const parts: string[] = [];
  CHIP_LABELS.forEach((label, i) => {
    if (i > 0) parts.push(`<span class="chip-sep" aria-hidden="true">·</span>`);
    parts.push(`<span class="${chipClass(i)}" role="listitem">${label}</span>`);
  });
  return `<div class="chip-row" role="list" aria-label="Các bước">${parts.join("")}</div>`;
}

function compactMetricsHtml(): string {
  const approveFail = state.webAudit.filter((e) => e.action === "approve_fail").length;
  const approveOk = state.webAudit.filter((e) => e.action === "approve_ok").length;
  const persistOk = state.webAudit.filter((e) => e.action === "persist_ok").length;
  const ms = state.lastRunMs != null ? `${state.lastRunMs} ms` : "—";
  const flash = state.flashMetrics ? " flash" : "";
  return `
    <div id="ops-metrics" class="metric-strip${flash}" aria-live="polite" aria-atomic="true">
      <div class="metric-tile"><dt>Chưa duyệt / chặn</dt><dd>${approveFail}</dd></div>
      <div class="metric-tile"><dt>Đã duyệt</dt><dd>${approveOk}</dd></div>
      <div class="metric-tile"><dt>Ghi sổ OK</dt><dd>${persistOk}</dd></div>
      <div class="metric-tile"><dt>Lần chạy gần nhất</dt><dd>${ms}</dd></div>
    </div>
    <p class="mt-2 font-mono text-[0.7rem] text-muted-foreground">
      audit: approve_fail=${approveFail} · approve_ok=${approveOk} · persist_ok=${persistOk} · Last run ${ms}
    </p>`;
}

function runFeedbackBanner(): string {
  if (!state.lastRunFeedback) return "";
  const ok = state.lastRunFeedback.kind === "ok";
  const variant = ok ? "ok" : "warn";
  return `<div class="${alertVariants({ variant, className: "mt-3 font-semibold" })}" role="status" id="run-feedback">
    ${escapeHtml(state.lastRunFeedback.text)}
  </div>`;
}

export function renderResult(result: RunResult): string {
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
    state.webAudit.length > 0
      ? `<ul class="mt-2 space-y-1 font-mono text-xs text-muted-foreground">${state.webAudit
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
      · seed #${state.seed}
    </p>
    ${cards}
    ${auditHtml}
    <details class="mt-3 rounded-md border border-border bg-background/40 p-2">
      <summary class="cursor-pointer text-xs text-muted-foreground">Log bước runtime</summary>
      <ul class="mt-2 list-none p-0">${steps}</ul>
    </details>
  `;
}

/** R5 Lee+Sid+TA: sticky ops rail — HITL + Chạy + metrics + who-pays above fold. */
export function opsRailHtml(busy: boolean): string {
  const runLabel =
    state.domain === "accounting" ? "Chạy sổ kế toán" : "Chạy pipeline";
  return `
    <section class="ops-rail" id="ops-rail" aria-label="Vận hành HITL">
      <div class="${card.content("space-y-3")}">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-sm font-semibold tracking-tight sm:text-base">Người duyệt (HITL) · chạy sổ</h2>
          <span class="${badgeVariants({ variant: "outline" })}">above fold</span>
        </div>

        ${aiHonestyStripHtml()}

        <div class="rounded-lg border border-border bg-background/50 p-3" id="gtm-strip">
          <p class="text-sm font-semibold">
            Who pays D-Day: <span class="text-primary">Sea internal tooling</span>
            <span class="${badgeVariants({ variant: "secondary", className: "ml-1.5 align-middle" })}">cost-center</span>
          </p>
          <p class="mt-1 text-xs text-muted-foreground">
            Week-2 sketch: <strong>10 Sea pilot seats</strong> · SME Pro = roadmap · không claim live charge.
          </p>
          <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="button" class="${buttonVariants({ size: "sm" })}" id="btn-sea-stub" ${busy ? "disabled" : ""}>Cost-center Sea (STUB)</button>
            <button type="button" class="${buttonVariants({ variant: "outline", size: "sm" })}" id="btn-stripe-sme" ${busy ? "disabled" : ""}>SME · Stripe TEST (SANDBOX)</button>
            <button type="button" class="${buttonVariants({ variant: "outline", size: "sm" })}" id="btn-stripe-codex" ${busy ? "disabled" : ""}>Codex · Stripe TEST (SANDBOX)</button>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="button" class="${buttonVariants()}" id="btn-approve" ${busy ? "disabled" : ""}>${state.approved ? "Đã duyệt ✓" : "Duyệt workflow"}</button>
          <button type="button" class="${buttonVariants({ variant: "outline" })}" id="btn-revoke" ${state.approved && !busy ? "" : "disabled"}>Thu hồi</button>
          <span class="${cn(
            "text-sm",
            state.approved ? "font-medium text-ok" : "text-muted-foreground"
          )}">
            ${state.approved ? "Đã mở khóa ghi sổ" : "Chờ duyệt trước khi persist"}
          </span>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" class="${buttonVariants()}" id="btn-run" ${busy ? "disabled" : ""}>${runLabel}</button>
          <button type="button" class="${buttonVariants({ variant: "outline" })}" id="btn-regen" ${busy ? "disabled" : ""}>Tạo lại</button>
          <button type="button" class="${buttonVariants({ variant: "dashed", size: "sm" })}" id="btn-reset" ${busy ? "disabled" : ""}>Reset · seed #${state.seed}</button>
        </div>

        ${runFeedbackBanner()}
        ${compactMetricsHtml()}
        <div id="run-out">${state.lastResult ? renderResult(state.lastResult) : '<p class="text-xs text-muted-foreground">Bấm <strong>Duyệt</strong> rồi <strong>Chạy</strong> để ghi sổ (fixture offline). Chạy chưa duyệt → bị chặn + Last run vẫn cập nhật.</p>'}</div>
      </div>
    </section>`;
}
