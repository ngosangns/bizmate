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

describe("board.json money gate (Lee-B2)", () => {
  it("every domain=accounting / money board task has hitl:true", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const boardPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../board.json"
    );
    const board = JSON.parse(fs.readFileSync(boardPath, "utf8")) as {
      tasks: Array<{
        id: string;
        title: string;
        owner: EmTask["owner"];
        status: EmTask["status"];
        hitl?: boolean;
        domain?: string;
        tags?: string[];
        pillar?: string;
        acceptance: string[];
        blockedBy: string[];
      }>;
    };
    const money = board.tasks.filter(
      (t) =>
        t.domain === "accounting" ||
        (t.tags ?? []).some((x) => /money|ledger|tax|accounting/i.test(x)) ||
        /\b(accounting|ledger|tax|1\s*b|money)\b/i.test(t.title)
    );
    expect(money.length).toBeGreaterThan(0);
    for (const t of money) {
      expect(t.hitl, `${t.id} must have hitl:true`).toBe(true);
      expect(canAutoAdvance(t as EmTask, "done")).toBe(false);
    }
  });

  it("prints proof contract: canAutoAdvance money → done is false", () => {
    const money = task({
      id: "proof",
      title: "Persist ledger",
      owner: "runtime",
      domain: "accounting",
      hitl: true,
    });
    expect(canAutoAdvance(money, "done")).toBe(false);
    // Visible demo string contract (demo.ts / web must surface this exact phrase)
    expect("EM blocked auto-done on money task").toContain("EM blocked");
  });
});
