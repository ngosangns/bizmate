import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Workflow } from "@bizmate/contracts";
import { executeWorkflow } from "../engine.js";

const here = dirname(fileURLToPath(import.meta.url));
const engineSrc = readFileSync(join(here, "../engine.ts"), "utf8");
const indexSrc = readFileSync(join(here, "../index.ts"), "utf8");
const accountingSrc = readFileSync(
  join(here, "../handlers/accounting.ts"),
  "utf8"
);

describe("runtime trust boundary — zero LLM hot path", () => {
  it("engine module source has no LLM / callLiveLlmStub imports", () => {
    expect(engineSrc).not.toMatch(/callLiveLlmStub/);
    expect(engineSrc).not.toMatch(/createAiMeta/);
    expect(engineSrc).not.toMatch(/resolveAiMode/);
    expect(engineSrc).not.toMatch(/ai-propose|openai|anthropic/i);
    expect(engineSrc).toMatch(/handlers\/accounting/);
  });

  it("runtime index and accounting handler do not import LLM helpers", () => {
    expect(indexSrc).not.toMatch(/callLiveLlmStub|ai-propose/);
    expect(accountingSrc).not.toMatch(/callLiveLlmStub|createAiMeta/);
  });

  it("executeWorkflow runs deterministic accounting path", () => {
    const wf = {
      id: "wf-trust",
      version: "0.1.0",
      domain: "accounting",
      name: "trust",
      steps: [
        { id: "intake", kind: "intake", label: "Intake" },
        { id: "compute", kind: "compute", label: "Compute" },
        {
          id: "approve",
          kind: "approve",
          label: "Approve",
          requiresHuman: true,
        },
        { id: "persist", kind: "persist", label: "Persist" },
      ],
      invariants: [],
    } as Workflow;

    const result = executeWorkflow(
      wf,
      {
        items: [{ qty: 1, unitPriceVnd: 100_000 }],
        ytdRevenueVnd: 0,
      },
      { approved: true, entryId: "e-trust" }
    );

    expect(result.ok).toBe(true);
    expect(result.approved).toBe(true);
  });
});
