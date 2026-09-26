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
    host: true, // 0.0.0.0 — judges on 127.0.0.1 and localhost both work (ENV:5174)
    port: 5174,
    strictPort: true,
    fs: { allow: [shieldRoot, path.resolve(shieldRoot, "../..")] },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
