/**
 * Shield AI surfaces:
 * - explanation draft ALWAYS present on verdict (offline template = AI-draft stub)
 * - triage assist score NEVER overrides rule verdict (show both)
 * - live mode: try callLiveLlmStub → catch → honest offline_stub fallback (never invent LLM text)
 */
import {
  callLiveLlmStub,
  createAiMeta,
  resolveAiMode,
  type AiMode,
  type AiProposalMeta,
} from "@bizmate/core";
import type { IncomingMessage, ShieldVerdict } from "./engine.js";

export interface AiExplanationDraft {
  elderVi: string;
  familyVi?: string;
  meta: AiProposalMeta;
}

export interface TriageAssist {
  /** Soft 0..1 ranking hint — NOT a risk verdict. */
  score: number;
  rationaleVi: string;
  meta: AiProposalMeta;
  /** Explicit: rule engine owns allow/flag/block. */
  overridesVerdict: false;
}

function offlineDraftMeta(): AiProposalMeta {
  return createAiMeta("offline_stub", "template");
}

function liveFallbackDraftMeta(): AiProposalMeta {
  return {
    ...createAiMeta("offline_stub", "template"),
    labelVi: "AI-draft stub (offline · live fallback)",
    labelEn: "AI-draft stub (offline · live fallback)",
  };
}

function offlineTriageMeta(): AiProposalMeta {
  return createAiMeta("offline_stub", "heuristic");
}

function liveFallbackTriageMeta(): AiProposalMeta {
  return {
    ...createAiMeta("offline_stub", "heuristic"),
    labelVi: "AI triage (stub offline · live fallback)",
    labelEn: "AI triage (offline stub · live fallback)",
  };
}

function buildElderVi(verdict: ShieldVerdict): string {
  if (verdict.action === "allow") {
    return "AI-draft: Tin này trông bình thường theo rule engine.";
  }
  return verdict.elderExplanation.startsWith("Ba/mẹ")
    ? `AI-draft: ${verdict.elderExplanation}`
    : `AI-draft: ${verdict.elderExplanation}`;
}

function buildFamilyVi(verdict: ShieldVerdict): string | undefined {
  return verdict.familyAlert
    ? `AI-draft: ${verdict.familyAlert}`
    : undefined;
}

function computeTriageScore(
  msg: IncomingMessage,
  verdict: ShieldVerdict
): number {
  let score = 0.1;
  if (verdict.action === "flag") score = 0.55;
  if (verdict.action === "block") score = 0.9;
  if (msg.meta?.deepfakeScore !== undefined) {
    score = Math.min(1, score + msg.meta.deepfakeScore * 0.05);
  }
  if (/otp|chuyển\s*tiền|khẩn|gấp/i.test(msg.body)) {
    score = Math.min(1, score + 0.05);
  }
  return Math.round(score * 100) / 100;
}

function buildTriageRationale(
  verdict: ShieldVerdict,
  score: number
): string {
  return verdict.action === "allow"
    ? "AI triage: ưu tiên thấp — rule đang allow."
    : `AI triage: gợi ý xem sớm (score ${score.toFixed(2)}) — verdict rule vẫn là ${verdict.action}.`;
}

/**
 * Sync offline/template draft. When mode=live, returns the same template with
 * honest live-fallback meta (sync cannot await LLM — use draftAiExplanationAsync).
 */
export function draftAiExplanation(
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): AiExplanationDraft {
  const meta =
    mode === "live" ? liveFallbackDraftMeta() : offlineDraftMeta();
  return {
    elderVi: buildElderVi(verdict),
    familyVi: buildFamilyVi(verdict),
    meta,
  };
}

/**
 * Live hook shape: try callLiveLlmStub; on throw → offline template + fallback labels.
 * Never invents live LLM copy when the provider is missing.
 */
export async function draftAiExplanationAsync(
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): Promise<AiExplanationDraft> {
  if (mode !== "live") {
    return draftAiExplanation(verdict, mode);
  }
  try {
    await callLiveLlmStub(
      `Draft elder/family explanation for Shield verdict action=${verdict.action} risk=${verdict.risk}`,
      { modelId: process.env.BIZMATE_LLM_MODEL }
    );
    // Unreachable until a real provider is wired; keep structure for future.
    return {
      elderVi: buildElderVi(verdict),
      familyVi: buildFamilyVi(verdict),
      meta: createAiMeta("live", "llm", {
        modelId: process.env.BIZMATE_LLM_MODEL,
      }),
    };
  } catch {
    return {
      elderVi: buildElderVi(verdict),
      familyVi: buildFamilyVi(verdict),
      meta: liveFallbackDraftMeta(),
    };
  }
}

/**
 * Heuristic triage score from message signals — advisory only.
 * Higher = review sooner. Does not change allow/flag/block.
 * Sync live → honest fallback labels (use triageAssistScoreAsync for real hook).
 */
export function triageAssistScore(
  msg: IncomingMessage,
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): TriageAssist {
  const score = computeTriageScore(msg, verdict);
  const meta =
    mode === "live" ? liveFallbackTriageMeta() : offlineTriageMeta();
  return {
    score,
    rationaleVi: buildTriageRationale(verdict, score),
    meta,
    overridesVerdict: false,
  };
}

/** Live triage hook: try LLM stub → catch → heuristic offline with fallback meta. */
export async function triageAssistScoreAsync(
  msg: IncomingMessage,
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): Promise<TriageAssist> {
  if (mode !== "live") {
    return triageAssistScore(msg, verdict, mode);
  }
  const score = computeTriageScore(msg, verdict);
  const rationaleVi = buildTriageRationale(verdict, score);
  try {
    await callLiveLlmStub(
      `Triage assist score hint for Shield message ${msg.id} (advisory only; overridesVerdict=false)`,
      { modelId: process.env.BIZMATE_LLM_MODEL }
    );
    return {
      score,
      rationaleVi,
      meta: createAiMeta("live", "llm", {
        modelId: process.env.BIZMATE_LLM_MODEL,
      }),
      overridesVerdict: false,
    };
  } catch {
    return {
      score,
      rationaleVi,
      meta: liveFallbackTriageMeta(),
      overridesVerdict: false,
    };
  }
}

/** Bundle AI drafts onto a verdict without mutating risk/action (sync). */
export function attachAiDrafts(
  msg: IncomingMessage,
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): ShieldVerdict & {
  aiExplanation: AiExplanationDraft;
  triageAssist: TriageAssist;
} {
  return {
    ...verdict,
    aiExplanation: draftAiExplanation(verdict, mode),
    triageAssist: triageAssistScore(msg, verdict, mode),
  };
}

/** Async bundle — uses live hook with safe fallback; never mutates risk/action. */
export async function attachAiDraftsAsync(
  msg: IncomingMessage,
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): Promise<
  ShieldVerdict & {
    aiExplanation: AiExplanationDraft;
    triageAssist: TriageAssist;
  }
> {
  const [aiExplanation, triageAssist] = await Promise.all([
    draftAiExplanationAsync(verdict, mode),
    triageAssistScoreAsync(msg, verdict, mode),
  ]);
  return {
    ...verdict,
    aiExplanation,
    triageAssist,
  };
}
