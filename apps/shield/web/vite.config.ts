import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shieldRoot = path.resolve(__dirname, "..");

export default defineConfig({
  root: __dirname,
  publicDir: "public",
  resolve: {
    alias: {
      // Shared rule core — same TS imported by CLI demo + PWA
      "@shield/engine": path.resolve(shieldRoot, "src/engine.ts"),
      "@shield/blacklist": path.resolve(shieldRoot, "src/blacklist.ts"),
      "@shield/notify": path.resolve(shieldRoot, "src/notify.ts"),
      "@shield/detector": path.resolve(shieldRoot, "src/detector-stub.ts"),
    },
  },
  server: {
    port: 5174,
    fs: { allow: [shieldRoot, path.resolve(shieldRoot, "../..")] },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
