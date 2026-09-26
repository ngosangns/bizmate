/**
 * Laya-style static analysis rules against a Workflow object.
 * Deterministic, offline, no LLM — deductions feed into JudgeVerdict.score.
 */
import type { JudgeFinding, Workflow } from "@bizmate/contracts";

export interface LayaResult {
  findings: JudgeFinding[];
  /** Points deducted from a 100 baseline (errors/warns/infos). */
  deduction: number;
}

const DEDUCT: Record<JudgeFinding["severity"], number> = {
  error: 25,
  warn: 10,
  info: 2,
};

const MONEY_RE = /\b(threshold|money|amount|vnd|usd|tax|currency|balance)\b/i;

function finding(
  severity: JudgeFinding["severity"],
  code: string,
  message: string,
  path?: string
): JudgeFinding {
  return path ? { severity, code, message, path } : { severity, code, message };
}

/** Run all Laya static rules. Pure function. */
export function analyzeLaya(workflow: Workflow): LayaResult {
  const findings: JudgeFinding[] = [];

  // no empty steps
  if (!workflow.steps || workflow.steps.length === 0) {
    findings.push(
      finding("error", "LAYA_EMPTY_STEPS", "Workflow must have at least one step", "steps")
    );
  } else {
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]!;
      if (!step.id?.trim() || !step.label?.trim()) {
        findings.push(
          finding(
            "error",
            "LAYA_EMPTY_STEP",
            `Step at index ${i} has empty id or label`,
            `steps[${i}]`
          )
        );
      }
    }
  }

  // must have approve step before persist if any persist exists
  const persistIndexes = workflow.steps
    .map((s, i) => (s.kind === "persist" ? i : -1))
    .filter((i) => i >= 0);
  if (persistIndexes.length > 0) {
    const firstPersist = persistIndexes[0]!;
    const approveBefore = workflow.steps
      .slice(0, firstPersist)
      .some((s) => s.kind === "approve");
    if (!approveBefore) {
      findings.push(
        finding(
          "error",
          "LAYA_APPROVE_BEFORE_PERSIST",
          "Workflow with persist must include an approve step before the first persist",
          `steps[${firstPersist}]`
        )
      );
    }
  }

  // compute steps must list ruleRefs
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i]!;
    if (step.kind === "compute") {
      if (!step.ruleRefs || step.ruleRefs.length === 0) {
        findings.push(
          finding(
            "error",
            "LAYA_COMPUTE_RULE_REFS",
            `Compute step "${step.id}" must list at least one ruleRef`,
            `steps[${i}].ruleRefs`
          )
        );
      }
    }
  }

  // accounting domain must mention threshold or money in invariants or step labels
  if (workflow.domain === "accounting") {
    const invariantText = workflow.invariants.map((inv) => inv.expression).join(" ");
    const labelText = workflow.steps.map((s) => s.label).join(" ");
    const haystack = `${invariantText} ${labelText}`;
    if (!MONEY_RE.test(haystack)) {
      findings.push(
        finding(
          "warn",
          "LAYA_ACCOUNTING_MONEY_HEURISTIC",
          "Accounting workflows should mention threshold or money (amount/tax/currency) in invariants or step labels",
          "invariants"
        )
      );
    }
  }

  const deduction = findings.reduce((sum, f) => sum + DEDUCT[f.severity], 0);
  return { findings, deduction };
}
