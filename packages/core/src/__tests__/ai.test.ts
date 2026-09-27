import { afterEach, describe, expect, it, vi } from "vitest";
import {
  aiLabels,
  callLiveChatCompletion,
  createAiMeta,
  createFallbackAiMeta,
  LiveLlmError,
  liveLlmFallbackReason,
  resolveAiMode,
  resolveOpenAiApiKey,
  type AiMode,
} from "../ai.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ai helpers", () => {
  it("defaults to offline_stub", () => {
    expect(resolveAiMode({})).toBe("offline_stub");
    expect(resolveAiMode({ BIZMATE_MODE: "offline" })).toBe("offline_stub");
  });

  it("maps BIZMATE_MODE=live to live", () => {
    expect(resolveAiMode({ BIZMATE_MODE: "live" })).toBe("live");
  });

  it("maps VITE_BIZMATE_MODE=live to live (web inject)", () => {
    expect(resolveAiMode({ VITE_BIZMATE_MODE: "live" })).toBe("live");
  });

  it("labels offline stubs honestly", () => {
    const stub = aiLabels("offline_stub", "fixture");
    expect(stub.labelVi).toMatch(/stub|offline/i);
    expect(stub.labelEn.toLowerCase()).toMatch(/stub|offline/);
  });

  it("createAiMeta omits modelId offline", () => {
    const meta = createAiMeta("offline_stub", "heuristic");
    expect(meta.mode).toBe("offline_stub" satisfies AiMode);
    expect(meta.modelId).toBeUndefined();
    expect(meta.labelVi).toBeTruthy();
  });

  it("createFallbackAiMeta labels missing_api_key honestly", () => {
    const meta = createFallbackAiMeta("heuristic", "missing_api_key");
    expect(meta.mode).toBe("offline_stub");
    expect(meta.fallbackUsed).toBe(true);
    expect(meta.fallbackReason).toBe("missing_api_key");
    expect(meta.modelId).toBeUndefined();
    expect(meta.labelVi).toMatch(/missing_api_key/);
  });

  it("resolveOpenAiApiKey prefers BIZMATE_OPENAI_API_KEY", () => {
    expect(
      resolveOpenAiApiKey({
        OPENAI_API_KEY: "sk-openai",
        BIZMATE_OPENAI_API_KEY: "sk-bizmate",
      })
    ).toBe("sk-bizmate");
    expect(resolveOpenAiApiKey({ OPENAI_API_KEY: "sk-only" })).toBe("sk-only");
    expect(resolveOpenAiApiKey({})).toBeUndefined();
  });
});

describe("callLiveChatCompletion Soft A4", () => {
  it("throws missing_api_key when no key", async () => {
    await expect(
      callLiveChatCompletion("hello", { env: { BIZMATE_MODE: "live" } })
    ).rejects.toMatchObject({ reason: "missing_api_key" });
  });

  it("calls OpenAI chat completions when key present (fetch mock)", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          model: "gpt-4o-mini",
          choices: [{ message: { content: "  advisory text from live  " } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await callLiveChatCompletion("Propose a note", {
      env: {
        BIZMATE_MODE: "live",
        OPENAI_API_KEY: "sk-test-key",
        BIZMATE_LLM_MODEL: "gpt-4o-mini",
      },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      timeoutMs: 5000,
    });

    expect(result.content).toBe("advisory text from live");
    expect(result.modelId).toBe("gpt-4o-mini");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(String(url)).toMatch(/\/chat\/completions$/);
    expect((init as RequestInit).method).toBe("POST");
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer sk-test-key");
  });

  it("maps HTTP errors to LiveLlmError http_error", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response("nope", { status: 401 })
    );
    await expect(
      callLiveChatCompletion("x", {
        env: { OPENAI_API_KEY: "sk-bad" },
        fetchImpl: fetchImpl as unknown as typeof fetch,
      })
    ).rejects.toBeInstanceOf(LiveLlmError);

    try {
      await callLiveChatCompletion("x", {
        env: { OPENAI_API_KEY: "sk-bad" },
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
    } catch (e) {
      expect(liveLlmFallbackReason(e)).toBe("http_error");
    }
  });

  it("rejects empty content", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({ choices: [{ message: { content: "   " } }] }),
        { status: 200 }
      )
    );
    await expect(
      callLiveChatCompletion("x", {
        env: { OPENAI_API_KEY: "sk" },
        fetchImpl: fetchImpl as unknown as typeof fetch,
      })
    ).rejects.toMatchObject({ reason: "empty_content" });
  });
});
