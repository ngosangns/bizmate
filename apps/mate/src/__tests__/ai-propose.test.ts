import { afterEach, describe, it, expect, vi } from "vitest";
import { assertValid, validateWorkflow } from "@bizmate/contracts";
import {
  proposeForDomainOffline,
  generateWorkflowWithMeta,
  generateForDomainWithMeta,
  evolveWorkflowWithMeta,
  MATE_UI_BADGES,
} from "../ai-propose.js";
import { generateForDomain } from "../generator.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("mate AI propose honesty", () => {
  it("offline propose returns offline_stub meta (not live)", () => {
    const { workflow, aiMeta, stageBadgeVi } = proposeForDomainOffline(
      "accounting",
      { id: "wf-ai-offline" }
    );
    assertValid(validateWorkflow, workflow, "offline-propose");
    expect(aiMeta.mode).toBe("offline_stub");
    expect(aiMeta.source).toBe("template");
    expect(aiMeta.modelId).toBeUndefined();
    expect(aiMeta.labelVi.toLowerCase()).toMatch(/stub|offline|đề xuất/);
    expect(stageBadgeVi).toBe(MATE_UI_BADGES.proposing);
  });

  it("generateWorkflowWithMeta default env stays offline_stub", async () => {
    const { aiMeta } = await generateWorkflowWithMeta(
      {
        domain: "sales",
        intent: "pipeline",
        constraints: [],
      },
      { id: "wf-meta-sales" },
      { BIZMATE_MODE: "offline" }
    );
    expect(aiMeta.mode).toBe("offline_stub");
  });

  it("live mode missing key → offline_stub with missing_api_key", async () => {
    const { workflow, aiMeta, fallbackUsed } = await generateForDomainWithMeta(
      "accounting",
      { id: "wf-live-fallback" },
      { BIZMATE_MODE: "live" }
    );
    assertValid(validateWorkflow, workflow, "live-fallback");
    expect(fallbackUsed).toBe(true);
    expect(aiMeta.mode).toBe("offline_stub");
    expect(aiMeta.fallbackUsed).toBe(true);
    expect(aiMeta.fallbackReason).toBe("missing_api_key");
    expect(aiMeta.labelVi).toMatch(/missing_api_key/);
    expect(aiMeta.modelId).toBeUndefined();
  });

  it("live mode with key mocked → live llm meta (structure still template)", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          model: "gpt-4o-mini",
          choices: [{ message: { content: "Keep human approve before persist." } }],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchImpl);

    const { workflow, aiMeta, fallbackUsed, liveNote } =
      await generateForDomainWithMeta(
        "accounting",
        { id: "wf-live-ok" },
        {
          BIZMATE_MODE: "live",
          OPENAI_API_KEY: "sk-test",
          BIZMATE_LLM_MODEL: "gpt-4o-mini",
        }
      );
    assertValid(validateWorkflow, workflow, "live-ok");
    expect(fallbackUsed).toBe(false);
    expect(aiMeta.mode).toBe("live");
    expect(aiMeta.source).toBe("llm");
    expect(aiMeta.modelId).toBe("gpt-4o-mini");
    expect(liveNote).toMatch(/approve|persist/i);
    expect(fetchImpl).toHaveBeenCalled();
    // Trust: Ajv-valid workflow from generator, not invented LLM JSON
    expect(workflow.domain).toBe("accounting");
  });

  it("evolve live missing key falls back to heuristic stub meta", async () => {
    const base = generateForDomain("accounting", { id: "wf-evolve-base" });
    const { workflow, aiMeta, fallbackUsed } = await evolveWorkflowWithMeta(
      base,
      "enforce non-negative and human approve",
      { BIZMATE_MODE: "live" }
    );
    expect(workflow.generation?.generation).toBe(1);
    expect(fallbackUsed).toBe(true);
    expect(aiMeta.mode).toBe("offline_stub");
    expect(aiMeta.fallbackReason).toBe("missing_api_key");
    expect(aiMeta.modelId).toBeUndefined();
  });

  it("CLI sync generateForDomain still works without meta", () => {
    const wf = generateForDomain("accounting", { id: "wf-cli" });
    expect(wf.domain).toBe("accounting");
  });
});
