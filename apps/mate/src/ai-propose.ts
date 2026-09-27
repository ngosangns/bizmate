/**
 * Mate AI propose — codegen/evolve with honesty meta.
 * Pattern: AI proposes → Ajv/Judge verify → human publish.
 * Live path gated by BIZMATE_MODE=live; falls back to offline template — never invents LLM traffic.
 */
import {
  callLiveLlmStub,
  createAiMeta,
  resolveAiMode,
  type AiMode,
  type AiProposalMeta,
  type AiSource,
  type BizMateMode,
} from "@bizmate/core";
import type { Domain, Workflow } from "@bizmate/contracts";
import {
  generateForDomain,
  generateWorkflow,
  type DomainBrief,
  type GenerateOptions,
} from "./generator.js";
import { evolveWorkflow } from "./evolve.js";

export interface WorkflowProposal {
  workflow: Workflow;
  aiMeta: AiProposalMeta;
  /** VN stage badge for UI. */
  stageBadgeVi: string;
}

export const MATE_UI_BADGES = {
  proposing: "AI đang đề xuất",
  verified: "đã verify",
  runtimeNoLlm: "runtime deterministic · không LLM",
} as const;

function offlineMeta(source: AiSource = "template"): AiProposalMeta {
  return createAiMeta("offline_stub", source);
}

function fallbackMeta(_reason: string): AiProposalMeta {
  const base = createAiMeta("offline_stub", "template");
  return {
    ...base,
    labelVi: `AI đề xuất (stub offline · live fallback)`,
    labelEn: `AI proposed (offline stub · live fallback)`,
    // keep reason out of label for stable UI; callers can log reason
  };
}

function toBizMode(ai: AiMode): BizMateMode {
  return ai === "live" ? "live" : "offline";
}

/** Sync offline propose — fixtures/templates, honest offline_stub meta. */
export function proposeWorkflowOffline(
  brief: DomainBrief,
  options: GenerateOptions = {}
): WorkflowProposal {
  const workflow = generateWorkflow(brief, {
    ...options,
    mode: options.mode ?? "offline",
  });
  return {
    workflow,
    aiMeta: offlineMeta("template"),
    stageBadgeVi: MATE_UI_BADGES.proposing,
  };
}

export function proposeForDomainOffline(
  domain: Domain,
  options: GenerateOptions = {}
): WorkflowProposal {
  const workflow = generateForDomain(domain, {
    ...options,
    mode: options.mode ?? "offline",
  });
  return {
    workflow,
    aiMeta: offlineMeta("template"),
    stageBadgeVi: MATE_UI_BADGES.proposing,
  };
}

/**
 * Generate with meta. Default offline_stub.
 * When env/mode is live, attempts callLiveLlmStub then falls back to template.
 */
export async function generateWorkflowWithMeta(
  brief: DomainBrief,
  options: GenerateOptions = {},
  env: NodeJS.ProcessEnv = process.env
): Promise<WorkflowProposal> {
  const aiMode = options.mode
    ? options.mode === "live"
      ? "live"
      : "offline_stub"
    : resolveAiMode(env);

  if (aiMode !== "live") {
    return proposeWorkflowOffline(brief, {
      ...options,
      mode: toBizMode(aiMode),
    });
  }

  try {
    await callLiveLlmStub(
      `Propose workflow for domain=${brief.domain} intent=${brief.intent}`,
      { modelId: env.BIZMATE_LLM_MODEL }
    );
    // Unreachable until a real provider is wired — if stub is replaced and returns,
    // still use template structure (no invented LLM JSON).
    const workflow = generateWorkflow(brief, { ...options, mode: "live" });
    return {
      workflow,
      aiMeta: createAiMeta("live", "llm", {
        modelId: env.BIZMATE_LLM_MODEL,
      }),
      stageBadgeVi: MATE_UI_BADGES.proposing,
    };
  } catch {
    const stub = proposeWorkflowOffline(brief, {
      ...options,
      mode: "offline",
    });
    return {
      ...stub,
      aiMeta: fallbackMeta("live hook unavailable"),
    };
  }
}

export async function generateForDomainWithMeta(
  domain: Domain,
  options: GenerateOptions = {},
  env: NodeJS.ProcessEnv = process.env
): Promise<WorkflowProposal> {
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
  return generateWorkflowWithMeta(defaults[domain], options, env);
}

/** Evolve with meta — offline keyword heuristics; live attempts hook then falls back. */
export async function evolveWorkflowWithMeta(
  workflow: Workflow,
  feedback: string,
  env: NodeJS.ProcessEnv = process.env
): Promise<WorkflowProposal> {
  const aiMode = resolveAiMode(env);

  if (aiMode !== "live") {
    return {
      workflow: evolveWorkflow(workflow, feedback),
      aiMeta: offlineMeta("heuristic"),
      stageBadgeVi: MATE_UI_BADGES.proposing,
    };
  }

  try {
    await callLiveLlmStub(`Evolve workflow ${workflow.id}: ${feedback}`, {
      modelId: env.BIZMATE_LLM_MODEL,
    });
    return {
      workflow: evolveWorkflow(workflow, feedback),
      aiMeta: createAiMeta("live", "llm", {
        modelId: env.BIZMATE_LLM_MODEL,
      }),
      stageBadgeVi: MATE_UI_BADGES.proposing,
    };
  } catch {
    return {
      workflow: evolveWorkflow(workflow, feedback),
      aiMeta: fallbackMeta("live hook unavailable"),
      stageBadgeVi: MATE_UI_BADGES.proposing,
    };
  }
}

export function resolveMateAiMode(
  env: NodeJS.ProcessEnv = process.env
): AiMode {
  return resolveAiMode(env);
}
