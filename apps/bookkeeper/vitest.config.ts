import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // better-sqlite3 is native CJS
    poolOptions: {
      threads: { singleThread: true },
    },
  },
});
