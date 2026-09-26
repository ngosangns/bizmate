/**
 * Optional on-device ML stub — ALWAYS labeled fixture.
 * Never claims live deepfake / voice / QR model inference.
 * Rule engine remains the only risk authority (see engine.ts).
 */

export const DETECTOR_KIND = "fixture" as const;

export interface DetectorStubInput {
  /** Upstream fixture score if present (0..1). */
  deepfakeScore?: number;
  /** Optional channel hint for demo copy. */
  channel?: string;
}

export interface DetectorStubResult {
  /** Always "fixture" in this offline build. */
  detector: typeof DETECTOR_KIND;
  /** Echo of stub score, or null when not supplied. */
  score: number | null;
  /** Machine label for audit / UI honesty banner. */
  label: string;
  /** Elder-safe VN — no jargon / no "fixture" word. */
  elderHint?: string;
}

/**
 * Labeled fixture detector. Does NOT run ML.
 * Pass-through of meta.deepfakeScore for demo honesty.
 */
export function runDetectorStub(input: DetectorStubInput = {}): DetectorStubResult {
  const score =
    typeof input.deepfakeScore === "number" ? input.deepfakeScore : null;
  return {
    detector: DETECTOR_KIND,
    score,
    label:
      score === null
        ? "detector: fixture (no score supplied)"
        : `detector: fixture (deepfakeScore stub value=${score})`,
    elderHint:
      score !== null && score >= 0.9
        ? "Giọng nói hoặc hình ảnh có dấu hiệu giả mạo."
        : undefined,
  };
}
