import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // A violet tint with a fine violet edge: plainly the main action
        // without a solid block of colour.
        default:
          "border-violet/45 bg-violet/15 text-violet-soft hover:border-violet/70 hover:bg-violet/25",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/85",
        outline:
          "border-line bg-surface-2 text-ink hover:border-line-strong hover:bg-surface-3",
        secondary:
          "border-line bg-surface-2 text-ink hover:border-line-strong hover:bg-surface-3",
        ghost:
          "text-ink-muted hover:bg-surface-2 hover:text-ink",
        link:
          "min-h-0 border-0 p-0 text-ink underline underline-offset-4 hover:text-ink-muted",
      },
      size: {
        default: "px-4 py-2",
        sm: "min-h-9 px-3.5 text-ui",
        lg: "min-h-11 px-5",
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
