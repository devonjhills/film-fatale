import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Fact {
  label: string;
  value: ReactNode;
}

/** Facts with something to show; empty values are skipped, never shown blank. */
function present(facts: Fact[]) {
  return facts.filter(
    (fact) => fact.value !== null && fact.value !== undefined && fact.value !== "" && fact.value !== false,
  );
}

/** Label/value rows in a bordered card, read top to bottom. */
export function FactCard({ facts, className }: { facts: Fact[]; className?: string }) {
  const shown = present(facts);
  if (!shown.length) return null;

  return (
    <dl className={cn("min-w-0 rounded-md border border-line bg-surface-1", className)}>
      {shown.map((fact, index) => (
        <div
          key={fact.label}
          className={cn(
            "grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-3 px-4 py-2.5 text-sm",
            index > 0 && "border-t border-line",
          )}
        >
          <dt className="text-ink-muted">{fact.label}</dt>
          <dd className="min-w-0">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Label/value pairs laid out on an even grid, for longer lists of details. */
export function FactGrid({ facts, className }: { facts: Fact[]; className?: string }) {
  const shown = present(facts);
  if (!shown.length) return null;

  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {shown.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="text-sm text-ink-muted">{fact.label}</dt>
          <dd className="mt-1 text-md leading-snug">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
