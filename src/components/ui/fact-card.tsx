import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Fact {
  label: string;
  value: ReactNode;
  /** A quieter second line under the value, e.g. "Season 3, episode 5" under a date. */
  detail?: ReactNode;
  /** Take the scorecard's full width, for values that run long. */
  wide?: boolean;
}

export interface Score {
  /** Out of ten. */
  value: number;
  votes?: number;
  /** Who gave the score; "TMDB users" by default. */
  source?: string;
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
 * The detail header's summary card: the audience score as a large numeral
 * over a ten-step meter, then the title's facts as a two-column grid of
 * labelled cells.
 */
export function Scorecard({
  score,
  facts,
  className,
}: {
  score?: Score | null;
  facts: Fact[];
  className?: string;
}) {
  const shown = present(facts);
  const hasScore = Boolean(score && score.value > 0);
  if (!hasScore && !shown.length) return null;
  const fullRow = rowSpans(shown);

  return (
    <div className={cn("flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface-1", className)}>
      {score && hasScore && (
        <div className="border-b border-line bg-surface-2 px-4 py-4">
          <div className="flex items-end justify-between gap-4">
            <p className="flex items-baseline gap-1.5">
              <span className="sr-only">Rated </span>
              <span className="font-serif text-[2.5rem] font-medium leading-none tabular-nums text-ink">
                {score.value.toFixed(1)}
              </span>
              <span className="text-sm text-ink-muted">/ 10</span>
            </p>
            <p className="pb-0.5 text-right text-ui leading-tight text-ink-muted">
              {score.source ?? "TMDB users"}
              {score.votes ? (
                <span className="block tabular-nums">{compactNumber.format(score.votes)} votes</span>
              ) : null}
            </p>
          </div>
          <div className="mt-3">
            <ScoreMeter value={score.value} />
          </div>
        </div>
      )}

      {shown.length > 0 && (
        // Rows share any spare height, so a stretched card stays an even grid.
        <dl className="grid flex-1 auto-rows-fr grid-cols-2 gap-px bg-line">
          {shown.map((fact, index) => (
            <div
              key={fact.label}
              className={cn(
                "flex min-w-0 flex-col justify-center bg-surface-1 px-4 py-3",
                fullRow[index] && "col-span-2",
              )}
            >
              <dt className="text-2xs font-medium text-ink-muted">{fact.label}</dt>
              <dd className="mt-1 text-md leading-snug text-ink">
                {fact.value}
                {fact.detail && <span className="mt-0.5 block text-ui text-ink-muted">{fact.detail}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/**
 * Which cells take a full row: wide ones, and a half cell that would
 * otherwise sit alone because the next one is wide or there is no next one.
 */
function rowSpans(facts: Fact[]) {
  const full: boolean[] = [];
  let column = 0;
  facts.forEach((fact, index) => {
    const next = facts[index + 1];
    const alone = column === 0 && (!next || Boolean(next.wide));
    full.push(Boolean(fact.wide) || alone);
    column = full[index] ? 0 : (column + 1) % 2;
  });
  return full;
}
