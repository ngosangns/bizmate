/**
 * Shield AI surfaces:
 * - explanation draft ALWAYS present on verdict (offline template = AI-draft stub)
 * - triage assist score NEVER overrides rule verdict (show both)
 */
import {
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

/** Offline template generator labeled as AI-draft stub. */
export function draftAiExplanation(
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): AiExplanationDraft {
  const source = mode === "live" ? "llm" : "template";
  // Live not wired — still emit template text with honest meta when offline.
  const effectiveSource = mode === "live" ? "template" : "template";
  const meta =
    mode === "live"
      ? {
          ...createAiMeta("offline_stub", "template"),
          labelVi: "AI-draft stub (live hook chưa wire)",
          labelEn: "AI-draft stub (live hook not wired)",
        }
      : createAiMeta(mode, effectiveSource);

  const elderVi =
    verdict.action === "allow"
      ? "AI-draft: Tin này trông bình thường theo rule engine."
      : verdict.elderExplanation.startsWith("Ba/mẹ")
        ? `AI-draft: ${verdict.elderExplanation}`
        : `AI-draft: ${verdict.elderExplanation}`;

  const familyVi = verdict.familyAlert
    ? `AI-draft: ${verdict.familyAlert}`
    : undefined;

  void source;
  return { elderVi, familyVi, meta };
}

/**
 * Heuristic triage score from message signals — advisory only.
 * Higher = review sooner. Does not change allow/flag/block.
 */
export function triageAssistScore(
  msg: IncomingMessage,
  verdict: ShieldVerdict,
  mode: AiMode = resolveAiMode()
): TriageAssist {
  let score = 0.1;
  if (verdict.action === "flag") score = 0.55;
  if (verdict.action === "block") score = 0.9;
  if (msg.meta?.deepfakeScore !== undefined) {
    score = Math.min(1, score + msg.meta.deepfakeScore * 0.05);
  }
  if (/otp|chuyển\s*tiền|khẩn|gấp/i.test(msg.body)) {
    score = Math.min(1, score + 0.05);
  }

  const meta = createAiMeta(
    mode === "live" ? "offline_stub" : mode,
    "heuristic"
  );

  return {
    score: Math.round(score * 100) / 100,
    rationaleVi:
      verdict.action === "allow"
        ? "AI triage: ưu tiên thấp — rule đang allow."
        : `AI triage: gợi ý xem sớm (score ${score.toFixed(2)}) — verdict rule vẫn là ${verdict.action}.`,
    meta: {
      ...meta,
      labelVi:
        mode === "live"
          ? "AI triage (stub · live hook chưa wire)"
          : meta.labelVi,
    },
    overridesVerdict: false,
  };
}

/** Bundle AI drafts onto a verdict without mutating risk/action. */
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
