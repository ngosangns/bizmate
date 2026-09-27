/**
 * Bookkeeper agent: LLM would propose classification; here offline stub parses
 * utterances, rules compute money, human must approve before persist.
 *
 * Verify path: Ajv-validate ledger payload → markVerified (or markRejected).
 * Idempotent: same id+payload already verified → no-op success;
 * same id, different payload → reject.
 */
import {
  createProposal,
  markApproved,
  markRejected,
  markVerified,
  type Proposal,
} from "@bizmate/core";
import {
  assertValid,
  validateLedgerProposal,
  type LedgerProposal,
} from "@bizmate/contracts";
import {
  proposeOfflineSync,
  type AiLedgerProposal,
} from "./ai-ledger-proposer.js";
import {
  approveEntry,
  proposeLedgerEntry,
  type LedgerEntry,
} from "./rules.js";

export interface VendorState {
  vendorId: string;
  ytdRevenueVnd: number;
  ledger: LedgerEntry[];
  /** id → fingerprint of last successfully verified payload */
  verifiedFingerprints: Record<string, string>;
}

export function createVendorState(
  vendorId: string,
  ytdRevenueVnd: number
): VendorState {
  return {
    vendorId,
    ytdRevenueVnd,
    ledger: [],
    verifiedFingerprints: {},
  };
}

/** Stable fingerprint for idempotent verify (id + money-relevant fields). */
export function fingerprintLedgerPayload(entry: LedgerEntry | LedgerProposal): string {
  return JSON.stringify({
    id: entry.id,
    items: entry.items,
    totalVnd: entry.totalVnd,
    ytdBefore: entry.ytdBefore,
    ytdAfter: entry.ytdAfter,
    remainingExemptionVnd: entry.remainingExemptionVnd,
    crossedThreshold: entry.crossedThreshold,
    citations: entry.citations,
  });
}

function ajvErrors(): string[] {
  return (validateLedgerProposal.errors ?? []).map(
    (e) => `${e.instancePath || "/"} ${e.message ?? "invalid"}`
  );
}

/**
 * Ajv-validate then verify. Idempotent on same id+payload.
 * Mutates state.verifiedFingerprints on success.
 */
export function verifyLedgerProposal(
  state: VendorState,
  proposal: Proposal<LedgerEntry>
): { proposal: Proposal<LedgerEntry>; state: VendorState } {
  const ok = validateLedgerProposal(proposal.payload);
  if (!ok) {
    return {
      proposal: markRejected(proposal, ajvErrors()),
      state,
    };
  }

  const fp = fingerprintLedgerPayload(proposal.payload);
  const prev = state.verifiedFingerprints[proposal.id];

  if (prev !== undefined) {
    if (prev === fp) {
      // already verified with identical payload — no-op success
      const verified =
        proposal.status === "verified"
          ? proposal
          : markVerified(proposal);
      return { proposal: verified, state };
    }
    return {
      proposal: markRejected(proposal, [
        `Idempotency conflict: proposal id "${proposal.id}" already verified with a different payload`,
      ]),
      state,
    };
  }

  const verified = markVerified(proposal);
  return {
    proposal: verified,
    state: {
      ...state,
      verifiedFingerprints: {
        ...state.verifiedFingerprints,
        [proposal.id]: fp,
      },
    },
  };
}

export function ingestUtterance(
  state: VendorState,
  utteranceId: string,
  text: string,
  citationIds: string[]
): {
  proposal: Proposal<LedgerEntry>;
  state: VendorState;
  ai: AiLedgerProposal;
} {
  // AI propose layer (offline stub by default) — money still from rules.
  const ai = proposeOfflineSync({
    utteranceId,
    text,
    ytdRevenueVnd: state.ytdRevenueVnd,
    citationIds,
  });
  const entry = proposeLedgerEntry(
    utteranceId,
    ai.items,
    state.ytdRevenueVnd,
    citationIds
  );
  const draft = createProposal(utteranceId, entry, "mate");
  const verified = verifyLedgerProposal(state, draft);
  return { ...verified, ai };
}

/** Async path via AiLedgerProposer (offline or live+fallback). */
export async function ingestUtteranceWithAi(
  state: VendorState,
  utteranceId: string,
  text: string,
  citationIds: string[],
  env: NodeJS.ProcessEnv = process.env
): Promise<{
  proposal: Proposal<LedgerEntry>;
  state: VendorState;
  ai: AiLedgerProposal;
}> {
  const { createAiLedgerProposer } = await import("./ai-ledger-proposer.js");
  const proposer = createAiLedgerProposer(env);
  const ai = await proposer.propose({
    utteranceId,
    text,
    ytdRevenueVnd: state.ytdRevenueVnd,
    citationIds,
  });
  const entry = proposeLedgerEntry(
    utteranceId,
    ai.items,
    state.ytdRevenueVnd,
    citationIds
  );
  const draft = createProposal(utteranceId, entry, "mate");
  const verified = verifyLedgerProposal(state, draft);
  return { ...verified, ai };
}

/** Persist only after a verified proposal is human-approved. Re-asserts Ajv. */
export function commitApproved(
  state: VendorState,
  verifiedProposal: Proposal<LedgerEntry>
): VendorState {
  if (verifiedProposal.status !== "verified") {
    throw new Error("Refuse to persist without a verified proposal");
  }
  assertValid(
    validateLedgerProposal,
    verifiedProposal.payload,
    "ledger-proposal"
  );
  const decided = markApproved(verifiedProposal, "human");
  const approved = approveEntry(decided.payload);
  return {
    ...state,
    ytdRevenueVnd: approved.ytdAfter,
    ledger: [...state.ledger, approved],
  };
}
