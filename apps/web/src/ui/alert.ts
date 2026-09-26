import { cn } from "./cn.js";

export type AlertVariant = "default" | "warn" | "destructive" | "ok" | "info";

const base =
  "relative w-full rounded-lg border px-4 py-3 text-sm " +
  "[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4";

const variants: Record<AlertVariant, string> = {
  default: "bg-card text-foreground border-border",
  warn: "border-warn/60 bg-warn/10 text-warn [&>svg]:text-warn",
  destructive:
    "border-destructive/60 bg-destructive/10 text-destructive [&>svg]:text-destructive",
  ok: "border-ok/60 bg-ok/10 text-ok [&>svg]:text-ok",
  info: "border-primary/50 bg-primary/10 text-primary [&>svg]:text-primary",
};

/** shadcn-style Alert class builder — honesty banners, progress, crossed. */
export function alertVariants(opts?: {
  variant?: AlertVariant;
  className?: string;
}): string {
  return cn(base, variants[opts?.variant ?? "default"], opts?.className);
}

export function alertTitle(className?: string): string {
  return cn("mb-1 font-semibold leading-none tracking-tight", className);
}

export function alertDescription(className?: string): string {
  return cn("text-sm [&_p]:leading-relaxed opacity-95", className);
}
