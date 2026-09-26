/** Embedded offline samples — no backend. */

export type Domain = "accounting" | "sales";

export const accountingWorkflow = {
  id: "wf-accounting-vendor-day",
  version: "0.1.0",
  domain: "accounting" as const,
  name: "Vendor day bookkeeping",
  description: "Voice-note sale → ledger entry + 1B VND exemption threshold",
  steps: [
    { id: "intake-sale", kind: "intake", label: "Accept structured sale from voice note" },
    {
      id: "compute-ledger",
      kind: "compute",
      label: "Sum sale and exemption status",
      ruleRefs: ["money.sumVnd", "money.remainingExemption", "money.crossesExemption"],
    },
    {
      id: "approve-persist",
      kind: "approve",
      label: "Human approve before ledger persist",
      requiresHuman: true,
    },
    { id: "persist-ledger", kind: "persist", label: "Write ledger entry" },
    { id: "emit-status", kind: "emit", label: "Emit threshold alert if crossed" },
  ],
  invariants: [
    {
      id: "inv-money-deterministic",
      expression: "saleTotalVnd == sum(items.qty * items.unitPriceVnd)",
      severity: "error",
    },
    {
      id: "inv-approve-before-persist",
      expression: "persist requires prior human approve",
      severity: "error",
    },
  ],
  generation: { generation: 1, parentId: null, feedbackDigest: "offline-fixture" },
};

export const salesWorkflow = {
  id: "wf-sales-pipeline",
  version: "0.1.0",
  domain: "sales" as const,
  name: "SME sales pipeline",
  description: "Advance leads lead → quote → order",
  steps: [
    { id: "intake-leads", kind: "intake", label: "Load pipeline leads" },
    { id: "classify-stage", kind: "classify", label: "Classify current stage" },
    {
      id: "compute-advance",
      kind: "compute",
      label: "Advance stage one step",
      ruleRefs: ["sales.advanceStage"],
    },
    {
      id: "approve-order",
      kind: "approve",
      label: "Human approve when moving to order",
      requiresHuman: true,
    },
    { id: "persist-pipeline", kind: "persist", label: "Persist updated pipeline" },
    { id: "emit-pipeline", kind: "emit", label: "Emit pipeline snapshot" },
  ],
  invariants: [
    {
      id: "inv-stage-order",
      expression: "stage in [lead, quote, order] and only advances forward",
      severity: "error",
    },
  ],
  generation: { generation: 1, parentId: null, feedbackDigest: "offline-fixture" },
};

export const accountingVerdict = {
  workflowId: "wf-accounting-vendor-day",
  passed: true,
  score: 92,
  mode: "offline" as const,
  findings: [
    {
      severity: "info" as const,
      code: "HITL_PRESENT",
      message: "Approve step present before persist",
      path: "/steps/2",
    },
    {
      severity: "info" as const,
      code: "MONEY_DETERMINISTIC",
      message: "Sale totals reference @bizmate/core money helpers",
      path: "/steps/1/ruleRefs",
    },
  ],
  highLevelSummary:
    "Workflow matches vendor-day brief: structured intake, deterministic money compute, human gate, persist.",
};

export const salesVerdict = {
  workflowId: "wf-sales-pipeline",
  passed: true,
  score: 88,
  mode: "offline" as const,
  findings: [
    {
      severity: "info" as const,
      code: "HITL_PRESENT",
      message: "Approve step gates order stage",
      path: "/steps/3",
    },
    {
      severity: "warn" as const,
      code: "SIMPLE_PIPELINE",
      message: "MVP advances one stage per run; fine for offline demo",
    },
  ],
  highLevelSummary:
    "Sales pipeline is linear and auditable; order requires human approval.",
};

export const vendorDayFixture = {
  eventId: "vendor-day-001",
  domain: "accounting" as const,
  source: "voice-note",
  transcript:
    "Hôm nay bán 3 thùng nước mỗi thùng 2 triệu và 1 máy lạnh 15 triệu.",
  structured: {
    items: [
      { sku: "nuoc-thung", qty: 3, unitPriceVnd: 2_000_000 },
      { sku: "may-lanh", qty: 1, unitPriceVnd: 15_000_000 },
    ],
    ytdRevenueVnd: 985_000_000,
  },
};

export const pipelineFixture = {
  eventId: "pipeline-001",
  domain: "sales" as const,
  leads: [
    {
      id: "lead-cafe-hoa",
      name: "Cafe Hoa",
      stage: "lead" as const,
      amountVnd: 5_000_000,
      notes: "Wants POS + inventory for 2 branches",
    },
    {
      id: "lead-tap-hoa-minh",
      name: "Tạp hóa Minh",
      stage: "quote" as const,
      amountVnd: 2_500_000,
      notes: "Quoted starter pack",
    },
  ],
};

export function workflowFor(domain: Domain) {
  return domain === "accounting" ? accountingWorkflow : salesWorkflow;
}

export function verdictFor(domain: Domain) {
  return domain === "accounting" ? accountingVerdict : salesVerdict;
}
