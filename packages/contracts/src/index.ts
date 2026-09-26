import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type { ValidateFunction } from "ajv";

const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js");
const addFormats = require("ajv-formats");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemasDir = path.join(__dirname, "../schemas");

export type Domain = "accounting" | "sales";

export interface WorkflowStep {
  id: string;
  kind: "intake" | "classify" | "compute" | "emit" | "approve" | "persist";
  label: string;
  requiresHuman?: boolean;
  ruleRefs?: string[];
}

export interface WorkflowInvariant {
  id: string;
  expression: string;
  severity: "error" | "warn";
}

export interface Workflow {
  id: string;
  version: string;
  domain: Domain;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  invariants: WorkflowInvariant[];
  generation?: {
    generation: number;
    parentId?: string | null;
    feedbackDigest?: string;
  };
}

export interface JudgeFinding {
  severity: "error" | "warn" | "info";
  code: string;
  message: string;
  path?: string;
}

export interface JudgeVerdict {
  workflowId: string;
  passed: boolean;
  score: number;
  mode: "offline" | "live";
  findings: JudgeFinding[];
  highLevelSummary?: string;
}

export interface EmTask {
  id: string;
  title: string;
  owner: "mate" | "judge" | "runtime" | "web" | "em" | "human";
  status: "todo" | "in_progress" | "blocked" | "done" | "cancelled";
  acceptance: string[];
  blockedBy: string[];
  hitl?: boolean;
  pillar?: string;
}

/** Ledger entry / proposal payload — money path for Bookkeeper. */
export interface LedgerProposalItem {
  description: string;
  qty: number;
  unitPriceVnd: number;
}

export interface LedgerProposal {
  id: string;
  items: LedgerProposalItem[];
  totalVnd: number;
  ytdBefore: number;
  ytdAfter: number;
  remainingExemptionVnd: number;
  crossedThreshold: boolean;
  citations: string[];
  status: "proposed" | "approved" | "rejected";
}

function loadSchema(name: string): object {
  return JSON.parse(fs.readFileSync(path.join(schemasDir, name), "utf8"));
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

export const validateWorkflow: ValidateFunction<Workflow> = ajv.compile(
  loadSchema("workflow.v0.1.schema.json")
);
export const validateJudgeVerdict: ValidateFunction<JudgeVerdict> = ajv.compile(
  loadSchema("judge-verdict.v0.1.schema.json")
);
export const validateEmTask: ValidateFunction<EmTask> = ajv.compile(
  loadSchema("em-task.v0.1.schema.json")
);
export const validateLedgerProposal: ValidateFunction<LedgerProposal> =
  ajv.compile(loadSchema("ledger-proposal.v0.1.schema.json"));

/** FloodOps replan / audit decision — money path never auto_applied for refund. */
export interface FloodDecision {
  ts?: string;
  type?: "wave_action" | "human_decision";
  waveId?: string;
  orderId: string;
  kind: "reschedule" | "reroute_clear_ward" | "hold" | "propose_refund" | "noop";
  status: "proposed" | "auto_applied" | "awaiting_human" | "approved";
  requiresHuman?: boolean;
  reason?: string;
  impactEstimate?: string;
  actor?: string;
  decision?: "approved";
  before?: { status: FloodDecision["status"] };
  after?: { status: FloodDecision["status"] };
}

export const validateFloodDecision: ValidateFunction<FloodDecision> = ajv.compile(
  loadSchema("flood-decision.v0.1.schema.json")
);

export function assertValid<T>(
  validate: ValidateFunction<T>,
  data: unknown,
  label: string
): T {
  if (!validate(data)) {
    const msg = (validate.errors ?? [])
      .map((e: { instancePath?: string; message?: string }) => `${e.instancePath} ${e.message}`)
      .join("; ");
    throw new Error(`${label} invalid: ${msg}`);
  }
  return data as T;
}
