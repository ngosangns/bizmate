import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.72rem] font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "border-border bg-panel text-white",
        human: "border-human bg-[#4a3208] text-human",
        auto: "border-auto bg-[#14305a] text-[#9ec0ff]",
        flood: "border-flood bg-[#4a1a14] text-[#ffb4a8]",
        clear: "border-clear bg-[#143528] text-[#9aecc0]",
        warn: "border-warn bg-[#3a2f0f] text-warn",
        muted: "border-border bg-[#121a26] text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
