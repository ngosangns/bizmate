import {
  assertValid,
  validateWorkflow,
  type Domain,
  type Workflow,
  type WorkflowInvariant,
  type WorkflowStep,
} from "@bizmate/contracts";
import { getMode, type BizMateMode } from "@bizmate/core";

/** Domain brief input for Mate codegen. */
export interface DomainBrief {
  domain: Domain;
  intent: string;
  constraints: string[];
}

export interface GenerateOptions {
  mode?: BizMateMode;
  /** Optional feedback applied as a light mutation in live mode. */
  feedback?: string;
  id?: string;
}

function accountingTemplate(brief: DomainBrief, id: string): Workflow {
  const steps: WorkflowStep[] = [
    {
      id: "intake",
      kind: "intake",
      label: "Intake voucher / invoice",
      ruleRefs: ["intake.required-fields"],
    },
    {
      id: "classify",
      kind: "classify",
      label: "Classify account & tax code",
      ruleRefs: ["classify.chart-of-accounts"],
    },
    {
      id: "compute",
      kind: "compute",
      label: "Compute amounts & VAT",
      ruleRefs: ["compute.vnd-non-negative", "compute.vat"],
    },
    {
      id: "approve",
      kind: "approve",
      label: "Human approve before persist",
      requiresHuman: true,
      ruleRefs: ["approve.human-gate"],
    },
    {
      id: "persist",
      kind: "persist",
      label: "Persist journal entry",
      ruleRefs: ["persist.ledger"],
    },
  ];

  const invariants: WorkflowInvariant[] = [
    {
      id: "inv-amount-non-negative",
      expression: "amount >= 0 && vat >= 0",
      severity: "error",
    },
    {
      id: "inv-human-approve-before-persist",
      expression: "steps.approve.requiresHuman === true && steps.approve.before(steps.persist)",
      severity: "error",
    },
  ];

  for (const c of brief.constraints) {
    const lower = c.toLowerCase();
    if (lower.includes("exemption") || lower.includes("miễn") || lower.includes("mien")) {
      invariants.push({
        id: "inv-exemption-threshold",
        expression: "ytdRevenue + amount < EXEMPTION_THRESHOLD_VND || flaggedForTax",
        severity: "warn",
      });
    }
  }

  return {
    id,
    version: "0.1.0",
    domain: "accounting",
    name: "SME Bookkeeping Voucher",
    description:
      brief.intent ||
      "SME bookkeeping: intake → classify → compute → approve → persist",
    steps,
    invariants,
    generation: {
      generation: 0,
      parentId: null,
      feedbackDigest: "",
    },
  };
}

function salesTemplate(brief: DomainBrief, id: string): Workflow {
  const steps: WorkflowStep[] = [
    {
      id: "intake",
      kind: "intake",
      label: "Intake lead / order",
      ruleRefs: ["intake.required-fields"],
    },
    {
      id: "classify",
      kind: "classify",
      label: "Classify stage & priority",
      ruleRefs: ["classify.pipeline-stage"],
    },
    {
      id: "emit",
      kind: "emit",
      label: "Emit quote / notification",
      ruleRefs: ["emit.quote"],
    },
    {
      id: "approve",
      kind: "approve",
      label: "Human approve deal",
      requiresHuman: true,
      ruleRefs: ["approve.human-gate"],
    },
    {
      id: "persist",
      kind: "persist",
      label: "Persist opportunity",
      ruleRefs: ["persist.crm"],
    },
  ];

  const invariants: WorkflowInvariant[] = [
    {
      id: "inv-amount-non-negative",
      expression: "dealAmount >= 0",
      severity: "error",
    },
    {
      id: "inv-human-approve-before-persist",
      expression: "steps.approve.requiresHuman === true && steps.approve.before(steps.persist)",
      severity: "error",
    },
  ];

  for (const c of brief.constraints) {
    const lower = c.toLowerCase();
    if (lower.includes("discount") || lower.includes("giảm") || lower.includes("giam")) {
      invariants.push({
        id: "inv-discount-cap",
        expression: "discountPct <= 0.2",
        severity: "warn",
      });
    }
  }

  return {
    id,
    version: "0.1.0",
    domain: "sales",
    name: "Simple Sales Pipeline",
    description:
      brief.intent ||
      "Sales pipeline: intake → classify → emit → approve → persist",
    steps,
    invariants,
    generation: {
      generation: 0,
      parentId: null,
      feedbackDigest: "",
    },
  };
}

function applyLiveFeedbackMutation(workflow: Workflow, feedback: string): Workflow {
  const lower = feedback.toLowerCase();
  const next: Workflow = {
    ...workflow,
    steps: workflow.steps.map((s) => ({ ...s, ruleRefs: s.ruleRefs ? [...s.ruleRefs] : undefined })),
    invariants: workflow.invariants.map((i) => ({ ...i })),
    generation: {
      generation: workflow.generation?.generation ?? 0,
      parentId: workflow.generation?.parentId ?? null,
      feedbackDigest: feedback.slice(0, 120),
    },
  };

  if (lower.includes("strict") || lower.includes("strict amount")) {
    next.invariants = next.invariants.map((inv) =>
      inv.id.includes("amount") ? { ...inv, severity: "error" as const } : inv
    );
  }

  if (lower.includes("label") || lower.includes("rename")) {
    next.name = `${next.name} (refined)`;
  }

  return next;
}

/** Generate a Workflow from a domain brief (offline templates; live = templates + light mutation). */
export function generateWorkflow(
  brief: DomainBrief,
  options: GenerateOptions = {}
): Workflow {
  const mode = options.mode ?? getMode();
  const id =
    options.id ??
    `wf-${brief.domain}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  let workflow: Workflow =
    brief.domain === "accounting"
      ? accountingTemplate(brief, id)
      : salesTemplate(brief, id);

  if (mode === "live" && options.feedback) {
    workflow = applyLiveFeedbackMutation(workflow, options.feedback);
  }

  return assertValid(validateWorkflow, workflow, "workflow");
}

/** Convenience: generate from domain enum with default brief text. */
export function generateForDomain(
  domain: Domain,
  options: GenerateOptions = {}
): Workflow {
  const defaults: Record<Domain, DomainBrief> = {
    accounting: {
      domain: "accounting",
      intent: "SME bookkeeping voucher flow for VN household business",
      constraints: ["amounts non-negative", "human approve before persist"],
    },
    sales: {
      domain: "sales",
      intent: "Simple sales pipeline for SME quotes and deals",
      constraints: ["deal amount non-negative", "human approve before persist"],
    },
  };
  return generateWorkflow(defaults[domain], options);
}
