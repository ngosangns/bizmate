/** Browser stub for node:path — enough for audit path helpers. */
export function dirname(_p: string): string {
  return "/";
}
export function join(...parts: string[]): string {
  return parts.filter(Boolean).join("/").replace(/\/+/g, "/");
}
export default { dirname, join };
