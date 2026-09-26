import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-55 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-white shadow-soft hover:bg-[#0a5a41]",
        secondary:
          "border border-border bg-white text-ink hover:bg-bg",
        outline:
          "border-2 border-border bg-transparent text-ink hover:bg-white",
        approve:
          "border-2 border-accent-ring bg-accent-soft text-ok hover:bg-[#bbf7d0] text-base",
        refuse:
          "border-2 border-danger-border bg-danger-soft text-danger hover:bg-[#fecaca] text-base",
        pro: "bg-accent text-white hover:bg-[#0a5a41] w-full",
        ghost: "text-muted hover:bg-white hover:text-ink",
      },
      size: {
        default: "h-11 min-h-11 px-4 py-2",
        sm: "h-9 rounded-sm px-3 text-xs",
        lg: "h-14 min-h-14 rounded-md px-4 text-base",
        hitl: "h-14 min-h-14 w-full rounded-md px-3 text-[1.05rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
