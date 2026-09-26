import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    host: true, // R5 Adv tip — 0.0.0.0 so 127.0.0.1 and localhost both work (:5173)
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
