import { defineConfig } from "vite";

/** Adv · BizMate ROUND-5 UX ownership tip — CSS harden + HITL ops-rail (Lee/Sid/TA/Kyle/Son). */
export default defineConfig({
  root: ".",
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
