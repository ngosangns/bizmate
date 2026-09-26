/**
 * Thin browser adapter over @bizmate/runtime executeWorkflow.
 * Keeps RunResult shape for the UI; no duplicated accounting/sales logic.
 */
import type { Workflow } from "@bizmate/contracts";
import {
  executeWorkflow,
  type ExecutionResult,
  type StepResult as RuntimeStepResult,
} from "@bizmate/runtime";
import type { Domain } from "./samples.js";
import {
  pipelineFixture,
  vendorDayFixture,
  workflowFor,
} from "./samples.js";

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

function mapStep(s: RuntimeStepResult): StepResult {
  return {
    stepId: s.stepId,
    kind: s.kind,
    ok: s.ok,
    skipped: s.skipped,
    output: s.output,
    error: s.error,
  };
}

/** Map ExecutionResult.finalState → UI summary (ledger / compute / leads). */
function summaryFrom(exec: ExecutionResult, domain: Domain): Record<string, unknown> {
  const s = exec.finalState;
  if (domain === "accounting") {
    if (s.ledger) {
      return { ledger: s.ledger, compute: s.compute };
    }
    return { compute: s.compute, persisted: false };
  }

  const pipeline = s.pipeline as Record<string, unknown> | undefined;
  if (pipeline) return { ...pipeline };

  const compute = s.compute as
    | {
        leads?: unknown;
        advanced?: unknown;
        blocked?: unknown;
      }
    | undefined;
  const event = s.event as { leads?: unknown } | undefined;
  return {
    leads: compute?.leads ?? event?.leads,
    advanced: compute?.advanced,
    blocked: compute?.blocked,
    persisted: false,
  };
}

function toRunResult(exec: ExecutionResult, domain: Domain): RunResult {
  return {
    workflowId: exec.workflowId,
    domain,
    ok: exec.ok,
    approved: exec.approved,
    steps: exec.steps.map(mapStep),
    summary: summaryFrom(exec, domain),
  };
}

export function runDomain(domain: Domain, approved: boolean): RunResult {
  const workflow = workflowFor(domain) as Workflow;
  const event = domain === "accounting" ? vendorDayFixture : pipelineFixture;
  const exec = executeWorkflow(workflow, event, {
    approved,
    entryId: domain === "accounting" ? "ledger-web-001" : undefined,
  });
  return toRunResult(exec, domain);
}
