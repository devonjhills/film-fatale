import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const present = (item: ReactNode) => item !== null && item !== undefined && item !== false && item !== "";

/**
 * Short facts on one line, split by thin upright rules rather than dots:
 * Film | 2010 | PG-13 | 2h 28m. Empty items are dropped.
 */
export function MetaLine({ items, className }: { items: ReactNode[]; className?: string }) {
  const shown = items.filter(present);
  if (!shown.length) return null;

  return (
    // Every item carries a rule on its left and sits 1px over its neighbour;
    // the list is pulled out by its padding and clipped, so the rule before
    // the first item of each wrapped line falls outside and never shows.
    <ul
      className={cn(
        "-ml-3 flex flex-wrap items-center gap-y-0.5 overflow-hidden text-sm tabular-nums text-ink-muted",
        className,
      )}
    >
      {shown.map((item, index) => (
        <li
          key={index}
          className="relative -ml-px flex h-6 items-center px-3 before:absolute before:left-0 before:h-3.5 before:w-px before:bg-line-strong"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
