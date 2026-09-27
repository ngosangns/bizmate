/**
 * AiLedgerProposer — AI propose layer for voice/text → ledger draft items.
 *
 * Trust: AI proposes → code verifies → human decides.
 * Money / YTD / 1B threshold remain in rules.ts + @bizmate/core (deterministic).
 * Human Duyệt still required before persist.
 *
 * Live path: only when BIZMATE_MODE=live via createAiLedgerProposer.
 * Provider not wired in this build → safe fallback to offline_stub (never invent
 * tax, payment, YTD, or fake live model traffic).
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
  /** Context only — AI must NOT compute exemption / tax from this. */
  ytdRevenueVnd: number;
  citationIds: string[];
}

export interface AiLedgerProposal {
  utteranceId: string;
  /** Draft line items only — no totals / YTD / tax / payment fields. */
  items: LineItem[];
  /** Soft classification note from AI — not used for money math. */
  classificationNote: string;
  meta: AiProposalMeta;
  /** True when live path fell back to offline stub (honesty). */
  fallbackUsed: boolean;
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
  // Deliberately ignore ytdRevenueVnd / citationIds for money — rules own those.
  void input.ytdRevenueVnd;
  void input.citationIds;
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
    fallbackUsed: false,
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
 * This build does not ship a provider — callLiveLlmStub throws → fallback.
 * Never invents tax/payment/YTD or a live modelId on fallback.
 */
export class LiveAiLedgerProposer implements AiLedgerProposer {
  readonly mode: AiMode = "live";

  async propose(input: AiLedgerProposeInput): Promise<AiLedgerProposal> {
    const modelId = process.env.BIZMATE_LLM_MODEL;
    try {
      const { callLiveLlmStub } = await import("@bizmate/core");
      // Promise<never> today — when a real provider is wired, parse items-only JSON here.
      await callLiveLlmStub(`Propose ledger line items for: ${input.text}`, {
        modelId,
      });
      // Unreachable until provider returns: still draft via offline parser (safe).
      const stub = proposeOfflineSync(input);
      return withLiveFallback(
        stub,
        "live provider returned but item parser not wired → offline_stub"
      );
    } catch {
      const stub = proposeOfflineSync(input);
      return withLiveFallback(
        stub,
        "live hook unavailable → offline_stub"
      );
    }
  }
}

function withLiveFallback(
  stub: AiLedgerProposal,
  reason: string
): AiLedgerProposal {
  return {
    ...stub,
    classificationNote: `${stub.classificationNote} · ${reason}`,
    fallbackUsed: true,
    meta: {
      ...createAiMeta("offline_stub", "heuristic"),
      // Honesty: do not attach modelId on fallback (would fake live).
      labelVi: "AI đề xuất (stub offline · live fallback)",
      labelEn: "AI proposed (offline stub · live fallback)",
    },
  };
}

/**
 * Factory gated by BIZMATE_MODE.
 * - live → LiveAiLedgerProposer (safe fallback if provider missing)
 * - otherwise → OfflineAiLedgerProposer
 */
export function createAiLedgerProposer(
  env: NodeJS.ProcessEnv = process.env
): AiLedgerProposer {
  return resolveAiMode(env) === "live"
    ? new LiveAiLedgerProposer()
    : new OfflineAiLedgerProposer();
}
