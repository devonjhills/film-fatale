import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Fact {
  label: string;
  value: ReactNode;
  /** A quieter second line under the value, e.g. "Season 3, episode 5" under a date. */
  detail?: ReactNode;
}

export interface Score {
  /** Out of ten. */
  value: number;
  votes?: number;
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

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** Ten segments filled to the score, the last one partly. */
function ScoreMeter({ value }: { value: number }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-10 gap-[3px]">
      {Array.from({ length: 10 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <span key={index} className="relative h-1.5 overflow-hidden rounded-[2px] bg-surface-3">
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 bg-violet" style={{ width: `${fill * 100}%` }} />
            )}
          </span>
        );
      })}
    </div>
  );
}

/**
 * The audience score at a glance: a large numeral beside a ten-step meter,
 * with how many people rated it underneath.
 */
export function ScoreBadge({ score, className }: { score?: Score | null; className?: string }) {
  if (!score || !(score.value > 0)) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-line bg-surface-1 py-3 pl-4 pr-5",
        className,
      )}
    >
      <p className="flex items-baseline gap-1">
        <span className="sr-only">Rated </span>
        <span className="font-serif text-[2.5rem] font-medium leading-none tabular-nums text-ink">
          {score.value.toFixed(1)}
        </span>
        <span className="text-sm text-ink-muted">/10</span>
      </p>
      <div className="w-32">
        <ScoreMeter value={score.value} />
        <p className="mt-2 text-ui leading-tight tabular-nums text-ink-muted">
          {score.votes ? `${compactNumber.format(score.votes)} votes` : "Audience score"}
        </p>
      </div>
    </div>
  );
}

/**
 * The title's key facts as one row of labelled cells on a framed plate,
 * two to a row on phones. Each cell has a value and an optional quieter note.
 */
export function FactStrip({ facts, className }: { facts: Fact[]; className?: string }) {
  const shown = present(facts);
  if (!shown.length) return null;

  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line",
        "sm:grid-flow-col sm:grid-cols-none sm:auto-cols-fr",
        className,
      )}
    >
      {shown.map((fact) => (
        <div key={fact.label} className="min-w-0 bg-surface-1 px-4 py-3 max-sm:last:odd:col-span-2">
          <dt className="text-2xs font-medium text-ink-muted">{fact.label}</dt>
          <dd className="mt-1 text-md font-medium leading-snug text-ink">
            {fact.value}
            {fact.detail && (
              <span className="mt-0.5 block text-ui font-normal leading-snug text-ink-muted">{fact.detail}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
