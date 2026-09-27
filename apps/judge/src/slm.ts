/**
 * High-level SLM reviewer for workflow intent alignment.
 *
 * Offline: heuristic keyword reviewer (no network).
 * Soft A4 live: BIZMATE_MODE=live + API key → thin OpenAI summary; findings
 * still merged with heuristics. Missing key / failure → heuristic + honesty
 * note in summary (never invent live success).
 */
import type { JudgeFinding, Workflow } from "@bizmate/contracts";
import {
  callLiveChatCompletion,
  liveLlmFallbackReason,
  resolveOpenAiApiKey,
  type BizMateMode,
} from "@bizmate/core";

export interface SlmReviewResult {
  findings: JudgeFinding[];
  summary: string;
  /** Soft A4 honesty — set when live attempted. */
  liveMeta?: {
    usedLive: boolean;
    fallbackUsed: boolean;
    fallbackReason?: string;
    modelId?: string;
  };
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
 * Soft A4 live SLM: OpenAI short summary + heuristic findings.
 * Score ownership stays with Judge (Laya + deductions) — LLM never publishes.
 */
async function callLiveSlm(
  workflow: Workflow,
  intent: string | undefined,
  env: NodeJS.ProcessEnv
): Promise<SlmReviewResult> {
  const base = reviewHeuristic(workflow, intent);

  if (!resolveOpenAiApiKey(env)) {
    return {
      ...base,
      summary: `${base.summary} · live fallback: missing_api_key`,
      liveMeta: {
        usedLive: false,
        fallbackUsed: true,
        fallbackReason: "missing_api_key",
      },
    };
  }

  try {
    const live = await callLiveChatCompletion(
      `Summarize in 1-2 sentences whether workflow "${workflow.name}" (${workflow.domain}) aligns with intent: ${intent ?? workflow.description ?? workflow.domain}. Mention human-approve gate if relevant. Do NOT invent money/tax numbers.`,
      {
        env,
        system:
          "You are BizMate Judge SLM. High-level review only. Laya owns static errors; you never publish workflows.",
        timeoutMs: 12_000,
      }
    );
    const content = live.content.trim();
    if (!content) {
      return {
        ...base,
        summary: `${base.summary} · live fallback: empty_content`,
        liveMeta: {
          usedLive: false,
          fallbackUsed: true,
          fallbackReason: "empty_content",
        },
      };
    }
    return {
      findings: base.findings,
      summary: `SLM live: ${content}`,
      liveMeta: {
        usedLive: true,
        fallbackUsed: false,
        modelId: live.modelId,
      },
    };
  } catch (err) {
    const reason = String(liveLlmFallbackReason(err));
    return {
      ...base,
      summary: `${base.summary} · live fallback: ${reason}`,
      liveMeta: {
        usedLive: false,
        fallbackUsed: true,
        fallbackReason: reason,
      },
    };
  }
}

/** Mode-aware SLM review entrypoint. */
export async function reviewWithSlm(
  workflow: Workflow,
  options: {
    intent?: string;
    mode?: BizMateMode;
    env?: NodeJS.ProcessEnv;
  } = {}
): Promise<SlmReviewResult> {
  const mode = options.mode ?? "offline";
  const env = options.env ?? process.env;
  if (mode === "live") {
    return callLiveSlm(workflow, options.intent, env);
  }
  return reviewHeuristic(workflow, options.intent);
}
