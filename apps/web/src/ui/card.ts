import { cn } from "./cn.js";

/** shadcn-style Card shells for vanilla HTML. */
export const card = {
  root: (className?: string) =>
    cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
      className
    ),
  header: (className?: string) =>
    cn("flex flex-col space-y-1.5 p-5 pb-0", className),
  title: (className?: string) =>
    cn(
      "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
      className
    ),
  description: (className?: string) =>
    cn("text-sm text-muted-foreground", className),
  content: (className?: string) => cn("p-5 pt-4", className),
  footer: (className?: string) =>
    cn("flex items-center p-5 pt-0", className),
};
