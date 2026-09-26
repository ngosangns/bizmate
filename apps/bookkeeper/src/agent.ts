/**
 * Bookkeeper agent: LLM would propose classification; here offline stub parses
 * utterances, rules compute money, human must approve before persist.
 */
import { createProposal, markApproved, markVerified } from "@bizmate/core";
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
): { proposal: ReturnType<typeof createProposal<LedgerEntry>>; state: VendorState } {
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

export function commitApproved(
  state: VendorState,
  entry: LedgerEntry
): VendorState {
  const approved = approveEntry(entry);
  markApproved(
    createProposal(approved.id, approved, "human")
  ); // lifecycle demo
  return {
    ...state,
    ytdRevenueVnd: approved.ytdAfter,
    ledger: [...state.ledger, approved],
  };
}
