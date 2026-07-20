import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-transparent text-sm font-bold tracking-[0.015em] transition-[color,background-color,border-color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[0_10px_30px_oklch(0.55_0.12_78/0.12)] hover:border-foreground hover:bg-foreground",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:border-foreground hover:bg-destructive/88",
        outline:
          "border-border bg-card/55 text-foreground shadow-[0_1px_0_oklch(1_0_0/0.04)_inset] hover:border-primary/65 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border-border/60 bg-secondary text-secondary-foreground hover:border-border hover:bg-muted",
        ghost:
          "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
        link:
          "min-h-0 border-0 p-0 text-primary underline-offset-4 hover:text-foreground hover:underline",
      },
      size: {
        default: "px-4 py-2",
        sm: "min-h-9 px-3.5 text-xs",
        lg: "min-h-12 px-6 text-sm uppercase tracking-[0.09em]",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
