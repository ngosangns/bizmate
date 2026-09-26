/**
 * Bookkeeper agent: LLM would propose classification; here offline stub parses
 * utterances, rules compute money, human must approve before persist.
 */
import {
  createProposal,
  markApproved,
  markVerified,
  type Proposal,
} from "@bizmate/core";
import { parseUtterance } from "./parse-utterance.js";
import {
  approveEntry,
  proposeLedgerEntry,
  type LedgerEntry,
} from "./rules.js";

export interface VendorState {
  vendorId: string;
  ytdRevenueVnd: number;
  ledger: LedgerEntry[];
}

export function ingestUtterance(
  state: VendorState,
  utteranceId: string,
  text: string,
  citationIds: string[]
): { proposal: Proposal<LedgerEntry>; state: VendorState } {
  const items = parseUtterance(text);
  const entry = proposeLedgerEntry(
    utteranceId,
    items,
    state.ytdRevenueVnd,
    citationIds
  );
  const proposal = createProposal(utteranceId, entry, "mate");
  const verified = markVerified(proposal);
  return { proposal: verified, state };
}

/** Persist only after a verified proposal is human-approved. */
export function commitApproved(
  state: VendorState,
  verifiedProposal: Proposal<LedgerEntry>
): VendorState {
  if (verifiedProposal.status !== "verified") {
    throw new Error("Refuse to persist without a verified proposal");
  }
  const decided = markApproved(verifiedProposal, "human");
  const approved = approveEntry(decided.payload);
  return {
    ...state,
    ytdRevenueVnd: approved.ytdAfter,
    ledger: [...state.ledger, approved],
  };
}
