import * as React from "react";

import { cn } from "@/lib/utils";

/** The shared look for text inputs, text areas and selects. */
export const fieldClass =
  "w-full rounded-md border border-line-strong bg-surface-1 px-3.5 text-sm text-ink transition-colors duration-150 placeholder:text-ink-muted focus:border-violet disabled:cursor-not-allowed disabled:opacity-50";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          fieldClass,
          "flex min-h-10 py-2 text-base md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
