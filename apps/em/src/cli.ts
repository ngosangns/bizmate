#!/usr/bin/env node
import {
  defaultBoardPath,
  loadBoard,
  saveBoard,
  getTask,
  setStatus,
  nextReadyTasks,
} from "./queue.js";
import { planFromGoal } from "./planner.js";
import { canAutoAdvance } from "./policy.js";

function usage(): never {
  console.log(`Usage:
  em plan "<goal>"     Seed board.json from a product goal
  em next              List tasks ready (todo + blockers done)
  em done <id>         Mark task done (HITL tasks need --hitl-confirm)
  em status            Print board summary

Board: ${defaultBoardPath()}
Env:   BIZMATE_EM_BOARD overrides board path`);
  process.exit(1);
}

function boardPath(): string {
  return process.env.BIZMATE_EM_BOARD?.trim() || defaultBoardPath();
}

function cmdPlan(goal: string): void {
  const board = planFromGoal(goal);
  saveBoard(board, boardPath());
  console.log(`Planned ${board.tasks.length} tasks for: ${board.goal}`);
  for (const t of board.tasks) {
    const hitl = t.hitl ? " [HITL]" : "";
    const deps =
      t.blockedBy.length > 0 ? ` ← ${t.blockedBy.join(",")}` : "";
    console.log(`  ${t.id} (${t.owner})${hitl}: ${t.title}${deps}`);
  }
}

function cmdNext(): void {
  const board = loadBoard(boardPath());
  const ready = nextReadyTasks(board);
  if (ready.length === 0) {
    console.log("No ready tasks.");
    return;
  }
  console.log(`Ready (${ready.length}):`);
  for (const t of ready) {
    const hitl = t.hitl ? " HITL" : " AFK";
    console.log(`  [${t.owner}${hitl}] ${t.id}: ${t.title}`);
    for (const a of t.acceptance) console.log(`    - [ ] ${a}`);
  }
}

function cmdDone(id: string, hitlConfirm: boolean): void {
  const path = boardPath();
  const board = loadBoard(path);
  const task = getTask(board, id);
  if (!task) {
    console.error(`Unknown task: ${id}`);
    process.exit(1);
  }
  if (!canAutoAdvance(task, "done") && !hitlConfirm) {
    console.error(
      `Task ${id} requires HITL. Re-run with --hitl-confirm after human approval.`
    );
    process.exit(2);
  }
  const next = setStatus(board, id, "done");
  saveBoard(next, path);
  console.log(`Done: ${id} (${task.title})`);
}

function cmdStatus(): void {
  const board = loadBoard(boardPath());
  const counts = {
    todo: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
    cancelled: 0,
  };
  for (const t of board.tasks) counts[t.status]++;
  console.log(`Goal: ${board.goal || "(none)"}`);
  console.log(`Updated: ${board.updatedAt}`);
  console.log(
    `Counts: todo=${counts.todo} in_progress=${counts.in_progress} blocked=${counts.blocked} done=${counts.done} cancelled=${counts.cancelled}`
  );
  const ready = nextReadyTasks(board);
  console.log(`Ready now: ${ready.map((t) => t.id).join(", ") || "(none)"}`);
  console.log("---");
  for (const t of board.tasks) {
    const hitl = t.hitl ? " HITL" : "";
    const deps =
      t.blockedBy.length > 0 ? ` blockedBy=[${t.blockedBy.join(",")}]` : "";
    console.log(
      `  ${t.status.padEnd(11)} ${t.id.padEnd(12)} ${t.owner.padEnd(8)}${hitl} ${t.title}${deps}`
    );
  }
}

function main(argv: string[]): void {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === "-h" || cmd === "--help") usage();

  switch (cmd) {
    case "plan": {
      const goal = rest.join(" ").trim();
      if (!goal) usage();
      cmdPlan(goal);
      break;
    }
    case "next":
      cmdNext();
      break;
    case "done": {
      const hitlConfirm = rest.includes("--hitl-confirm");
      const id = rest.find((a) => !a.startsWith("--"));
      if (!id) usage();
      cmdDone(id, hitlConfirm);
      break;
    }
    case "status":
      cmdStatus();
      break;
    default:
      usage();
  }
}

main(process.argv.slice(2));
