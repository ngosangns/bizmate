/**
 * High-level SLM reviewer for workflow intent alignment.
 *
 * Offline: heuristic keyword reviewer (no network).
 * Live: currently stubs to the same heuristics — plug a real SLM
 *       (OpenAI / local model) at `callLiveSlm` below when BIZMATE_MODE=live.
 */
import type { JudgeFinding, Workflow } from "@bizmate/contracts";
import type { BizMateMode } from "@bizmate/core";

export interface SlmReviewResult {
  findings: JudgeFinding[];
  summary: string;
}

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "to",
  "for",
  "in",
  "on",
  "with",
  "by",
  "is",
  "are",
  "be",
  "as",
  "at",
  "from",
  "that",
  "this",
  "it",
  "into",
  "via",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function workflowCorpus(workflow: Workflow): string {
  const parts = [
    workflow.name,
    workflow.description ?? "",
    ...workflow.steps.map((s) => `${s.kind} ${s.label}`),
    ...workflow.invariants.map((i) => i.expression),
  ];
  return parts.join(" ");
}

/**
 * Heuristic keyword reviewer: intent tokens should appear in
 * workflow.name / description / steps (and invariants as soft signal).
 */
export function reviewHeuristic(
  workflow: Workflow,
  intent?: string
): SlmReviewResult {
  const findings: JudgeFinding[] = [];
  const intentText =
    intent?.trim() ||
    workflow.description?.trim() ||
    `${workflow.domain} ${workflow.name}`;

  const intentTokens = [...new Set(tokenize(intentText))];
  const corpus = workflowCorpus(workflow).toLowerCase();

  const missing = intentTokens.filter((t) => !corpus.includes(t));
  const coverage =
    intentTokens.length === 0
      ? 1
      : (intentTokens.length - missing.length) / intentTokens.length;

  if (intentTokens.length > 0 && coverage < 0.4) {
    findings.push({
      severity: "warn",
      code: "SLM_INTENT_MISMATCH",
      message: `Workflow corpus poorly covers stated intent (coverage ${Math.round(coverage * 100)}%). Missing cues: ${missing.slice(0, 8).join(", ")}`,
      path: "name",
    });
  } else if (missing.length > 0 && coverage < 0.7) {
    findings.push({
      severity: "info",
      code: "SLM_INTENT_PARTIAL",
      message: `Partial intent alignment (coverage ${Math.round(coverage * 100)}%). Consider reflecting: ${missing.slice(0, 5).join(", ")}`,
    });
  }

  // High-level: encourage approve/persist hygiene signal in narrative
  const kinds = new Set(workflow.steps.map((s) => s.kind));
  if (kinds.has("persist") && !kinds.has("approve")) {
    findings.push({
      severity: "info",
      code: "SLM_MISSING_HUMAN_GATE",
      message:
        "Intent review: persist without approve suggests the agent may have dropped the human decision gate",
    });
  }

  const summary =
    findings.length === 0
      ? `SLM heuristic: intent alignment looks healthy (coverage ${Math.round(coverage * 100)}%).`
      : `SLM heuristic: ${findings.length} high-level finding(s); coverage ${Math.round(coverage * 100)}%.`;

  return { findings, summary };
}

/**
 * Live SLM hook. Replace the body with a real model call
 * (e.g. OpenAI chat completions) that returns findings + summary.
 * Until then, offline heuristics keep demos deterministic.
 */
async function callLiveSlm(
  workflow: Workflow,
  intent?: string
): Promise<SlmReviewResult> {
  // TODO(live-slm): POST workflow + intent to SLM; map response → SlmReviewResult.
  // Keep assertValid(JudgeVerdict) at the outer judge boundary.
  return reviewHeuristic(workflow, intent);
}

/** Mode-aware SLM review entrypoint. */
export async function reviewWithSlm(
  workflow: Workflow,
  options: { intent?: string; mode?: BizMateMode } = {}
): Promise<SlmReviewResult> {
  const mode = options.mode ?? "offline";
  if (mode === "live") {
    return callLiveSlm(workflow, options.intent);
  }
  return reviewHeuristic(workflow, options.intent);
}
