/** Tiny HTML / money helpers shared by UI panels. */

export function fmtVnd(n: number): string {
  return n.toLocaleString("vi-VN") + " ₫";
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
