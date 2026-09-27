import { describe, it, expect } from "vitest";
import { assertValid, validateWorkflow } from "@bizmate/contracts";
import {
  proposeForDomainOffline,
  generateWorkflowWithMeta,
  generateForDomainWithMeta,
  evolveWorkflowWithMeta,
  MATE_UI_BADGES,
} from "../ai-propose.js";
import { generateForDomain } from "../generator.js";

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

  it("live mode without provider falls back (callLiveLlmStub throws → stub)", async () => {
    const { workflow, aiMeta } = await generateForDomainWithMeta(
      "accounting",
      { id: "wf-live-fallback" },
      { BIZMATE_MODE: "live" }
    );
    assertValid(validateWorkflow, workflow, "live-fallback");
    expect(aiMeta.mode).toBe("offline_stub");
    expect(aiMeta.labelVi).toMatch(/fallback|stub|offline/i);
    expect(aiMeta.modelId).toBeUndefined();
  });

  it("evolve live falls back to heuristic stub meta", async () => {
    const base = generateForDomain("accounting", { id: "wf-evolve-base" });
    const { workflow, aiMeta } = await evolveWorkflowWithMeta(
      base,
      "enforce non-negative and human approve",
      { BIZMATE_MODE: "live" }
    );
    expect(workflow.generation?.generation).toBe(1);
    expect(aiMeta.mode).toBe("offline_stub");
    expect(aiMeta.labelEn.toLowerCase()).toMatch(/fallback|stub|offline/);
  });

  it("CLI sync generateForDomain still works without meta", () => {
    const wf = generateForDomain("accounting", { id: "wf-cli" });
    expect(wf.domain).toBe("accounting");
  });
});
