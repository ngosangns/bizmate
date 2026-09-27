export type BizMateMode = "offline" | "live";

/**
 * Resolve BizMate mode from env.
 * Server: BIZMATE_MODE=live
 * Vite web (injected at build): VITE_BIZMATE_MODE=live
 * Default: offline
 */
export function getMode(env: NodeJS.ProcessEnv = process.env): BizMateMode {
  if (env.BIZMATE_MODE === "live") return "live";
  if (env.VITE_BIZMATE_MODE === "live") return "live";
  return "offline";
}
