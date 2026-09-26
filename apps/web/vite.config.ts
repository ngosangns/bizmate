import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const shim = (name: string) => path.resolve(rootDir, `src/shims/${name}.ts`);

/** Adv · BizMate ROUND-6 — shared runtime adapter + node shim for browser audit. */
export default defineConfig({
  root: ".",
  resolve: {
    alias: {
      "node:fs": shim("node-fs"),
      "node:path": shim("node-path"),
      "node:url": shim("node-url"),
    },
  },
  server: {
    host: true, // 0.0.0.0 — 127.0.0.1 and localhost both reach :5173
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
