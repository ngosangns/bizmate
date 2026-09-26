/**
 * Combine Laya static analysis + SLM high-level review into a JudgeVerdict.
 */
import {
  assertValid,
  validateJudgeVerdict,
  type JudgeFinding,
  type JudgeVerdict,
  type Workflow,
} from "@bizmate/contracts";
import { getMode, type BizMateMode } from "@bizmate/core";
import { analyzeLaya } from "./laya.js";
import { reviewWithSlm } from "./slm.js";

export interface JudgeOptions {
  intent?: string;
  mode?: BizMateMode;
}

const SLM_DEDUCT: Record<JudgeFinding["severity"], number> = {
  error: 20,
  warn: 8,
  info: 2,
};

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Run full judge pipeline and validate against judge-verdict schema. */
export async function judgeWorkflow(
  workflow: Workflow,
  options: JudgeOptions = {}
): Promise<JudgeVerdict> {
  const mode = options.mode ?? getMode();
  const laya = analyzeLaya(workflow);
  const slm = await reviewWithSlm(workflow, {
    intent: options.intent,
    mode,
  });

  const findings: JudgeFinding[] = [...laya.findings, ...slm.findings];
  const slmDeduction = slm.findings.reduce(
    (sum, f) => sum + SLM_DEDUCT[f.severity],
    0
  );
  const score = clampScore(100 - laya.deduction - slmDeduction);
  const passed = !findings.some((f) => f.severity === "error");

  const verdict: JudgeVerdict = {
    workflowId: workflow.id,
    passed,
    score,
    mode,
    findings,
    highLevelSummary: slm.summary,
  };

  return assertValid(validateJudgeVerdict, verdict, "JudgeVerdict");
}
