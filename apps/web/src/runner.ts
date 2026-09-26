/**
 * Browser-side mirror of runtime handlers — deterministic, uses @bizmate/core money.
 */
import {
  assertNonNegativeVnd,
  crossesExemption,
  remainingExemption,
  sumVnd,
} from "@bizmate/core";
import type { Domain } from "./samples.js";
import { pipelineFixture, vendorDayFixture, workflowFor } from "./samples.js";

export interface StepResult {
  stepId: string;
  kind: string;
  ok: boolean;
  skipped?: boolean;
  output?: unknown;
  error?: string;
}

export interface RunResult {
  workflowId: string;
  domain: Domain;
  ok: boolean;
  approved: boolean;
  steps: StepResult[];
  summary: Record<string, unknown>;
}

type Stage = "lead" | "quote" | "order";
const ORDER: Stage[] = ["lead", "quote", "order"];

function advance(stage: Stage): Stage | null {
  const i = ORDER.indexOf(stage);
  return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1]! : null;
}

function failRest(
  steps: StepResult[],
  remaining: Array<{ stepId: string; kind: string }>
): void {
  for (const r of remaining) {
    steps.push({
      stepId: r.stepId,
      kind: r.kind,
      ok: false,
      skipped: true,
      error: "skipped after prior failure",
    });
  }
}

function runAccounting(approved: boolean): RunResult {
  const workflow = workflowFor("accounting");
  const { structured } = vendorDayFixture;
  const steps: StepResult[] = [];

  steps.push({
    stepId: "intake-sale",
    kind: "intake",
    ok: true,
    output: { transcript: vendorDayFixture.transcript },
  });

  const lineTotals = structured.items.map((item) => {
    assertNonNegativeVnd(item.unitPriceVnd);
    return item.unitPriceVnd * item.qty;
  });
  const saleTotalVnd = sumVnd(lineTotals);
  const ytdBefore = assertNonNegativeVnd(structured.ytdRevenueVnd);
  const compute = {
    saleTotalVnd,
    ytdBeforeVnd: ytdBefore,
    ytdAfterVnd: ytdBefore + saleTotalVnd,
    remainingExemptionVnd: remainingExemption(ytdBefore + saleTotalVnd),
    crossedExemption: crossesExemption(ytdBefore, saleTotalVnd),
  };
  steps.push({
    stepId: "compute-ledger",
    kind: "compute",
    ok: true,
    output: compute,
  });

  if (!approved) {
    steps.push({
      stepId: "approve-persist",
      kind: "approve",
      ok: false,
      error: "Step approve-persist requires human approval",
    });
    failRest(steps, [
      { stepId: "persist-ledger", kind: "persist" },
      { stepId: "emit-status", kind: "emit" },
    ]);
    return {
      workflowId: workflow.id,
      domain: "accounting",
      ok: false,
      approved,
      steps,
      summary: { compute, persisted: false },
    };
  }

  steps.push({
    stepId: "approve-persist",
    kind: "approve",
    ok: true,
    output: { approved: true },
  });
  const ledger = { id: "ledger-web-001", ...compute, persisted: true };
  steps.push({
    stepId: "persist-ledger",
    kind: "persist",
    ok: true,
    output: ledger,
  });
  steps.push({
    stepId: "emit-status",
    kind: "emit",
    ok: true,
    output: { crossedExemption: compute.crossedExemption, ledger },
  });

  return {
    workflowId: workflow.id,
    domain: "accounting",
    ok: true,
    approved,
    steps,
    summary: { ledger },
  };
}

function runSales(approved: boolean): RunResult {
  const workflow = workflowFor("sales");
  const steps: StepResult[] = [];

  steps.push({
    stepId: "intake-leads",
    kind: "intake",
    ok: true,
    output: { count: pipelineFixture.leads.length },
  });
  steps.push({
    stepId: "classify-stage",
    kind: "classify",
    ok: true,
    output: { domain: "sales" },
  });

  const advanced: Array<{ id: string; from: Stage; to: Stage }> = [];
  const blocked: Array<{ id: string; reason: string }> = [];
  const leads = pipelineFixture.leads.map((lead) => {
    const to = advance(lead.stage);
    if (!to) {
      blocked.push({ id: lead.id, reason: "already at order" });
      return { ...lead };
    }
    if (to === "order" && !approved) {
      blocked.push({
        id: lead.id,
        reason: "human approval required before order",
      });
      return { ...lead };
    }
    advanced.push({ id: lead.id, from: lead.stage, to });
    return { ...lead, stage: to };
  });

  steps.push({
    stepId: "compute-advance",
    kind: "compute",
    ok: true,
    output: { advanced, blocked },
  });

  // Matches runtime engine: approve step with requiresHuman needs the flag.
  if (!approved) {
    steps.push({
      stepId: "approve-order",
      kind: "approve",
      ok: false,
      error: "Step approve-order requires human approval",
    });
    failRest(steps, [
      { stepId: "persist-pipeline", kind: "persist" },
      { stepId: "emit-pipeline", kind: "emit" },
    ]);
    return {
      workflowId: workflow.id,
      domain: "sales",
      ok: false,
      approved,
      steps,
      summary: {
        leads: pipelineFixture.leads,
        advanced,
        blocked,
        persisted: false,
      },
    };
  }

  steps.push({
    stepId: "approve-order",
    kind: "approve",
    ok: true,
    output: { approved: true },
  });
  const pipeline = { leads, advanced, blocked, persisted: true };
  steps.push({
    stepId: "persist-pipeline",
    kind: "persist",
    ok: true,
    output: pipeline,
  });
  steps.push({
    stepId: "emit-pipeline",
    kind: "emit",
    ok: true,
    output: pipeline,
  });

  return {
    workflowId: workflow.id,
    domain: "sales",
    ok: true,
    approved,
    steps,
    summary: pipeline,
  };
}

export function runDomain(domain: Domain, approved: boolean): RunResult {
  return domain === "accounting" ? runAccounting(approved) : runSales(approved);
}
