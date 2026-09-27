/**
 * AiLedgerProposer — AI propose layer for voice/text → ledger draft items.
 * Money / YTD / 1B threshold remain in rules.ts (deterministic).
 * Human Duyệt still required before persist.
 */
import {
  createAiMeta,
  resolveAiMode,
  type AiMode,
  type AiProposalMeta,
} from "@bizmate/core";
import { parseUtterance, type LineItem } from "./parse-utterance.js";

export interface AiLedgerProposeInput {
  utteranceId: string;
  text: string;
  ytdRevenueVnd: number;
  citationIds: string[];
}

export interface AiLedgerProposal {
  utteranceId: string;
  items: LineItem[];
  /** Soft classification note from AI — not used for money math. */
  classificationNote: string;
  meta: AiProposalMeta;
  /** UI stage badges (VN). */
  uiBadges: {
    ai: string;
    ruleVerify: string;
    human: string;
  };
}

export const UI_BADGES = {
  ai: "AI đề xuất",
  ruleVerify: "rule verify",
  human: "chờ duyệt",
} as const;

export interface AiLedgerProposer {
  readonly mode: AiMode;
  propose(input: AiLedgerProposeInput): Promise<AiLedgerProposal>;
}

/** Sync offline path used by agent ingest (deterministic fixture/heuristic). */
export function proposeOfflineSync(input: AiLedgerProposeInput): AiLedgerProposal {
  const items = parseUtterance(input.text);
  const note =
    items.length === 0
      ? "AI-stub: không nhận diện được dòng bán (có thể ngày không bán)."
      : `AI-stub: đề xuất ${items.length} dòng từ utterance (heuristic/regex fixture).`;
  return {
    utteranceId: input.utteranceId,
    items,
    classificationNote: note,
    meta: createAiMeta("offline_stub", items.length ? "heuristic" : "fixture"),
    uiBadges: { ...UI_BADGES },
  };
}

/** Offline: deterministic heuristic labeled as AI-stub (not “live AI”). */
export class OfflineAiLedgerProposer implements AiLedgerProposer {
  readonly mode: AiMode = "offline_stub";

  async propose(input: AiLedgerProposeInput): Promise<AiLedgerProposal> {
    return proposeOfflineSync(input);
  }
}

/**
 * Live hook: attempts LLM path when mode=live; falls back to offline stub.
 * This build does not ship a provider — live call throws → fallback.
 */
export class LiveAiLedgerProposer implements AiLedgerProposer {
  readonly mode: AiMode = "live";

  async propose(input: AiLedgerProposeInput): Promise<AiLedgerProposal> {
    try {
      const { callLiveLlmStub } = await import("@bizmate/core");
      await callLiveLlmStub(`Propose ledger line items for: ${input.text}`, {
        modelId: process.env.BIZMATE_LLM_MODEL,
      });
      return proposeOfflineSync(input);
    } catch {
      const stub = proposeOfflineSync(input);
      return {
        ...stub,
        classificationNote: `${stub.classificationNote} · live hook unavailable → offline_stub`,
        meta: {
          ...createAiMeta("offline_stub", "heuristic"),
          labelVi: "AI đề xuất (stub offline · live fallback)",
          labelEn: "AI proposed (offline stub · live fallback)",
        },
      };
    }
  }
}

export function createAiLedgerProposer(
  env: NodeJS.ProcessEnv = process.env
): AiLedgerProposer {
  return resolveAiMode(env) === "live"
    ? new LiveAiLedgerProposer()
    : new OfflineAiLedgerProposer();
}
