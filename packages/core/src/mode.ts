export type BizMateMode = "offline" | "live";

export function getMode(env: NodeJS.ProcessEnv = process.env): BizMateMode {
  return env.BIZMATE_MODE === "live" ? "live" : "offline";
}
