/**
 * Mate AI propose — codegen/evolve with honesty meta.
 * Pattern: AI proposes → Ajv/Judge verify → human publish.
 * Soft A4: BIZMATE_MODE=live + API key → thin OpenAI chat call (advisory only);
 * workflow structure still from deterministic templates. Missing key / any
 * failure → offline_stub with fallbackUsed + reason (never invent modelId).
 */
import {
  callLiveChatCompletion,
  createAiMeta,
  createFallbackAiMeta,
  liveLlmFallbackReason,
  resolveAiMode,
  resolveOpenAiApiKey,
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
  /** True when live was attempted and offline template used instead. */
  fallbackUsed?: boolean;
  /** Optional advisory note from live LLM (never owns workflow structure). */
  liveNote?: string;
}

export const MATE_UI_BADGES = {
  proposing: "AI đang đề xuất",
  verified: "đã verify",
  runtimeNoLlm: "runtime deterministic · không LLM",
} as const;

function offlineMeta(source: AiSource = "template"): AiProposalMeta {
  return createAiMeta("offline_stub", source);
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
    fallbackUsed: false,
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
    fallbackUsed: false,
  };
}

async function tryLiveAdvisory(
  prompt: string,
  env: NodeJS.ProcessEnv
): Promise<
  | { ok: true; content: string; modelId: string }
  | { ok: false; reason: string }
> {
  if (!resolveOpenAiApiKey(env)) {
    return { ok: false, reason: "missing_api_key" };
  }
  try {
    const result = await callLiveChatCompletion(prompt, {
      env,
      system:
        "You are BizMate Mate. Reply with ONE short advisory sentence (max 40 words) about the workflow propose. Do NOT output JSON, code, money, tax, or risk verdicts.",
      timeoutMs: 12_000,
    });
    const content = result.content.trim();
    if (!content) return { ok: false, reason: "empty_content" };
    return { ok: true, content, modelId: result.modelId };
  } catch (err) {
    return { ok: false, reason: String(liveLlmFallbackReason(err)) };
  }
}

/**
 * Generate with meta. Default offline_stub.
 * When env/mode is live: call OpenAI if key present; on any failure → stub.
 * Workflow structure ALWAYS from deterministic generator (trust boundary).
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

  const live = await tryLiveAdvisory(
    `Propose advisory note for domain=${brief.domain} intent=${brief.intent}`,
    env
  );

  const workflow = generateWorkflow(brief, {
    ...options,
    mode: live.ok ? "live" : "offline",
  });

  if (live.ok) {
    return {
      workflow,
      aiMeta: createAiMeta("live", "llm", { modelId: live.modelId }),
      stageBadgeVi: MATE_UI_BADGES.proposing,
      fallbackUsed: false,
      liveNote: live.content,
    };
  }

  return {
    workflow,
    aiMeta: createFallbackAiMeta("template", live.reason),
    stageBadgeVi: MATE_UI_BADGES.proposing,
    fallbackUsed: true,
  };
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

/** Evolve with meta — offline keyword heuristics; live advisory then fall back. */
export async function evolveWorkflowWithMeta(
  workflow: Workflow,
  feedback: string,
  env: NodeJS.ProcessEnv = process.env
): Promise<WorkflowProposal> {
  const aiMode = resolveAiMode(env);
  const evolved = evolveWorkflow(workflow, feedback);

  if (aiMode !== "live") {
    return {
      workflow: evolved,
      aiMeta: offlineMeta("heuristic"),
      stageBadgeVi: MATE_UI_BADGES.proposing,
      fallbackUsed: false,
    };
  }

  const live = await tryLiveAdvisory(
    `Evolve advisory for workflow ${workflow.id}: ${feedback}`,
    env
  );

  if (live.ok) {
    return {
      workflow: evolved,
      aiMeta: createAiMeta("live", "llm", { modelId: live.modelId }),
      stageBadgeVi: MATE_UI_BADGES.proposing,
      fallbackUsed: false,
      liveNote: live.content,
    };
  }

  return {
    workflow: evolved,
    aiMeta: createFallbackAiMeta("heuristic", live.reason),
    stageBadgeVi: MATE_UI_BADGES.proposing,
    fallbackUsed: true,
  };
}

export function resolveMateAiMode(
  env: NodeJS.ProcessEnv = process.env
): AiMode {
  return resolveAiMode(env);
}
