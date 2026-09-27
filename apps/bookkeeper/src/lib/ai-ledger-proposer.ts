/**
 * AiLedgerProposer — AI propose layer for voice/text → ledger draft items.
 *
 * Trust: AI proposes → code verifies → human decides.
 * Money / YTD / 1B threshold remain in rules.ts + @bizmate/core (deterministic).
 * Human Duyệt still required before persist.
 *
 * Soft A4: BIZMATE_MODE=live + API key → thin OpenAI call for classificationNote
 * only; line items still from deterministic parseUtterance. Missing key / failure
 * → offline_stub with fallbackUsed + reason (never invent modelId / tax).
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

function withFallback(
  stub: AiLedgerProposal,
  reason: string
): AiLedgerProposal {
  return {
    ...stub,
    classificationNote: `${stub.classificationNote} · ${reason}`,
    fallbackUsed: true,
    meta: createFallbackAiMeta(
      stub.items.length ? "heuristic" : "fixture",
      reason
    ),
  };
}

/**
 * Live hook: OpenAI advisory note when key present; items always from parser.
 * Never invents tax/payment/YTD or a live modelId on fallback.
 */
export class LiveAiLedgerProposer implements AiLedgerProposer {
  readonly mode: AiMode = "live";

  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  async propose(input: AiLedgerProposeInput): Promise<AiLedgerProposal> {
    const stub = proposeOfflineSync(input);

    if (!resolveOpenAiApiKey(this.env)) {
      return withFallback(stub, "missing_api_key");
    }

    try {
      const live = await callLiveChatCompletion(
        `Classify this SME sales utterance into a one-sentence note (no numbers ownership): ${input.text}`,
        {
          env: this.env,
          system:
            "You are Bookkeeper AiLedgerProposer. Reply with ONE short Vietnamese or English classification note. Do NOT invent totals, tax, YTD, or payment. Line items are computed by code.",
          timeoutMs: 12_000,
        }
      );
      const note = live.content.trim();
      if (!note) {
        return withFallback(stub, "empty_content");
      }
      // Trust: items stay from deterministic parser; LLM only owns note text.
      return {
        utteranceId: input.utteranceId,
        items: stub.items,
        classificationNote: `AI-live: ${note}`,
        meta: createAiMeta("live", "llm", { modelId: live.modelId }),
        fallbackUsed: false,
        uiBadges: { ...UI_BADGES },
      };
    } catch (err) {
      return withFallback(stub, String(liveLlmFallbackReason(err)));
    }
  }
}

/**
 * Factory gated by BIZMATE_MODE.
 * - live → LiveAiLedgerProposer (safe fallback if key/provider missing)
 * - otherwise → OfflineAiLedgerProposer
 */
export function createAiLedgerProposer(
  env: NodeJS.ProcessEnv = process.env
): AiLedgerProposer {
  return resolveAiMode(env) === "live"
    ? new LiveAiLedgerProposer(env)
    : new OfflineAiLedgerProposer();
}
