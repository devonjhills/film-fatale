"use client";

import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * One "selected" style for every set of choices: list switchers, library
 * tabs, status buttons, season pickers and filters. Use on links too.
 */
export const segmentVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3.5 text-sm font-medium transition-colors duration-150 disabled:opacity-60",
  {
    variants: {
      selected: {
        true: "border-violet bg-violet text-page",
        false: "border-line bg-surface-2 text-ink-muted hover:border-line-strong hover:text-ink",
      },
      size: {
        default: "",
        sm: "min-h-9 px-3 text-ui",
      },
    },
    defaultVariants: { selected: false, size: "default" },
  },
);

/** A trailing count inside a segment. */
export function SegmentCount({ children }: { children: ReactNode }) {
  return <span className="tabular-nums opacity-60">{children}</span>;
}

interface SegmentedControlProps<T extends string> {
  /** Accessible name for the group. */
  label: string;
  options: { value: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  size?: "default" | "sm";
  className?: string;
}

/** A row of toggle buttons where exactly one is selected. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "default",
  className,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => !selected && onChange(option.value)}
            className={segmentVariants({ selected, size })}
          >
            {option.label}
            {option.count !== undefined && <SegmentCount>{option.count}</SegmentCount>}
          </button>
        );
      })}
    </div>
  );
}
