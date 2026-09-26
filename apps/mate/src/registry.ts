import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertValid,
  validateWorkflow,
  type Workflow,
} from "@bizmate/contracts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Default on-disk registry under apps/mate/.registry */
export function defaultRegistryDir(): string {
  return path.resolve(__dirname, "../.registry");
}

export class WorkflowRegistry {
  constructor(private readonly dir: string = defaultRegistryDir()) {
    fs.mkdirSync(this.dir, { recursive: true });
  }

  private filePath(id: string): string {
    const safe = id.replace(/[^a-zA-Z0-9._-]/g, "_");
    return path.join(this.dir, `${safe}.json`);
  }

  save(workflow: Workflow): string {
    const valid = assertValid(validateWorkflow, workflow, "registry-save");
    const fp = this.filePath(valid.id);
    fs.writeFileSync(fp, JSON.stringify(valid, null, 2), "utf8");
    return fp;
  }

  get(id: string): Workflow | undefined {
    const fp = this.filePath(id);
    if (!fs.existsSync(fp)) return undefined;
    const raw = JSON.parse(fs.readFileSync(fp, "utf8")) as unknown;
    return assertValid(validateWorkflow, raw, `registry-get:${id}`);
  }

  list(): Workflow[] {
    if (!fs.existsSync(this.dir)) return [];
    return fs
      .readdirSync(this.dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const raw = JSON.parse(
          fs.readFileSync(path.join(this.dir, f), "utf8")
        ) as unknown;
        return assertValid(validateWorkflow, raw, `registry-list:${f}`);
      });
  }

  has(id: string): boolean {
    return fs.existsSync(this.filePath(id));
  }
}

/** In-memory registry for tests. */
export class InMemoryRegistry {
  private readonly map = new Map<string, Workflow>();

  save(workflow: Workflow): string {
    const valid = assertValid(validateWorkflow, workflow, "memory-save");
    this.map.set(valid.id, valid);
    return valid.id;
  }

  get(id: string): Workflow | undefined {
    return this.map.get(id);
  }

  list(): Workflow[] {
    return [...this.map.values()];
  }

  has(id: string): boolean {
    return this.map.has(id);
  }
}
