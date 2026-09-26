#!/usr/bin/env node
/**
 * CLI: judge --file path/to/workflow.json
 */
import fs from "node:fs";
import path from "node:path";
import {
  assertValid,
  validateWorkflow,
  type Workflow,
} from "@bizmate/contracts";
import { getMode } from "@bizmate/core";
import { judgeWorkflow } from "./judge.js";

function printUsage(): void {
  console.error("Usage: judge --file <path/to/workflow.json>");
  console.error("Env: BIZMATE_MODE=offline|live (default offline)");
}

function parseArgs(argv: string[]): { file?: string } {
  const out: { file?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file" || a === "-f") {
      out.file = argv[++i];
    } else if (a === "--help" || a === "-h") {
      printUsage();
      process.exit(0);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const { file } = parseArgs(process.argv.slice(2));
  if (!file) {
    printUsage();
    process.exit(2);
  }

  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(2);
  }

  const raw = JSON.parse(fs.readFileSync(abs, "utf8")) as unknown;
  const workflow = assertValid(validateWorkflow, raw, "Workflow");
  const verdict = await judgeWorkflow(workflow as Workflow, { mode: getMode() });

  console.log(JSON.stringify(verdict, null, 2));
  process.exit(verdict.passed ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
