/** Deterministic money helpers — never use LLM for these. */

export type Vnd = number;

export function assertNonNegativeVnd(n: number): Vnd {
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new Error(`Invalid VND amount: ${n}`);
  }
  return n;
}

export function sumVnd(amounts: Vnd[]): Vnd {
  return amounts.reduce((a, b) => a + assertNonNegativeVnd(b), 0);
}

/** VN household business tax exemption threshold (demo constant). */
export const EXEMPTION_THRESHOLD_VND = 1_000_000_000;

export function remainingExemption(ytdRevenue: Vnd): Vnd {
  const ytd = assertNonNegativeVnd(ytdRevenue);
  return Math.max(0, EXEMPTION_THRESHOLD_VND - ytd);
}

export function crossesExemption(ytd: Vnd, nextSale: Vnd): boolean {
  return ytd < EXEMPTION_THRESHOLD_VND && ytd + nextSale >= EXEMPTION_THRESHOLD_VND;
}
