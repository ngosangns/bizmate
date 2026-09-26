import type { EmTask } from "./types.js";
import type { TaskBoard } from "./queue.js";

/**
 * Seed a default Biz Mate MVP board from a product goal.
 * Ownership + blockedBy chains mirror Mate → Judge → Human → Runtime → Web.
 */
export function planFromGoal(goal: string): TaskBoard {
  const trimmed = goal.trim() || "Biz Mate MVP";
  const tasks: EmTask[] = [
    {
      id: "em-001",
      title: "Freeze MVP scope + acceptance by owner",
      owner: "em",
      status: "todo",
      pillar: "em",
      acceptance: [
        "DEVELOPMENT_RULES MVP scope locked (accounting + sales)",
        "Owner → deliverable → done-when table published",
        "Offline demo path named in README",
      ],
      blockedBy: [],
    },
    {
      id: "mate-001",
      title: "Mate: generate accounting workflow from domain brief",
      owner: "mate",
      status: "todo",
      pillar: "mate",
      domain: "accounting",
      tags: ["accounting", "workflow"],
      acceptance: [
        "Workflow JSON passes validateWorkflow",
        "Includes approve step before persist",
        "Fixtures under domains/accounting/fixtures load offline",
      ],
      blockedBy: ["em-001"],
    },
    {
      id: "mate-002",
      title: "Mate: generate sales pipeline workflow",
      owner: "mate",
      status: "todo",
      pillar: "mate",
      domain: "sales",
      tags: ["sales"],
      acceptance: [
        "Workflow JSON passes validateWorkflow",
        "Happy-path fixture for offline demo",
        "Invariants cover money/tax trust boundaries",
      ],
      blockedBy: ["em-001"],
    },
    {
      id: "judge-001",
      title: "Judge: offline Laya rules + verdict schema",
      owner: "judge",
      status: "todo",
      pillar: "judge",
      acceptance: [
        "Verdict validates against judge-verdict schema",
        "Missing human-approve step → fail",
        "Offline mode needs no network",
      ],
      blockedBy: ["mate-001"],
    },
    {
      id: "judge-002",
      title: "Judge: review sales workflow draft",
      owner: "judge",
      status: "todo",
      pillar: "judge",
      acceptance: [
        "Verdict emitted for sales workflow",
        "High-level summary present",
        "Score + findings recorded",
      ],
      blockedBy: ["mate-002", "judge-001"],
    },
    {
      id: "human-001",
      title: "Human: approve publish to workflow registry",
      owner: "human",
      status: "todo",
      pillar: "em",
      hitl: true,
      acceptance: [
        "Judge passed for accounting + sales",
        "Human explicitly approves publish",
        "Approved artifacts land in registry",
      ],
      blockedBy: ["judge-001", "judge-002"],
    },
    {
      id: "runtime-001",
      title: "Runtime: deterministic handlers + 1B VND threshold",
      owner: "runtime",
      status: "todo",
      pillar: "runtime",
      domain: "accounting",
      tags: ["money", "ledger", "threshold"],
      acceptance: [
        "Approved workflows execute without LLM",
        "Threshold / exemption tests pass",
        "npm run demo:offline prints ledger path",
      ],
      blockedBy: ["human-001"],
    },
    {
      id: "web-001",
      title: "Web: offline demo UI generate → judge → approve → run",
      owner: "web",
      status: "todo",
      pillar: "web",
      acceptance: [
        "vite build succeeds",
        "Offline UI walks full happy path",
        "No live API required for demo",
      ],
      blockedBy: ["runtime-001"],
    },
    {
      id: "mate-003",
      title: "Mate: evolve workflow gen+1 from judge feedback",
      owner: "mate",
      status: "todo",
      pillar: "mate",
      acceptance: [
        "generation N→N+1 diff visible",
        "Parent id linked in workflow.generation",
        "Re-judge still passes offline",
      ],
      blockedBy: ["judge-001", "human-001"],
    },
    {
      id: "human-002",
      title: "Human: final merge / freeze for demo",
      owner: "human",
      status: "todo",
      pillar: "em",
      hitl: true,
      acceptance: [
        "All pillar acceptance checklists green",
        "Dropped features removed (see DROPPED.md)",
        "Demo script rehearsed end-to-end",
      ],
      blockedBy: ["web-001", "mate-003"],
    },
  ];

  // Stamp goal into titles lightly for traceability without breaking ids.
  void trimmed;

  return {
    goal: trimmed,
    updatedAt: new Date().toISOString(),
    tasks,
  };
}
