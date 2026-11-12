import type { ReactNode } from "react";
import Image from "next/image";
import Link from "@/components/ui/app-link";
import { Scorecard, type Fact, type Score } from "@/components/ui/fact-card";
import { MetaLine } from "@/components/ui/meta-line";
import { MountedPoster } from "@/components/ui/mounted-poster";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, User } from "@/components/ui/icons";
import { getImageUrl } from "@/lib/api";
import { cn, formatVoteAverage } from "@/lib/utils";

export interface GenreLink {
  id: number;
  name: string;
  href?: string;
}

/** A person in the header's credits row: who they are and what they did. */
export interface HeaderCredit {
  id: number;
  name: string;
  /** "Director", "Creator", or the character they play. */
  role: string;
  profile_path: string | null;
}

interface DetailHeaderProps {
  /** Backdrop image URL, shown dimmed behind the whole header card. */
  backdrop?: string | null;
  poster: { src: string | null; alt: string; fallback: "movie" | "tv" | "person" };
  /** A line above the title, e.g. a link back to the show. */
  eyebrow?: ReactNode;
  /** Short facts read as one line above the title: type, year, certification, runtime. */
  meta?: ReactNode[];
  title: string;
  tagline?: string | null;
  genres?: GenreLink[];
  /** Prose under the title, set as reading text. */
  overview?: ReactNode;
  /** Anything that belongs right after the overview. */
  afterOverview?: ReactNode;
  /** Buttons: a drawer under the poster on wide screens, a row on phones. */
  actions?: ReactNode;
  /** The key people, shown as portraits along the bottom of the text column. */
  credits?: HeaderCredit[];
  /** The audience score shown at the top of the scorecard. */
  score?: Score | null;
  facts: Fact[];
  /** A full-width bar along the bottom of the card, e.g. where to watch. */
  footer?: ReactNode;
}

/**
 * The top of every detail page: one framed card with the title's backdrop
 * behind it, dimmed flat so the text on it reads, in three columns that end
 * level with each other.
 *
 *   wide:   [poster + action drawer] | meta, title, story … credits | scorecard
 *   phones: poster | title, then story, actions, credits and scorecard
 */
export function DetailHeader({
  backdrop,
  poster,
  eyebrow,
  meta = [],
  title,
  tagline,
  genres = [],
  overview,
  afterOverview,
  actions,
  credits = [],
  score,
  facts,
  footer,
}: DetailHeaderProps) {
  const hasBody = Boolean(overview || afterOverview || genres.length);

  return (
    <header className="site-container pt-4 md:pt-6">
      <div className="relative isolate overflow-hidden rounded-xl border border-line bg-surface-1">
        {backdrop && (
          <>
            <Image
              src={backdrop}
              alt=""
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="-z-20 object-cover object-[center_20%] brightness-[.5] saturate-[.8]"
            />
            {/* A flat, even dim (not a fade) so text anywhere on the card reads. */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-page/70" />
          </>
        )}

        <div
          className={cn(
            "grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-6 p-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6 sm:p-6",
            "[grid-template-areas:'poster_head'_'body_body'_'actions_actions'_'credits_credits'_'card_card']",
            "lg:grid-cols-[13rem_minmax(0,1fr)_19rem] lg:grid-rows-[auto_1fr_auto] lg:gap-x-9 lg:gap-y-6 lg:p-8",
            "lg:[grid-template-areas:'side_head_card'_'side_body_card'_'side_credits_card']",
            "xl:grid-cols-[14rem_minmax(0,1fr)_21rem] xl:gap-x-10",
          )}
        >
          {/* Wide screens: the poster's mat opens into a drawer of actions. On
              phones the wrapper dissolves and each part takes its own cell. */}
          <div className="contents lg:flex lg:flex-col lg:self-start lg:rounded-[10px] lg:border lg:border-line lg:bg-page lg:p-1.5 lg:[grid-area:side]">
            <MountedPoster
              src={poster.src}
              alt={poster.alt}
              fallback={poster.fallback}
              priority
              sizes="(max-width: 640px) 104px, (max-width: 1024px) 144px, 224px"
              className="w-full self-start [grid-area:poster] lg:rounded-sm lg:border-0 lg:bg-transparent lg:p-0"
            />
            {actions && (
              <div className="flex flex-wrap gap-2.5 empty:hidden [grid-area:actions] lg:mt-1.5 lg:flex-col lg:gap-1.5 lg:[&>*]:w-full">
                {actions}
              </div>
            )}
          </div>

          <div className="min-w-0 self-center [grid-area:head] lg:self-start">
            {eyebrow && <div className="mb-2 text-sm text-ink-muted">{eyebrow}</div>}
            <MetaLine items={meta} className="mb-3" />
            <h1 className="hero-title">{title}</h1>
            {tagline && (
              <p className="mt-2.5 font-serif text-lg italic leading-snug text-ink-muted md:text-xl">{tagline}</p>
            )}
          </div>

          {hasBody && (
            <div className="min-w-0 [grid-area:body]">
              {genres.length > 0 && (
                <ul aria-label="Genres" className="mb-5 flex flex-wrap gap-1.5">
                  {genres.map((genre) => (
                    <li key={genre.id}>
                      <GenreChip genre={genre} />
                    </li>
                  ))}
                </ul>
              )}
              {overview && <div className="reading-text max-w-[68ch]">{overview}</div>}
              {afterOverview && <div className="mt-3">{afterOverview}</div>}
            </div>
          )}

          {credits.length > 0 && <CreditsRow credits={credits} />}

          <Scorecard score={score} facts={facts} className="self-start [grid-area:card] lg:self-stretch" />
        </div>

        {footer && <div className="border-t border-line bg-surface-1">{footer}</div>}
      </div>
    </header>
  );
}

function GenreChip({ genre }: { genre: GenreLink }) {
  const className =
    "inline-flex h-8 items-center rounded-full border border-line-strong bg-page/60 px-3 text-ui text-ink transition-colors duration-150";
  if (!genre.href) return <span className={className}>{genre.name}</span>;
  return (
    <Link href={genre.href} className={cn(className, "hover:border-violet/60 hover:text-violet")}>
      {genre.name}
    </Link>
  );
}

/** Portraits with name and role, a quick read of who made it and who's in it. */
function CreditsRow({ credits }: { credits: HeaderCredit[] }) {
  return (
    <ul
      aria-label="Key people"
      className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 [grid-area:credits] max-sm:[&>li:nth-child(n+5)]:hidden sm:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] sm:gap-x-5 lg:border-t lg:border-line lg:pt-5"
    >
      {credits.map((person) => {
        const photo = person.profile_path ? getImageUrl(person.profile_path, "profile", "w185") : null;
        return (
          <li key={`${person.id}-${person.role}`} className="min-w-0">
            <Link href={`/person/${person.id}`} className="group flex items-center gap-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-full border border-line-strong bg-surface-2">
                {photo ? (
                  <Image src={photo} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center">
                    <User className="size-4 text-ink-muted/60" aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug text-ink group-hover:underline group-hover:underline-offset-4 sm:truncate">
                  {person.name}
                </span>
                <span className="block truncate text-ui text-ink-muted">{person.role}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
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

/** Loading state for detail pages: the header card, then two panels. */
export function DetailsPageSkeleton() {
  return (
    <div aria-busy="true">
      <div className="site-container pt-4 md:pt-6">
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-6 rounded-xl border border-line bg-surface-1 p-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6 sm:p-6 lg:grid-cols-[13rem_minmax(0,1fr)_19rem] lg:gap-x-9 lg:p-8 xl:grid-cols-[14rem_minmax(0,1fr)_21rem] xl:gap-x-10">
          <div className="space-y-1.5">
            <Skeleton className="aspect-[2/3] w-full rounded-[9px]" />
            <Skeleton className="hidden h-11 w-full lg:block" />
            <Skeleton className="hidden h-11 w-full lg:block" />
          </div>
          <div className="space-y-4 self-center lg:self-start">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-11 w-2/3 max-w-xl" />
            <Skeleton className="h-5 w-1/3 max-w-sm" />
            <Skeleton className="hidden h-24 w-full max-w-2xl lg:block" />
          </div>
          <Skeleton className="col-span-2 h-80 rounded-lg lg:col-span-1" />
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
