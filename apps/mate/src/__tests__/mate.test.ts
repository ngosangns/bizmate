import { describe, it, expect } from "vitest";
import { assertValid, validateWorkflow } from "@bizmate/contracts";
import { generateForDomain, generateWorkflow } from "../generator.js";
import { evolveWorkflow } from "../evolve.js";
import { InMemoryRegistry } from "../registry.js";

describe("mate generate", () => {
  it("generates accounting workflow that validates via assertValid(validateWorkflow)", () => {
    const wf = generateForDomain("accounting", { id: "wf-accounting-test" });
    const valid = assertValid(validateWorkflow, wf, "test-accounting");
    expect(valid.domain).toBe("accounting");
    expect(valid.steps.map((s) => s.kind)).toEqual([
      "intake",
      "classify",
      "compute",
      "approve",
      "persist",
    ]);
    expect(valid.invariants.some((i) => i.id === "inv-amount-non-negative")).toBe(
      true
    );
    expect(
      valid.invariants.some((i) => i.id === "inv-human-approve-before-persist")
    ).toBe(true);
    const approve = valid.steps.find((s) => s.kind === "approve");
    expect(approve?.requiresHuman).toBe(true);
  });

  it("generates sales workflow with intake→classify→emit→approve→persist", () => {
    const wf = generateWorkflow(
      {
        domain: "sales",
        intent: "pipeline",
        constraints: ["discount cap"],
      },
      { id: "wf-sales-test" }
    );
    assertValid(validateWorkflow, wf, "test-sales");
    expect(wf.steps.map((s) => s.kind)).toEqual([
      "intake",
      "classify",
      "emit",
      "approve",
      "persist",
    ]);
    expect(wf.invariants.some((i) => i.id === "inv-discount-cap")).toBe(true);
  });
});

describe("mate evolve", () => {
  it("increments generation and sets parentId", () => {
    const base = generateForDomain("accounting", { id: "wf-acc-v0" });
    expect(base.generation?.generation).toBe(0);

    const evolved = evolveWorkflow(
      base,
      "Please enforce non-negative amounts and keep human approve"
    );
    assertValid(validateWorkflow, evolved, "test-evolved");
    expect(evolved.generation?.generation).toBe(1);
    expect(evolved.generation?.parentId).toBe(base.id);
    expect(evolved.id).not.toBe(base.id);
    expect(evolved.generation?.feedbackDigest).toContain("non-negative");
  });

  it("registry round-trips drafts in memory", () => {
    const reg = new InMemoryRegistry();
    const wf = generateForDomain("sales", { id: "wf-sales-reg" });
    reg.save(wf);
    expect(reg.has("wf-sales-reg")).toBe(true);
    const loaded = reg.get("wf-sales-reg");
    expect(loaded?.name).toBe(wf.name);
    const next = evolveWorkflow(loaded!, "add emit invoice notify");
    reg.save(next);
    expect(reg.list()).toHaveLength(2);
    expect(next.steps.some((s) => s.kind === "emit")).toBe(true);
  });
});
