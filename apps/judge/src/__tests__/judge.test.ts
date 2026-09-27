import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertValid,
  validateWorkflow,
  type Workflow,
} from "@bizmate/contracts";
import { analyzeLaya } from "../laya.js";
import { judgeWorkflow } from "../judge.js";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "../../fixtures");

function loadWorkflow(name: string): Workflow {
  const raw = JSON.parse(readFileSync(join(fixtures, name), "utf8"));
  return assertValid(validateWorkflow, raw, "Workflow");
}

describe("@bizmate/judge", () => {
  it("fails workflow missing approve before persist", async () => {
    const wf = loadWorkflow("missing-approve.json");
    const laya = analyzeLaya(wf);
    expect(laya.findings.some((f) => f.code === "LAYA_APPROVE_BEFORE_PERSIST")).toBe(
      true
    );

    const verdict = await judgeWorkflow(wf, { mode: "offline" });
    expect(verdict.passed).toBe(false);
    expect(verdict.mode).toBe("offline");
    expect(verdict.score).toBeLessThan(100);
    expect(
      verdict.findings.some((f) => f.code === "LAYA_APPROVE_BEFORE_PERSIST")
    ).toBe(true);
  });

  it("passes good accounting workflow", async () => {
    const wf = loadWorkflow("accounting-good.json");
    const laya = analyzeLaya(wf);
    expect(laya.findings.filter((f) => f.severity === "error")).toHaveLength(0);

    const verdict = await judgeWorkflow(wf, {
      mode: "offline",
      intent:
        "Book vendor invoices compute tax amounts require approve above money threshold before persist",
    });
    expect(verdict.passed).toBe(true);
    expect(verdict.workflowId).toBe("wf-acct-invoice-v1");
    expect(verdict.score).toBeGreaterThanOrEqual(80);
    expect(verdict.highLevelSummary).toBeTruthy();
    expect(verdict.findings.every((f) => f.severity !== "error")).toBe(true);
  });
});

describe("judge SLM Soft A4 live hook", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("live missing key falls back to heuristic with missing_api_key", async () => {
    const { reviewWithSlm } = await import("../slm.js");
    const wf = loadWorkflow("accounting-good.json");
    const result = await reviewWithSlm(wf, {
      mode: "live",
      intent: "Book vendor invoices",
      env: { BIZMATE_MODE: "live" },
    });
    expect(result.liveMeta?.fallbackUsed).toBe(true);
    expect(result.liveMeta?.fallbackReason).toBe("missing_api_key");
    expect(result.summary).toMatch(/missing_api_key/);
    expect(result.liveMeta?.modelId).toBeUndefined();
  });

  it("live with key mocked returns live summary; findings stay heuristic-based", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          model: "gpt-4o-mini",
          choices: [
            {
              message: {
                content:
                  "Workflow aligns with invoice intent; approve gate present.",
              },
            },
          ],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchImpl);

    const { reviewWithSlm } = await import("../slm.js");
    const wf = loadWorkflow("accounting-good.json");
    const result = await reviewWithSlm(wf, {
      mode: "live",
      intent: "Book vendor invoices require approve before persist",
      env: { BIZMATE_MODE: "live", OPENAI_API_KEY: "sk-test" },
    });
    expect(result.liveMeta?.usedLive).toBe(true);
    expect(result.liveMeta?.fallbackUsed).toBe(false);
    expect(result.liveMeta?.modelId).toBe("gpt-4o-mini");
    expect(result.summary).toMatch(/SLM live/);
    expect(fetchImpl).toHaveBeenCalled();
  });
});
