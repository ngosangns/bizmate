/**
 * Above-fold ledger + demo-derived metrics tiles.
 */
import { alertVariants, badgeVariants, card } from "./index.js";
import { escapeHtml, fmtVnd } from "../format.js";
import { state } from "../state.js";

/** Kyle-B1: YTD / crossed / remaining ABOVE THE FOLD after Chạy. */
export function aboveFoldLedgerHtml(): string {
  if (!state.lastResult) return "";
  const ledger = state.lastResult.summary.ledger as
    | {
        saleTotalVnd: number;
        ytdBeforeVnd: number;
        ytdAfterVnd: number;
        remainingExemptionVnd: number;
        crossedExemption: boolean;
        persisted: boolean;
      }
    | undefined;
  const compute = state.lastResult.summary.compute as
    | {
        saleTotalVnd: number;
        ytdBeforeVnd: number;
        ytdAfterVnd: number;
        remainingExemptionVnd: number;
        crossedExemption: boolean;
      }
    | undefined;
  const data = ledger ?? compute;
  if (!data || state.lastResult.domain !== "accounting") return "";

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

export function demoDerivedMetricsHtml(): string {
  const approveFail = state.webAudit.filter((e) => e.action === "approve_fail").length;
  const approveOk = state.webAudit.filter((e) => e.action === "approve_ok").length;
  const persistOk = state.webAudit.filter((e) => e.action === "persist_ok").length;
  const ms = state.lastRunMs != null ? `${state.lastRunMs} ms` : "—";
  const stepLines =
    state.lastStepMs.length > 0
      ? `<ul class="mt-3 space-y-1 font-mono text-xs text-muted-foreground">${state.lastStepMs
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
          state.lastStepMs.length
            ? ` · ${state.lastStepMs.map((s) => `${s.kind} ${s.ms}ms/step`).join(" · ")}`
            : ""
        }</p>
        <p class="mt-1 font-mono text-xs font-semibold text-warn">EM blocked auto-done on money task</p>
        <p class="mt-1 text-xs text-muted-foreground">Payer D-Day: <strong>Sea internal tooling</strong> · SME = roadmap.</p>
      </div>
    </section>`;
}
