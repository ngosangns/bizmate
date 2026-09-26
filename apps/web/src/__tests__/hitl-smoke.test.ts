import { describe, expect, it } from "vitest";
import { runDomain } from "../runner.js";

describe("HITL smoke — accounting", () => {
  it("refuses persist without Duyệt (approve)", () => {
    const result = runDomain("accounting", false);
    expect(result.ok).toBe(false);
    expect(result.approved).toBe(false);

    const approve = result.steps.find((s) => s.kind === "approve");
    expect(approve).toBeDefined();
    expect(approve!.ok).toBe(false);
    expect(approve!.error).toMatch(/approval/i);

    const persist = result.steps.find((s) => s.kind === "persist");
    expect(persist).toBeDefined();
    expect(persist!.ok).toBe(false);
    expect(persist!.skipped || persist!.error).toBeTruthy();

    const ledger = result.summary.ledger as { persisted?: boolean } | undefined;
    expect(ledger?.persisted).not.toBe(true);
  });

  it("persists ledger with Duyệt and crosses 1B on vendor-day fixture", () => {
    const result = runDomain("accounting", true);
    expect(result.ok).toBe(true);
    expect(result.approved).toBe(true);

    const persist = result.steps.find((s) => s.kind === "persist");
    expect(persist?.ok).toBe(true);

    const ledger = result.summary.ledger as {
      persisted: boolean;
      crossedExemption: boolean;
      ytdAfterVnd: number;
      saleTotalVnd: number;
    };
    expect(ledger).toBeDefined();
    expect(ledger.persisted).toBe(true);
    expect(ledger.crossedExemption).toBe(true);
    // 985M YTD + 21M sale = 1.006B
    expect(ledger.saleTotalVnd).toBe(21_000_000);
    expect(ledger.ytdAfterVnd).toBe(1_006_000_000);
  });
});

describe("HITL smoke — sales", () => {
  it("blocks without Duyệt", () => {
    const result = runDomain("sales", false);
    expect(result.ok).toBe(false);
    const approve = result.steps.find((s) => s.kind === "approve");
    expect(approve?.ok).toBe(false);
    expect(approve?.error).toMatch(/approval/i);
    const persist = result.steps.find((s) => s.kind === "persist");
    expect(persist?.ok).toBe(false);
  });

  it("runs ok with Duyệt", () => {
    const result = runDomain("sales", true);
    expect(result.ok).toBe(true);
    expect(result.approved).toBe(true);
    const persist = result.steps.find((s) => s.kind === "persist");
    expect(persist?.ok).toBe(true);
    expect(result.summary.persisted).toBe(true);
  });
});
