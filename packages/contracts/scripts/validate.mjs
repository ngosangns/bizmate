import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js");
const addFormats = require("ajv-formats");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemasDir = path.join(__dirname, "../schemas");
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json"));
let ok = true;
for (const f of files) {
  const raw = JSON.parse(fs.readFileSync(path.join(schemasDir, f), "utf8"));
  try {
    ajv.compile(raw);
    console.log(`✓ ${f}`);
  } catch (e) {
    ok = false;
    console.error(`✗ ${f}`, e.message);
  }
}
process.exit(ok ? 0 : 1);
