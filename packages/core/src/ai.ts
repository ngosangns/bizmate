/**
 * Shared AI ops helpers — honesty-first.
 * Pattern: AI proposes → code verifies → human decides.
 * Money / tax / risk / refund decisions stay deterministic code + human.
 *
 * Soft A4: thin real OpenAI chat-completions hook when BIZMATE_MODE=live
 * and OPENAI_API_KEY / BIZMATE_OPENAI_API_KEY is set. Missing key or any
 * failure → apps fall back to offline_stub (never invent live success).
 */

import { getMode, type BizMateMode } from "./mode.js";

/** Explicit honesty modes for AI propose surfaces across all apps. */
export type AiMode = "offline_stub" | "live";

/** How the proposal text/structure was produced. */
export type AiSource = "fixture" | "heuristic" | "template" | "llm";

/** Why a live attempt fell back to offline_stub (honest labeling). */
export type AiFallbackReason =
  | "missing_api_key"
  | "timeout"
  | "http_error"
  | "empty_content"
  | "aborted"
  | "network"
  | "parse_error"
  | "provider_error";

export interface AiProposalMeta {
  mode: AiMode;
  source: AiSource;
  /** Vietnamese UI badge — always shown next to AI output. */
  labelVi: string;
  /** English UI badge. */
  labelEn: string;
  generatedAt: string;
  /** Optional model id when live succeeded; never invent one offline/fallback. */
  modelId?: string;
  /** True when live was attempted but offline stub was used instead. */
  fallbackUsed?: boolean;
  /** Explicit honesty reason when fallbackUsed. */
  fallbackReason?: AiFallbackReason | string;
}

export function resolveAiMode(
  env: NodeJS.ProcessEnv = process.env
): AiMode {
  const biz: BizMateMode = getMode(env);
  return biz === "live" ? "live" : "offline_stub";
}

/** Honesty labels — use these in UI, never claim live when stub. */
export function aiLabels(
  mode: AiMode,
  source: AiSource
): Pick<AiProposalMeta, "labelVi" | "labelEn"> {
  if (mode === "live" && source === "llm") {
    return {
      labelVi: "AI đề xuất (live)",
      labelEn: "AI proposed (live)",
    };
  }
  if (source === "template") {
    return {
      labelVi: "AI-draft stub (offline template)",
      labelEn: "AI-draft stub (offline template)",
    };
  }
  if (source === "heuristic") {
    return {
      labelVi: "AI đề xuất (stub heuristic)",
      labelEn: "AI proposed (offline stub)",
    };
  }
  return {
    labelVi: "AI đề xuất (stub offline)",
    labelEn: "AI proposed (offline stub)",
  };
}

export function createAiMeta(
  mode: AiMode,
  source: AiSource,
  opts: {
    modelId?: string;
    at?: string;
    fallbackUsed?: boolean;
    fallbackReason?: AiFallbackReason | string;
  } = {}
): AiProposalMeta {
  const labels = aiLabels(mode, source);
  const meta: AiProposalMeta = {
    mode,
    source,
    ...labels,
    generatedAt: opts.at ?? new Date().toISOString(),
  };
  if (mode === "live" && opts.modelId) {
    meta.modelId = opts.modelId;
  }
  if (opts.fallbackUsed) {
    meta.fallbackUsed = true;
    if (opts.fallbackReason) meta.fallbackReason = opts.fallbackReason;
  }
  return meta;
}

/** Labels for live→offline fallback (no fake modelId). */
export function createFallbackAiMeta(
  source: AiSource,
  reason: AiFallbackReason | string
): AiProposalMeta {
  const base = createAiMeta("offline_stub", source, {
    fallbackUsed: true,
    fallbackReason: reason,
  });
  const reasonTag =
    reason === "missing_api_key" ? "missing_api_key" : "live fallback";
  return {
    ...base,
    labelVi: `AI đề xuất (stub offline · ${reasonTag})`,
    labelEn: `AI proposed (offline stub · ${reasonTag})`,
  };
}

/** Resolve OpenAI key — prefer BIZMATE_OPENAI_API_KEY, else OPENAI_API_KEY. */
export function resolveOpenAiApiKey(
  env: NodeJS.ProcessEnv = process.env
): string | undefined {
  const k =
    env.BIZMATE_OPENAI_API_KEY?.trim() || env.OPENAI_API_KEY?.trim() || "";
  return k.length > 0 ? k : undefined;
}

export type LiveLlmFailReason = AiFallbackReason;

export class LiveLlmError extends Error {
  readonly reason: LiveLlmFailReason;
  constructor(reason: LiveLlmFailReason, message: string) {
    super(message);
    this.name = "LiveLlmError";
    this.reason = reason;
  }
}

export interface LiveChatCompletionResult {
  content: string;
  modelId: string;
}

export interface LiveChatCompletionOptions {
  system?: string;
  /** Default gpt-4o-mini — never invent when offline/fallback. */
  modelId?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  env?: NodeJS.ProcessEnv;
  /** Injectable for Vitest (defaults to global fetch). */
  fetchImpl?: typeof fetch;
  /** OpenAI-compatible base URL (default api.openai.com). */
  baseUrl?: string;
}

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_BASE = "https://api.openai.com/v1";

/**
 * Thin real OpenAI chat completions helper.
 * Throws LiveLlmError on missing key / timeout / HTTP / empty content.
 * Apps MUST catch and fall back to offline_stub — never invent live success.
 */
export async function callLiveChatCompletion(
  prompt: string,
  opts: LiveChatCompletionOptions = {}
): Promise<LiveChatCompletionResult> {
  const env = opts.env ?? process.env;
  const apiKey = resolveOpenAiApiKey(env);
  if (!apiKey) {
    throw new LiveLlmError(
      "missing_api_key",
      "OPENAI_API_KEY / BIZMATE_OPENAI_API_KEY not set — use offline_stub"
    );
  }

  const modelId =
    opts.modelId?.trim() ||
    env.BIZMATE_LLM_MODEL?.trim() ||
    DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const baseUrl = (opts.baseUrl ?? env.BIZMATE_OPENAI_BASE_URL ?? DEFAULT_BASE)
    .replace(/\/$/, "");
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new LiveLlmError(
      "network",
      "fetch is not available in this runtime"
    );
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (opts.signal) {
    if (opts.signal.aborted) {
      throw new LiveLlmError("aborted", "Live LLM call aborted before start");
    }
    opts.signal.addEventListener("abort", onAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          ...(opts.system
            ? [{ role: "system", content: opts.system }]
            : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new LiveLlmError(
        "http_error",
        `OpenAI HTTP ${res.status}: ${body.slice(0, 200)}`
      );
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new LiveLlmError("parse_error", "OpenAI response was not JSON");
    }

    const content = extractChatContent(data);
    if (!content) {
      throw new LiveLlmError(
        "empty_content",
        "OpenAI returned empty chat content"
      );
    }

    const returnedModel =
      typeof (data as { model?: unknown }).model === "string"
        ? ((data as { model: string }).model as string)
        : modelId;

    return { content, modelId: returnedModel };
  } catch (err) {
    if (err instanceof LiveLlmError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new LiveLlmError("timeout", `Live LLM timed out after ${timeoutMs}ms`);
    }
    throw new LiveLlmError(
      "network",
      err instanceof Error ? err.message : "Live LLM network error"
    );
  } finally {
    clearTimeout(timer);
    if (opts.signal) {
      opts.signal.removeEventListener("abort", onAbort);
    }
  }
}

function extractChatContent(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const choices = (data as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return undefined;
  const msg = (choices[0] as { message?: { content?: unknown } })?.message;
  const content = msg?.content;
  if (typeof content !== "string") return undefined;
  const trimmed = content.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Map thrown errors to a stable fallback reason for meta. */
export function liveLlmFallbackReason(err: unknown): AiFallbackReason | string {
  if (err instanceof LiveLlmError) return err.reason;
  if (err instanceof Error && /not configured|missing/i.test(err.message)) {
    return "missing_api_key";
  }
  return "provider_error";
}

/**
 * @deprecated Prefer callLiveChatCompletion. Kept so older call sites compile;
 * delegates to the real helper (throws LiveLlmError when key missing).
 */
export async function callLiveLlmStub(
  prompt: string,
  opts: { modelId?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<LiveChatCompletionResult> {
  return callLiveChatCompletion(prompt, {
    modelId: opts.modelId,
    env: opts.env,
  });
}
