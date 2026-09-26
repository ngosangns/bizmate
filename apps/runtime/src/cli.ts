#!/usr/bin/env node
/**
 * CLI: `runtime run --domain accounting|sales`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Domain, Workflow } from "@bizmate/contracts";
import { executeWorkflow } from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const domainsRoot = path.resolve(__dirname, "../../../domains");

function usage(): never {
  console.error("Usage: runtime run --domain <accounting|sales> [--approve]");
  process.exit(1);
}

function parseArgs(argv: string[]): { domain: Domain; approve: boolean } {
  const args = argv.slice(2);
  if (args[0] !== "run") usage();
  let domain: Domain | undefined;
  let approve = false;
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === "--domain") {
      const v = args[++i];
      if (v !== "accounting" && v !== "sales") usage();
      domain = v;
    } else if (a === "--approve") {
      approve = true;
    } else {
      usage();
    }
  }
  if (!domain) usage();
  return { domain, approve };
}

function loadFixture(domain: Domain): { workflow: Workflow; event: unknown } {
  if (domain === "accounting") {
    const raw = JSON.parse(
      fs.readFileSync(
        path.join(domainsRoot, "accounting/fixtures/vendor-day.json"),
        "utf8"
      )
    );
    return { workflow: raw.workflow as Workflow, event: raw };
  }
  const raw = JSON.parse(
    fs.readFileSync(
      path.join(domainsRoot, "sales/fixtures/pipeline.json"),
      "utf8"
    )
  );
  return { workflow: raw.workflow as Workflow, event: raw };
}

function main(): void {
  const { domain, approve } = parseArgs(process.argv);
  const { workflow, event } = loadFixture(domain);
  const result = executeWorkflow(workflow, event, {
    approved: approve,
    entryId: `ledger-cli-${domain}`,
  });

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main();
