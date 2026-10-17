import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  /** Right-aligned control in the header row, e.g. a "View all" link. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** A titled page section: serif heading over a hairline rule. */
export function Section({ title, action, className, children }: SectionProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 id={headingId} className="section-title min-w-0">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export interface Fact {
  label: string;
  value: ReactNode;
}

/** Label/value pairs laid out on an even grid. Empty values are skipped. */
export function FactList({ facts, className }: { facts: Fact[]; className?: string }) {
  const shown = facts.filter((fact) => fact.value !== null && fact.value !== undefined && fact.value !== "");
  if (!shown.length) return null;

  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {shown.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="text-sm text-muted-foreground">{fact.label}</dt>
          <dd className="mt-1 text-[0.9375rem] leading-snug">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
