/** Shared lifecycle: AI proposes → code verifies → human decides. */

export type ProposalStatus = "draft" | "verified" | "rejected" | "approved";

export interface Proposal<T> {
  id: string;
  status: ProposalStatus;
  payload: T;
  proposedBy: "mate" | "judge" | "em" | "human";
  verificationErrors: string[];
  decidedBy?: "human" | "em-policy";
  decidedAt?: string;
}

export function createProposal<T>(
  id: string,
  payload: T,
  proposedBy: Proposal<T>["proposedBy"]
): Proposal<T> {
  return {
    id,
    status: "draft",
    payload,
    proposedBy,
    verificationErrors: [],
  };
}

export function markVerified<T>(p: Proposal<T>): Proposal<T> {
  return { ...p, status: "verified", verificationErrors: [] };
}

export function markRejected<T>(p: Proposal<T>, errors: string[]): Proposal<T> {
  return { ...p, status: "rejected", verificationErrors: errors };
}

export function markApproved<T>(
  p: Proposal<T>,
  decidedBy: "human" | "em-policy" = "human"
): Proposal<T> {
  if (p.status !== "verified") {
    throw new Error("Can only approve a verified proposal");
  }
  return {
    ...p,
    status: "approved",
    decidedBy,
    decidedAt: new Date().toISOString(),
  };
}
