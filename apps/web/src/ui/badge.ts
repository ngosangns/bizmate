import { cn } from "./cn.js";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ok"
  | "warn"
  | "roadmap"
  | "destructive";

const base =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const variants: Record<BadgeVariant, string> = {
  default:
    "border-transparent bg-primary/15 text-primary hover:bg-primary/20",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-border text-foreground",
  ok: "border-transparent bg-ok/15 text-ok",
  warn: "border-transparent bg-warn/15 text-warn",
  roadmap: "border-transparent bg-warn/20 text-warn",
  destructive:
    "border-transparent bg-destructive/15 text-destructive",
};

/** shadcn-style Badge class builder. */
export function badgeVariants(opts?: {
  variant?: BadgeVariant;
  className?: string;
}): string {
  return cn(base, variants[opts?.variant ?? "default"], opts?.className);
}
