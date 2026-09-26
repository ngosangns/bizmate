#!/usr/bin/env node
import { getMode } from "@bizmate/core";
import type { Domain } from "@bizmate/contracts";
import { generateForDomain } from "./generator.js";
import { evolveWorkflow } from "./evolve.js";
import { WorkflowRegistry } from "./registry.js";

function usage(): never {
  console.error(`Usage:
  bizmate-mate generate --domain <accounting|sales> [--id <id>]
  bizmate-mate evolve --id <id> --feedback "<text>"

Env:
  BIZMATE_MODE=offline|live (default offline)
`);
  process.exit(1);
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    } else if (!out._) {
      out._ = a;
    }
  }
  return out;
}

function main(): void {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd || cmd === "-h" || cmd === "--help") usage();

  const args = parseArgs(rest);
  const registry = new WorkflowRegistry();
  const mode = getMode();

  if (cmd === "generate") {
    const domain = args.domain as Domain | undefined;
    if (domain !== "accounting" && domain !== "sales") {
      console.error("generate requires --domain accounting|sales");
      usage();
    }
    const id = typeof args.id === "string" ? args.id : undefined;
    const workflow = generateForDomain(domain, { mode, id });
    const path = registry.save(workflow);
    console.log(JSON.stringify({ ok: true, mode, path, workflow }, null, 2));
    return;
  }

  if (cmd === "evolve") {
    const id = args.id;
    const feedback = args.feedback;
    if (typeof id !== "string" || typeof feedback !== "string") {
      console.error('evolve requires --id <id> --feedback "..."');
      usage();
    }
    const existing = registry.get(id);
    if (!existing) {
      console.error(`No workflow found with id: ${id}`);
      process.exit(2);
    }
    const evolved = evolveWorkflow(existing, feedback);
    const path = registry.save(evolved);
    console.log(JSON.stringify({ ok: true, mode, path, workflow: evolved }, null, 2));
    return;
  }

  usage();
}

main();
