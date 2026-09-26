import { describe, expect, it } from "vitest";
import type { EmTask } from "@bizmate/contracts";
import {
  nextReadyTasks,
  setStatus,
  upsertTask,
  type TaskBoard,
} from "../queue.js";

function task(
  partial: Pick<EmTask, "id" | "title" | "owner"> &
    Partial<EmTask>
): EmTask {
  return {
    status: "todo",
    acceptance: ["ok"],
    blockedBy: [],
    ...partial,
  };
}

function board(tasks: EmTask[]): TaskBoard {
  return { goal: "test", updatedAt: new Date().toISOString(), tasks };
}

describe("nextReadyTasks / blockedBy ordering", () => {
  it("returns only todo tasks whose blockers are done", () => {
    const b = board([
      task({ id: "a", title: "A", owner: "em", status: "done" }),
      task({ id: "b", title: "B", owner: "mate", blockedBy: ["a"] }),
      task({ id: "c", title: "C", owner: "judge", blockedBy: ["b"] }),
      task({
        id: "d",
        title: "D",
        owner: "runtime",
        status: "in_progress",
        blockedBy: [],
      }),
    ]);

    expect(nextReadyTasks(b).map((t) => t.id)).toEqual(["b"]);
  });

  it("unblocks dependents after setStatus(done)", () => {
    let b = board([
      task({ id: "mate-1", title: "gen", owner: "mate" }),
      task({
        id: "judge-1",
        title: "review",
        owner: "judge",
        blockedBy: ["mate-1"],
      }),
      task({
        id: "human-1",
        title: "approve",
        owner: "human",
        hitl: true,
        blockedBy: ["judge-1"],
      }),
    ]);

    expect(nextReadyTasks(b).map((t) => t.id)).toEqual(["mate-1"]);

    b = setStatus(b, "mate-1", "done");
    expect(nextReadyTasks(b).map((t) => t.id)).toEqual(["judge-1"]);

    b = setStatus(b, "judge-1", "done");
    expect(nextReadyTasks(b).map((t) => t.id)).toEqual(["human-1"]);
  });

  it("keeps task blocked when any blocker is still open", () => {
    const b = board([
      task({ id: "x", title: "X", owner: "mate", status: "done" }),
      task({ id: "y", title: "Y", owner: "mate", status: "todo" }),
      task({
        id: "z",
        title: "Z",
        owner: "judge",
        blockedBy: ["x", "y"],
      }),
    ]);
    expect(nextReadyTasks(b).map((t) => t.id)).toEqual(["y"]);
  });

  it("cancelled blockers do not unblock dependents", () => {
    const b = board([
      task({ id: "dep", title: "dep", owner: "em", status: "cancelled" }),
      task({
        id: "child",
        title: "child",
        owner: "web",
        blockedBy: ["dep"],
      }),
    ]);
    expect(nextReadyTasks(b)).toEqual([]);
  });

  it("upsertTask replaces by id", () => {
    let b = board([task({ id: "a", title: "old", owner: "em" })]);
    b = upsertTask(b, task({ id: "a", title: "new", owner: "em" }));
    expect(b.tasks).toHaveLength(1);
    expect(b.tasks[0].title).toBe("new");
  });
});
