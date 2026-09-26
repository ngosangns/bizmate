/**
 * Persona / transcript / blast / stage honesty (details dưới fold).
 */
import { alertVariants, badgeVariants, card } from "./index.js";
import { escapeHtml } from "../format.js";
import { state } from "../state.js";
import {
  pipelineFixture,
  vendorDayFixture,
  workflowFor,
} from "../samples.js";
import { demoDerivedMetricsHtml } from "./ledger-panel.js";

/** Son-B1: live board counts from apps/em/board.json (7 done / 3 todo) — do not invent. */
const EM_BOARD_DONE = 7;
const EM_BOARD_TODO = 3;

export function personaBlockHtml(): string {
  if (state.domain === "accounting") {
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

export function transcriptBlockHtml(): string {
  if (state.domain === "accounting") {
    return `
      <div class="${card.root("mb-4")}">
        <div class="${card.content()}">
          <div class="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Ghi âm hôm nay · <span class="${badgeVariants({ variant: "default", className: "font-mono" })}">seed #${state.seed}</span>
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
          Pipeline · <span class="${badgeVariants({ variant: "default", className: "font-mono" })}">seed #${state.seed}</span>
        </div>
        <blockquote class="border-l-2 border-primary pl-4 text-base font-medium leading-snug">
          ${pipelineFixture.leads.length} lead: ${escapeHtml(names)}
        </blockquote>
      </div>
    </div>`;
}

function blastRadiusCard(): string {
  const wf = workflowFor(state.domain);
  const affected = state.webAudit.filter(
    (e) =>
      e.workflowId === wf.id &&
      e.workflowVersion === wf.version
  ).length;
  const y = affected > 0 ? affected : state.webAudit.length;
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

/** Collapsed technical details dưới fold. */
export function stageDetailsHtml(
  workflowJson: string,
  verdictJson: string,
  fixtureJson: string,
  workflowLabel: string
): string {
  return `
    <details class="mt-2 rounded-lg border border-border bg-background/40 p-3 open:pb-4">
      <summary class="cursor-pointer text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
        Chi tiết kỹ thuật (EM / blast-radius / metrics / JSON) — dưới fold
      </summary>
      ${blastRadiusCard()}
      ${demoDerivedMetricsHtml()}
      ${stageHonestyBlock()}
      <p class="mt-2 text-xs text-muted-foreground">${escapeHtml(workflowLabel)}</p>
      <pre class="mt-2 max-h-56 overflow-auto rounded-md bg-background p-3 font-mono text-[0.7rem] leading-snug text-muted-foreground">${escapeHtml(workflowJson)}</pre>
      <pre class="mt-2 max-h-56 overflow-auto rounded-md bg-background p-3 font-mono text-[0.7rem] leading-snug text-muted-foreground">${escapeHtml(verdictJson)}</pre>
      <pre class="mt-2 max-h-56 overflow-auto rounded-md bg-background p-3 font-mono text-[0.7rem] leading-snug text-muted-foreground">${escapeHtml(fixtureJson)}</pre>
    </details>`;
}
