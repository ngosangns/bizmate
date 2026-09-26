import { describe, expect, it } from "vitest";
import type { EmTask } from "@bizmate/contracts";
import {
  advancePolicy,
  canAutoAdvance,
  touchesMoney,
} from "../policy.js";

function task(
  partial: Pick<EmTask, "id" | "title" | "owner"> & Partial<EmTask>
): EmTask {
  return {
    status: "todo",
    acceptance: ["ok"],
    blockedBy: [],
    ...partial,
  };
}

describe("touchesMoney / accounting HITL", () => {
  it("detects domain accounting", () => {
    expect(
      touchesMoney(task({ id: "a", title: "Ship feature", owner: "mate", domain: "accounting" }))
    ).toBe(true);
  });

  it("detects money keywords in title", () => {
    expect(
      touchesMoney(task({ id: "b", title: "Post ledger entry", owner: "runtime" }))
    ).toBe(true);
    expect(
      touchesMoney(task({ id: "c", title: "Tax exemption check", owner: "judge" }))
    ).toBe(true);
  });

  it("detects tags", () => {
    expect(
      touchesMoney(
        task({ id: "d", title: "Misc", owner: "em", tags: ["ledger"] })
      )
    ).toBe(true);
  });

  it("allows non-money tasks", () => {
    expect(
      touchesMoney(
        task({ id: "e", title: "Polish web copy", owner: "web", domain: "sales" })
      )
    ).toBe(false);
  });

  it("forces HITL when advancing money task to done", () => {
    const money = task({
      id: "m1",
      title: "Persist ledger after sale",
      owner: "runtime",
      domain: "accounting",
    });
    expect(advancePolicy(money, "done")).toBe("hitl");
    expect(canAutoAdvance(money, "done")).toBe(false);
    // intermediate statuses still auto for agent-owned non-hitl
    expect(canAutoAdvance(money, "in_progress")).toBe(true);
  });

  it("still auto-advances non-money mate task to done", () => {
    const mate = task({
      id: "m2",
      title: "Generate sales pipeline workflow",
      owner: "mate",
      domain: "sales",
    });
    expect(canAutoAdvance(mate, "done")).toBe(true);
  });

  it("title with accounting forces HITL on done", () => {
    const t = task({
      id: "m3",
      title: "Mate: generate accounting workflow from domain brief",
      owner: "mate",
    });
    expect(touchesMoney(t)).toBe(true);
    expect(canAutoAdvance(t, "done")).toBe(false);
  });
});
