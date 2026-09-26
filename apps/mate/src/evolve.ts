import {
  assertValid,
  validateWorkflow,
  type Workflow,
  type WorkflowInvariant,
  type WorkflowStep,
} from "@bizmate/contracts";

function digest(feedback: string): string {
  return feedback.trim().slice(0, 160).replace(/\s+/g, " ");
}

function ensureStep(
  steps: WorkflowStep[],
  kind: WorkflowStep["kind"],
  label: string,
  extras: Partial<WorkflowStep> = {}
): WorkflowStep[] {
  const existing = steps.find((s) => s.kind === kind);
  if (existing) {
    return steps.map((s) =>
      s.kind === kind
        ? {
            ...s,
            label: extras.label ?? s.label,
            requiresHuman: extras.requiresHuman ?? s.requiresHuman,
            ruleRefs: [
              ...new Set([...(s.ruleRefs ?? []), ...(extras.ruleRefs ?? [])]),
            ],
          }
        : s
    );
  }
  const insertBeforePersist = kind !== "persist";
  const persistIdx = steps.findIndex((s) => s.kind === "persist");
  const newStep: WorkflowStep = {
    id: kind,
    kind,
    label,
    ...extras,
  };
  if (insertBeforePersist && persistIdx >= 0) {
    return [...steps.slice(0, persistIdx), newStep, ...steps.slice(persistIdx)];
  }
  return [...steps, newStep];
}

function upsertInvariant(
  invariants: WorkflowInvariant[],
  inv: WorkflowInvariant
): WorkflowInvariant[] {
  const idx = invariants.findIndex((i) => i.id === inv.id);
  if (idx >= 0) {
    const copy = [...invariants];
    copy[idx] = inv;
    return copy;
  }
  return [...invariants, inv];
}

/**
 * Evoloop-style white-box evolution: bump generation, set parentId,
 * rewrite steps/invariants from simple offline keyword rules.
 */
export function evolveWorkflow(workflow: Workflow, feedback: string): Workflow {
  const parentId = workflow.id;
  const prevGen = workflow.generation?.generation ?? 0;
  const lower = feedback.toLowerCase();

  let steps: WorkflowStep[] = workflow.steps.map((s) => ({
    ...s,
    ruleRefs: s.ruleRefs ? [...s.ruleRefs] : undefined,
  }));
  let invariants: WorkflowInvariant[] = workflow.invariants.map((i) => ({ ...i }));
  let name = workflow.name;
  let description = workflow.description;

  // Keyword rules (offline, deterministic)
  if (
    lower.includes("approve") ||
    lower.includes("human") ||
    lower.includes("hitl") ||
    lower.includes("duyệt") ||
    lower.includes("duyet")
  ) {
    steps = ensureStep(steps, "approve", "Human approve (evolved)", {
      requiresHuman: true,
      ruleRefs: ["approve.human-gate", "evolve.hitl"],
    });
    invariants = upsertInvariant(invariants, {
      id: "inv-human-approve-before-persist",
      expression:
        "steps.approve.requiresHuman === true && steps.approve.before(steps.persist)",
      severity: "error",
    });
  }

  if (
    lower.includes("non-negative") ||
    lower.includes("amount") ||
    lower.includes("âm") ||
    lower.includes("am ") ||
    lower.includes("negative")
  ) {
    invariants = upsertInvariant(invariants, {
      id: "inv-amount-non-negative",
      expression: "amount >= 0 && (vat == null || vat >= 0)",
      severity: "error",
    });
    steps = steps.map((s) =>
      s.kind === "compute"
        ? {
            ...s,
            ruleRefs: [
              ...new Set([...(s.ruleRefs ?? []), "compute.vnd-non-negative"]),
            ],
          }
        : s
    );
  }

  if (
    lower.includes("emit") ||
    lower.includes("invoice") ||
    lower.includes("notify") ||
    lower.includes("quote") ||
    lower.includes("hóa đơn") ||
    lower.includes("hoa don")
  ) {
    steps = ensureStep(steps, "emit", "Emit document / notification", {
      ruleRefs: ["emit.document"],
    });
  }

  if (
    lower.includes("compute") ||
    lower.includes("tax") ||
    lower.includes("vat") ||
    lower.includes("thuế") ||
    lower.includes("thue")
  ) {
    steps = ensureStep(steps, "compute", "Compute amounts & tax", {
      ruleRefs: ["compute.vnd-non-negative", "compute.vat"],
    });
  }

  if (
    lower.includes("classify") ||
    lower.includes("phân loại") ||
    lower.includes("phan loai")
  ) {
    steps = ensureStep(steps, "classify", "Classify (refined)", {
      ruleRefs: ["classify.refined"],
    });
  }

  if (lower.includes("rename") || lower.includes("name:")) {
    const m = feedback.match(/name:\s*(.+)$/im);
    if (m) name = m[1]!.trim().slice(0, 80);
    else name = `${workflow.name} (gen ${prevGen + 1})`;
  }

  if (lower.includes("strict")) {
    invariants = invariants.map((inv) =>
      inv.severity === "warn" ? { ...inv, severity: "error" as const } : inv
    );
  }

  description = [
    workflow.description ?? "",
    `Evolved from feedback: ${digest(feedback)}`,
  ]
    .filter(Boolean)
    .join(" | ");

  const nextId = `${parentId}-g${prevGen + 1}`;

  const next: Workflow = {
    ...workflow,
    id: nextId,
    name,
    description,
    steps,
    invariants,
    generation: {
      generation: prevGen + 1,
      parentId,
      feedbackDigest: digest(feedback),
    },
  };

  return assertValid(validateWorkflow, next, "evolved-workflow");
}
