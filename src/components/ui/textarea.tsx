import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-sm border border-input bg-background/70 px-3.5 py-2 text-base text-foreground shadow-[0_1px_0_oklch(1_0_0/0.025)_inset] transition-[border-color,background-color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:shadow-[0_0_0_3px_oklch(0.84_0.115_80/0.1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
