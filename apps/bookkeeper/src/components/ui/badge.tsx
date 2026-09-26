import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.72rem] font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-white text-ink",
        accent: "border-accent-ring bg-accent-soft text-ok",
        warn: "border-warn-border bg-warn-soft text-warn",
        danger: "border-danger-border bg-danger-soft text-danger",
        stub: "border-amber-border bg-amber-soft text-warn",
        muted: "border-border bg-bg text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
