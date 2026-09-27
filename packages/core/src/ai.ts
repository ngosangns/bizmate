/**
 * Shared AI ops helpers — honesty-first.
 * Pattern: AI proposes → code verifies → human decides.
 * Money / tax / risk / refund decisions stay deterministic code + human.
 */

import { getMode, type BizMateMode } from "./mode.js";

/** Explicit honesty modes for AI propose surfaces across all apps. */
export type AiMode = "offline_stub" | "live";

/** How the proposal text/structure was produced. */
export type AiSource = "fixture" | "heuristic" | "template" | "llm";

export interface AiProposalMeta {
  mode: AiMode;
  source: AiSource;
  /** Vietnamese UI badge — always shown next to AI output. */
  labelVi: string;
  /** English UI badge. */
  labelEn: string;
  generatedAt: string;
  /** Optional model id when live; never invent one offline. */
  modelId?: string;
}

export function resolveAiMode(
  env: NodeJS.ProcessEnv = process.env
): AiMode {
  const biz: BizMateMode = getMode(env);
  return biz === "live" ? "live" : "offline_stub";
}

/** Honesty labels — use these in UI, never claim live when stub. */
export function aiLabels(mode: AiMode, source: AiSource): Pick<AiProposalMeta, "labelVi" | "labelEn"> {
  if (mode === "live" && source === "llm") {
    return {
      labelVi: "AI đề xuất (live)",
      labelEn: "AI proposed (live)",
    };
  }
  if (source === "template") {
    return {
      labelVi: "AI-draft stub (offline template)",
      labelEn: "AI-draft stub (offline template)",
    };
  }
  if (source === "heuristic") {
    return {
      labelVi: "AI đề xuất (stub heuristic)",
      labelEn: "AI proposed (offline stub)",
    };
  }
  return {
    labelVi: "AI đề xuất (stub offline)",
    labelEn: "AI proposed (offline stub)",
  };
}

export function createAiMeta(
  mode: AiMode,
  source: AiSource,
  opts: { modelId?: string; at?: string } = {}
): AiProposalMeta {
  const labels = aiLabels(mode, source);
  return {
    mode,
    source,
    ...labels,
    generatedAt: opts.at ?? new Date().toISOString(),
    modelId: mode === "live" ? opts.modelId : undefined,
  };
}

/**
 * Live LLM hook placeholder. Offline always throws if called without stub path.
 * Apps MUST catch and fall back to offline_stub — never invent live responses.
 */
export async function callLiveLlmStub(
  _prompt: string,
  _opts: { modelId?: string } = {}
): Promise<never> {
  throw new Error(
    "Live LLM not configured in this build. Set BIZMATE_MODE=live and wire a real provider, or use offline_stub."
  );
}
