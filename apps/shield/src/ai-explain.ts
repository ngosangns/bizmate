/**
 * Shield AI surfaces:
 * - explanation draft ALWAYS present on verdict (offline template = AI-draft stub)
 * - triage assist score NEVER overrides rule verdict (show both)
 * Soft A4: live + API key → thin OpenAI for elder/family copy; risk/action stay rules.
 * Missing key / any failure → offline_stub + fallbackReason (never invent LLM text as live).
 */
import {
  callLiveChatCompletion,
  createAiMeta,
  createFallbackAiMeta,
  liveLlmFallbackReason,
  resolveAiMode,
  resolveOpenAiApiKey,
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

function offlineTriageMeta(): AiProposalMeta {
  return createAiMeta("offline_stub", "heuristic");
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
 * Sync offline/template draft. When mode=live without awaiting LLM,
 * returns template with honest live-fallback meta (use draftAiExplanationAsync).
 */
export function draftAiExplanation(
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): AiExplanationDraft {
  const meta =
    mode === "live"
      ? createFallbackAiMeta("template", "use_async_for_live")
      : offlineDraftMeta();
  return {
    elderVi: buildElderVi(verdict),
    familyVi: buildFamilyVi(verdict),
    meta,
  };
}

/**
 * Soft A4 live hook: key + OpenAI → elder copy; else missing_api_key / error fallback.
 * Never invents live LLM copy when the provider/key is missing.
 * Risk/action unchanged (caller must not mutate from draft).
 */
export async function draftAiExplanationAsync(
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode(),
  env: NodeJS.ProcessEnv = process.env
): Promise<AiExplanationDraft> {
  if (mode !== "live") {
    return draftAiExplanation(verdict, mode);
  }

  const offline = {
    elderVi: buildElderVi(verdict),
    familyVi: buildFamilyVi(verdict),
  };

  if (!resolveOpenAiApiKey(env)) {
    return {
      ...offline,
      meta: createFallbackAiMeta("template", "missing_api_key"),
    };
  }

  try {
    const live = await callLiveChatCompletion(
      `Draft a short elder-friendly Vietnamese explanation for Shield verdict action=${verdict.action} risk=${verdict.risk}. Do NOT change the verdict.`,
      {
        env,
        system:
          "You are Shield AI explain. One or two short Vietnamese sentences for elders. Never override allow/flag/block — rules own risk.",
        timeoutMs: 12_000,
      }
    );
    const elderVi = live.content.trim();
    if (!elderVi) {
      return {
        ...offline,
        meta: createFallbackAiMeta("template", "empty_content"),
      };
    }
    return {
      elderVi: `AI-live: ${elderVi}`,
      familyVi: offline.familyVi,
      meta: createAiMeta("live", "llm", { modelId: live.modelId }),
    };
  } catch (err) {
    return {
      ...offline,
      meta: createFallbackAiMeta(
        "template",
        String(liveLlmFallbackReason(err))
      ),
    };
  }
}

/**
 * Heuristic triage score — advisory only. Sync live → honest fallback labels.
 */
export function triageAssistScore(
  msg: IncomingMessage,
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): TriageAssist {
  const score = computeTriageScore(msg, verdict);
  const meta =
    mode === "live"
      ? createFallbackAiMeta("heuristic", "use_async_for_live")
      : offlineTriageMeta();
  return {
    score,
    rationaleVi: buildTriageRationale(verdict, score),
    meta,
    overridesVerdict: false,
  };
}

/** Live triage: OpenAI may refine rationale; score stays heuristic; never overrides. */
export async function triageAssistScoreAsync(
  msg: IncomingMessage,
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode(),
  env: NodeJS.ProcessEnv = process.env
): Promise<TriageAssist> {
  if (mode !== "live") {
    return triageAssistScore(msg, verdict, mode);
  }
  const score = computeTriageScore(msg, verdict);
  const rationaleOffline = buildTriageRationale(verdict, score);

  if (!resolveOpenAiApiKey(env)) {
    return {
      score,
      rationaleVi: rationaleOffline,
      meta: createFallbackAiMeta("heuristic", "missing_api_key"),
      overridesVerdict: false,
    };
  }

  try {
    const live = await callLiveChatCompletion(
      `One-sentence triage rationale (advisory only, overridesVerdict=false) for Shield message ${msg.id}; rule verdict=${verdict.action}; score=${score}.`,
      {
        env,
        system:
          "You are Shield triage assist. Soft ranking hint only. NEVER change allow/flag/block.",
        timeoutMs: 12_000,
      }
    );
    const rationaleVi = live.content.trim() || rationaleOffline;
    return {
      score,
      rationaleVi: `AI-live: ${rationaleVi}`,
      meta: createAiMeta("live", "llm", { modelId: live.modelId }),
      overridesVerdict: false,
    };
  } catch (err) {
    return {
      score,
      rationaleVi: rationaleOffline,
      meta: createFallbackAiMeta(
        "heuristic",
        String(liveLlmFallbackReason(err))
      ),
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

/** Async bundle — live hook with safe fallback; never mutates risk/action. */
export async function attachAiDraftsAsync(
  msg: IncomingMessage,
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode(),
  env: NodeJS.ProcessEnv = process.env
): Promise<
  ShieldVerdict & {
    aiExplanation: AiExplanationDraft;
    triageAssist: TriageAssist;
  }
> {
  const [aiExplanation, triageAssist] = await Promise.all([
    draftAiExplanationAsync(verdict, mode, env),
    triageAssistScoreAsync(msg, verdict, mode, env),
  ]);
  return {
    ...verdict,
    aiExplanation,
    triageAssist,
  };
}
