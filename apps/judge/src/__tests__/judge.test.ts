import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
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
