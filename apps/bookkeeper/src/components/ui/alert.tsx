import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-sm border px-3 py-2.5 text-sm leading-snug",
  {
    variants: {
      variant: {
        default: "border-border bg-white text-ink",
        honesty:
          "border-amber-border bg-sand text-[#92400e] text-[0.75rem]",
        warn: "border-warn-border bg-warn-soft text-warn font-semibold",
        danger: "border-danger-border bg-danger-soft text-danger",
        stub: "border-dashed border-warn-border bg-warn-soft text-[#92400e] text-[0.78rem] whitespace-pre-wrap break-words",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-bold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("[&_p]:leading-relaxed", className)} {...props} />;
}
