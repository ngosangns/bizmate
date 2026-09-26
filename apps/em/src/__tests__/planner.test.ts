import { describe, expect, it } from "vitest";
import { validateEmTask } from "@bizmate/contracts";
import { planFromGoal } from "../planner.js";
import { nextReadyTasks } from "../queue.js";
import { canAutoAdvance } from "../policy.js";

describe("planFromGoal", () => {
  it("seeds a board with mate/judge/runtime/web/human owners", () => {
    const board = planFromGoal("Ship Biz Mate offline demo");
    expect(board.goal).toBe("Ship Biz Mate offline demo");
    expect(board.tasks.length).toBeGreaterThanOrEqual(8);

    const owners = new Set(board.tasks.map((t) => t.owner));
    for (const need of ["mate", "judge", "runtime", "web", "human"] as const) {
      expect(owners.has(need)).toBe(true);
    }

    for (const task of board.tasks) {
      expect(validateEmTask(task)).toBe(true);
      expect(task.acceptance.length).toBeGreaterThanOrEqual(1);
    }

    const hitl = board.tasks.filter((t) => t.hitl);
    expect(hitl.length).toBeGreaterThanOrEqual(1);
    expect(hitl.every((t) => t.owner === "human")).toBe(true);
  });

  it("wires blockedBy chains so only roots are initially ready", () => {
    const board = planFromGoal("MVP");
    const ready = nextReadyTasks(board);
    expect(ready.map((t) => t.id)).toEqual(["em-001"]);

    const byId = new Map(board.tasks.map((t) => [t.id, t]));
    for (const task of board.tasks) {
      for (const dep of task.blockedBy) {
        expect(byId.has(dep)).toBe(true);
      }
    }
  });

  it("marks human approve tasks as HITL-only for done", () => {
    const board = planFromGoal("MVP");
    const human = board.tasks.find((t) => t.id === "human-001");
    expect(human).toBeDefined();
    expect(canAutoAdvance(human!, "done")).toBe(false);
    // mate-001 title mentions accounting → money HITL on done (Lee)
    const mateAccounting = board.tasks.find((t) => t.id === "mate-001");
    expect(canAutoAdvance(mateAccounting!, "done")).toBe(false);
    // mate-002 is sales pipeline — may auto-done
    const mateSales = board.tasks.find((t) => t.id === "mate-002");
    expect(canAutoAdvance(mateSales!, "done")).toBe(true);
  });
});
