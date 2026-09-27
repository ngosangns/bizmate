/**
 * Round-7 AI ops badges for Mate web HITL rail.
 * Browser defaults to offline_stub (Vite has no BIZMATE_MODE unless injected).
 * Runtime Chạy path stays zero-LLM.
 */
import {
  createAiMeta,
  resolveAiMode,
  type AiProposalMeta,
} from "@bizmate/core";
import { badgeVariants } from "../ui/index.js";
import type { Progress } from "../state.js";
import { state } from "../state.js";

/** Browser: treat as offline_stub unless import.meta.env injects live (default offline). */
export function browserAiMeta(): AiProposalMeta {
  const envLive =
    typeof import.meta !== "undefined" &&
    // Vite optional inject — default undefined → offline
    (import.meta as ImportMeta & { env?: { VITE_BIZMATE_MODE?: string } }).env
      ?.VITE_BIZMATE_MODE === "live";
  const mode = envLive
    ? resolveAiMode({ BIZMATE_MODE: "live" })
    : resolveAiMode({});
  // Propose layer in web demo uses fixture templates
  return createAiMeta(mode === "live" ? "live" : "offline_stub", "template");
}

export interface StageBadge {
  text: string;
  variant: "default" | "ok" | "warn" | "outline" | "secondary";
}

/** Map progress → visible stage badges (VN). */
export function stageBadgesFor(progress: Progress): StageBadge[] {
  const out: StageBadge[] = [];
  switch (progress) {
    case "generating":
      out.push({ text: "AI đang đề xuất", variant: "warn" });
      break;
    case "judging":
      out.push({ text: "AI đang đề xuất", variant: "secondary" });
      out.push({ text: "đang verify…", variant: "outline" });
      break;
    case "idle":
      out.push({ text: "AI đang đề xuất", variant: "outline" });
      break;
    case "ready":
      // After generate+judge (or initial fixture): verified
      out.push({ text: "đã verify", variant: "ok" });
      break;
    case "running":
      out.push({ text: "đã verify", variant: "ok" });
      out.push({ text: "runtime deterministic · không LLM", variant: "outline" });
      break;
    case "done":
      out.push({ text: "đã verify", variant: "ok" });
      out.push({ text: "runtime deterministic · không LLM", variant: "secondary" });
      break;
    default:
      out.push({ text: "đã verify", variant: "ok" });
  }
  return out;
}

/** Honesty strip HTML — stub vs live + stage badges. Always above fold in ops-rail. */
export function aiHonestyStripHtml(): string {
  const meta = browserAiMeta();
  const stages = stageBadgesFor(state.progress);
  const stageHtml = stages
    .map(
      (s) =>
        `<span class="${badgeVariants({ variant: s.variant })}" data-ai-stage="${escapeAttr(s.text)}">${escapeHtml(s.text)}</span>`
    )
    .join("\n          ");
  return `
        <div class="rounded-lg border border-primary/30 bg-primary/5 p-3" id="ai-honesty-strip" data-ai-mode="${meta.mode}" aria-label="AI honesty">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI ops · propose → verify → decide</p>
          <div class="flex flex-wrap items-center gap-2">
          ${stageHtml}
            <span class="${badgeVariants({ variant: "outline" })}" data-ai-honesty="${meta.mode}">${escapeHtml(meta.labelVi)}</span>
          </div>
          <p class="mt-2 text-xs text-muted-foreground">
            Mate đề xuất workflow (template/heuristic stub) · Judge/Ajv verify · bạn Duyệt ·
            <strong>Chạy = zero LLM</strong>. Không giả live thuế / thanh toán.
          </p>
        </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
