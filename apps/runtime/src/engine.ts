/**
 * Runtime engine: execute an APPROVED workflow step-by-step against an input event.
 * Compute steps dispatch to deterministic domain handlers (no LLM).
 */
import type { Domain, Workflow, WorkflowStep } from "@bizmate/contracts";
import {
  computeSale,
  processSale,
  type SaleVoiceInput,
} from "./handlers/accounting.js";
import {
  processPipeline,
  type Lead,
} from "./handlers/sales.js";

export interface ExecuteOptions {
  /** Human approval flag — required before persist. */
  approved?: boolean;
  /** Stable id for ledger entries in tests/demos. */
  entryId?: string;
}

export interface StepResult {
  stepId: string;
  kind: WorkflowStep["kind"];
  ok: boolean;
  skipped?: boolean;
  output?: unknown;
  error?: string;
}

export interface ExecutionResult {
  workflowId: string;
  domain: Domain;
  ok: boolean;
  approved: boolean;
  steps: StepResult[];
  finalState: Record<string, unknown>;
}

function asSaleInput(event: unknown): SaleVoiceInput {
  const e = event as {
    structured?: SaleVoiceInput;
    items?: SaleVoiceInput["items"];
    ytdRevenueVnd?: number;
  };
  if (e?.structured?.items && typeof e.structured.ytdRevenueVnd === "number") {
    return e.structured;
  }
  if (e?.items && typeof e.ytdRevenueVnd === "number") {
    return { items: e.items, ytdRevenueVnd: e.ytdRevenueVnd };
  }
  throw new Error("Accounting event missing structured sale input");
}

function asLeads(event: unknown): Lead[] {
  const e = event as { leads?: Lead[] };
  if (!Array.isArray(e?.leads)) {
    throw new Error("Sales event missing leads[]");
  }
  return e.leads;
}

function runCompute(
  domain: Domain,
  event: unknown,
  state: Record<string, unknown>,
  opts: ExecuteOptions
): unknown {
  if (domain === "accounting") {
    const input = asSaleInput(event);
    const computed = computeSale(input);
    state.compute = computed;
    state.saleTotalVnd = computed.saleTotalVnd;
    state.crossedExemption = computed.crossedExemption;
    return computed;
  }
  if (domain === "sales") {
    const pipeline = processPipeline(asLeads(event), Boolean(opts.approved));
    state.compute = pipeline;
    return pipeline;
  }
  throw new Error(`No compute handler for domain: ${domain}`);
}

function runPersist(
  domain: Domain,
  event: unknown,
  state: Record<string, unknown>,
  opts: ExecuteOptions
): unknown {
  if (!opts.approved) {
    throw new Error("Persist blocked: human approval required");
  }
  if (domain === "accounting") {
    const input = asSaleInput(event);
    const entry = processSale(input, true, opts.entryId ?? "ledger-runtime");
    state.ledger = entry;
    return entry;
  }
  if (domain === "sales") {
    const prior = state.compute as ReturnType<typeof processPipeline> | undefined;
    const pipeline =
      prior ?? processPipeline(asLeads(event), true);
    const persisted = { ...pipeline, persisted: true };
    state.pipeline = persisted;
    return persisted;
  }
  throw new Error(`No persist handler for domain: ${domain}`);
}

/**
 * Execute workflow steps in order with the given input event.
 */
export function executeWorkflow(
  workflow: Workflow,
  event: unknown,
  opts: ExecuteOptions = {}
): ExecutionResult {
  const approved = Boolean(opts.approved);
  const steps: StepResult[] = [];
  const state: Record<string, unknown> = {
    event,
    domain: workflow.domain,
  };
  let ok = true;

  for (const step of workflow.steps) {
    if (!ok) {
      steps.push({
        stepId: step.id,
        kind: step.kind,
        ok: false,
        skipped: true,
        error: "skipped after prior failure",
      });
      continue;
    }

    try {
      let output: unknown;

      switch (step.kind) {
        case "intake":
          output = { accepted: true, event };
          state.intake = output;
          break;
        case "classify":
          output = { domain: workflow.domain };
          state.classify = output;
          break;
        case "compute":
          output = runCompute(workflow.domain, event, state, opts);
          break;
        case "approve":
          if (step.requiresHuman && !approved) {
            throw new Error(`Step ${step.id} requires human approval`);
          }
          output = { approved };
          state.approve = output;
          break;
        case "persist":
          output = runPersist(workflow.domain, event, state, opts);
          break;
        case "emit":
          output = {
            workflowId: workflow.id,
            domain: workflow.domain,
            ledger: state.ledger ?? null,
            pipeline: state.pipeline ?? state.compute ?? null,
            crossedExemption: state.crossedExemption ?? false,
          };
          state.emit = output;
          break;
        default: {
          const _exhaustive: never = step.kind;
          throw new Error(`Unknown step kind: ${_exhaustive}`);
        }
      }

      steps.push({ stepId: step.id, kind: step.kind, ok: true, output });
    } catch (err) {
      ok = false;
      steps.push({
        stepId: step.id,
        kind: step.kind,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    workflowId: workflow.id,
    domain: workflow.domain,
    ok,
    approved,
    steps,
    finalState: state,
  };
}
