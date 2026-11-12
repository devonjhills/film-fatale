import type { ReactNode } from "react";
import Link from "@/components/ui/app-link";
import { BackdropStrip } from "@/components/ui/backdrop-strip";
import { FactCard, type Fact } from "@/components/ui/fact-card";
import { MountedPoster } from "@/components/ui/mounted-poster";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "@/components/ui/icons";
import { cn, formatVoteAverage } from "@/lib/utils";

interface DetailHeaderProps {
  /** Backdrop image URL; the strip (and the poster's overlap) only appear with one. */
  backdrop?: string | null;
  poster: { src: string | null; alt: string; fallback: "movie" | "tv" | "person" };
  /** A line above the title, e.g. a link back to the show. */
  eyebrow?: ReactNode;
  title: string;
  tagline?: string | null;
  /** Prose under the title, set as reading text. */
  overview?: ReactNode;
  /** Anything that belongs right after the overview. */
  afterOverview?: ReactNode;
  actions?: ReactNode;
  facts: Fact[];
}

/**
 * The top of every detail page: a dimmed backdrop strip, a mounted poster
 * stepping up into it, the title and story, and a card of labelled facts.
 */
export function DetailHeader({
  backdrop,
  poster,
  eyebrow,
  title,
  tagline,
  overview,
  afterOverview,
  actions,
  facts,
}: DetailHeaderProps) {
  const hasStrip = Boolean(backdrop);
  const hasBody = Boolean(overview || afterOverview || actions);

  return (
    <header className={cn("site-container", hasStrip ? "pt-4 md:pt-6" : "pt-8 md:pt-12")}>
      <BackdropStrip src={backdrop ?? null} />

      <div
        className={cn(
          "grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-7",
          "lg:grid-cols-[13rem_minmax(0,1fr)_20rem] lg:gap-x-9",
          hasStrip && "sm:px-4 lg:px-5",
        )}
      >
        <MountedPoster
          src={poster.src}
          alt={poster.alt}
          fallback={poster.fallback}
          priority
          sizes="(max-width: 640px) 104px, (max-width: 1024px) 144px, 208px"
          className={cn(
            "col-start-1 row-start-1 self-start lg:row-span-2",
            hasStrip && "-mt-10 sm:-mt-16 lg:-mt-24",
          )}
        />

        <div
          className={cn(
            "col-start-2 row-start-1 min-w-0 self-end pt-4 lg:self-start lg:pt-7",
            !hasStrip && "self-center lg:pt-2",
          )}
        >
          {eyebrow && <div className="mb-2 text-sm text-ink-muted">{eyebrow}</div>}
          <h1 className="hero-title">{title}</h1>
          {tagline && (
            <p className="mt-2 font-serif text-lg italic leading-snug text-ink-muted">{tagline}</p>
          )}
        </div>

        {hasBody && (
          <div className="col-span-2 row-start-2 min-w-0 lg:col-span-1 lg:col-start-2">
            {overview && <div className="reading-text max-w-[62ch]">{overview}</div>}
            {afterOverview && <div className="mt-3">{afterOverview}</div>}
            {actions && <div className="mt-5 flex flex-wrap gap-2.5 empty:hidden">{actions}</div>}
          </div>
        )}

        <FactCard
          facts={facts}
          className={cn(
            "col-span-2 self-start lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1",
            hasBody ? "row-start-3" : "row-start-2",
            hasStrip ? "lg:mt-7" : "lg:mt-2",
          )}
        />
      </div>
    </header>
  );
}

/** A rating for a fact row: violet star and the score out of ten. */
export function RatingValue({ value }: { value: number }) {
  if (!(value > 0)) return null;
  return (
    <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
      <Star className="size-3.5 text-violet" weight="fill" aria-hidden="true" />
      <span className="sr-only">Rated </span>
      {formatVoteAverage(value)}
    </span>
  );
}

/** People as comma-separated links to their pages, for a fact row. */
export function PeopleLinks({ people }: { people: { id: number; name: string }[] }) {
  if (!people.length) return null;
  return (
    <>
      {people.map((person, index) => (
        <span key={person.id}>
          {index > 0 && ", "}
          <Link
            href={`/person/${person.id}`}
            className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
          >
            {person.name}
          </Link>
        </span>
      ))}
    </>
  );
}

/** Loading state for detail pages: strip, poster, text and fact card, then two panels. */
export function DetailsPageSkeleton() {
  return (
    <div aria-busy="true">
      <div className="site-container pt-4 md:pt-6">
        <Skeleton className="aspect-[5/2] w-full rounded-lg sm:aspect-[4/1]" />
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-7 sm:px-4 lg:grid-cols-[13rem_minmax(0,1fr)_20rem] lg:gap-x-9 lg:px-5">
          <Skeleton className="-mt-10 aspect-[2/3] w-full rounded-[9px] border border-line sm:-mt-16 lg:-mt-24" />
          <div className="space-y-4 pt-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full max-w-xl" />
            <div className="flex gap-2.5">
              <Skeleton className="h-11 w-36" />
              <Skeleton className="h-11 w-36" />
            </div>
          </div>
          <Skeleton className="col-span-2 h-64 lg:col-span-1 lg:mt-7" />
        </div>
      </div>
      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        {[0, 1].map((panel) => (
          <Skeleton key={panel} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
