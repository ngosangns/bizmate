import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValid, validateEmTask, type EmTask } from "@bizmate/contracts";

export interface TaskBoard {
  goal: string;
  updatedAt: string;
  tasks: EmTask[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Default board lives next to the package root: apps/em/board.json */
export function defaultBoardPath(): string {
  return path.join(__dirname, "..", "board.json");
}

export function loadBoard(boardPath: string = defaultBoardPath()): TaskBoard {
  if (!fs.existsSync(boardPath)) {
    return { goal: "", updatedAt: new Date().toISOString(), tasks: [] };
  }
  const raw = JSON.parse(fs.readFileSync(boardPath, "utf8")) as TaskBoard;
  for (const task of raw.tasks ?? []) {
    assertValid(validateEmTask, task, `EmTask ${task.id}`);
  }
  return {
    goal: raw.goal ?? "",
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    tasks: raw.tasks ?? [],
  };
}

export function saveBoard(
  board: TaskBoard,
  boardPath: string = defaultBoardPath()
): void {
  for (const task of board.tasks) {
    assertValid(validateEmTask, task, `EmTask ${task.id}`);
  }
  const next: TaskBoard = {
    ...board,
    updatedAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(boardPath), { recursive: true });
  fs.writeFileSync(boardPath, JSON.stringify(next, null, 2) + "\n", "utf8");
}

export function getTask(board: TaskBoard, id: string): EmTask | undefined {
  return board.tasks.find((t) => t.id === id);
}

export function upsertTask(board: TaskBoard, task: EmTask): TaskBoard {
  assertValid(validateEmTask, task, `EmTask ${task.id}`);
  const idx = board.tasks.findIndex((t) => t.id === task.id);
  const tasks = [...board.tasks];
  if (idx >= 0) tasks[idx] = task;
  else tasks.push(task);
  return { ...board, tasks };
}

export function removeTask(board: TaskBoard, id: string): TaskBoard {
  return { ...board, tasks: board.tasks.filter((t) => t.id !== id) };
}

export function setStatus(
  board: TaskBoard,
  id: string,
  status: EmTask["status"]
): TaskBoard {
  const task = getTask(board, id);
  if (!task) throw new Error(`Unknown task: ${id}`);
  return upsertTask(board, { ...task, status });
}

/**
 * Tasks ready for an agent: status is `todo`, and every blocker is `done`
 * (cancelled blockers do not unblock — treat as still blocked).
 */
export function nextReadyTasks(board: TaskBoard): EmTask[] {
  const byId = new Map(board.tasks.map((t) => [t.id, t]));
  return board.tasks.filter((task) => {
    if (task.status !== "todo") return false;
    return task.blockedBy.every((blockerId) => {
      const blocker = byId.get(blockerId);
      return blocker?.status === "done";
    });
  });
}
