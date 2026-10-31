"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, User } from "@/components/ui/icons";
import { usePersonDetails } from "@/lib/hooks/api-hooks";
import { useWatchedTitles } from "@/lib/hooks/use-library";
import { useAuth } from "@/components/providers/auth-provider";
import { getImageUrl } from "@/lib/api";
import { formatDate, calculateAge, cn, formatVoteAverage } from "@/lib/utils";
import {
  analyzeCareer,
  creditLabel,
  creditYear,
  type Credit,
  type DecadeSummary,
  type GenreShare,
} from "@/lib/person-insights";
import type { PersonDetails } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCard } from "@/components/shared/media-card";
import { Section, FactList } from "@/components/shared/section";

interface PersonDetailsPageProps {
  personId: number;
  initialPerson?: PersonDetails;
}

const FILMOGRAPHY_PREVIEW = 20;

const DEPARTMENT_ROLES: Record<string, string> = {
  Acting: "Actor",
  Directing: "Director",
  Writing: "Writer",
  Production: "Producer",
  Editing: "Editor",
  Camera: "Cinematographer",
  Sound: "Sound",
};

const titleKey = (credit: { media_type: string; id: number }) => `${credit.media_type}-${credit.id}`;
const sentenceCase = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;

function PersonDetailsSkeleton() {
  return (
    <div className="site-container space-y-12 py-10 md:py-14" aria-busy="true">
      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <Skeleton className="aspect-[2/3] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="h-16 w-full max-w-2xl" />
        </div>
      </div>
      <div className="poster-grid poster-grid-shelf">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full" />
        ))}
      </div>
    </div>
  );
}

export function PersonDetailsPage({ personId, initialPerson }: PersonDetailsPageProps) {
  const { person, isLoading, isError } = usePersonDetails(personId, initialPerson);
  const { user } = useAuth();
  const watched = useWatchedTitles(Boolean(user));
  const career = useMemo(() => (person ? analyzeCareer(person) : null), [person]);

  if (isLoading && !person) return <PersonDetailsSkeleton />;
  if (isError || !person || !career) return notFound();

  const profileUrl = getImageUrl(person.profile_path, "profile", "h632");
  const age = calculateAge(person.birthday, person.deathday);
  const department = person.known_for_department || "Acting";
  const seenIn = career.filmography.filter((credit) => watched.has(titleKey(credit)));

  const facts = [
    DEPARTMENT_ROLES[department] ?? department,
    person.birthday &&
      `Born ${formatDate(person.birthday)}${person.place_of_birth ? ` in ${person.place_of_birth}` : ""}`,
    person.deathday && `Died ${formatDate(person.deathday)}`,
    age !== null && (person.deathday ? `Aged ${age}` : `Age ${age}`),
  ].filter(Boolean) as string[];

  return (
    <div className="site-container space-y-12 py-10 md:space-y-14 md:py-14">
      <header className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-5 gap-y-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-10 lg:gap-y-0">
        <div className="poster-frame relative aspect-[2/3] w-full overflow-hidden lg:col-start-1 lg:row-span-4 lg:row-start-1">
          {profileUrl ? (
            <Image
              src={profileUrl}
              alt={person.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 104px, (max-width: 1024px) 144px, 192px"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <User className="size-12 text-muted-foreground/50" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 self-center lg:col-start-2 lg:row-start-2 lg:self-end">
          <h1 className="hero-title">{person.name}</h1>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </p>
        </div>

        {(career.summary || seenIn.length > 0) && (
          <div className="col-span-2 min-w-0 space-y-3 lg:col-span-1 lg:col-start-2 lg:row-start-3 lg:mt-4">
            {career.summary && <p className="reading-text max-w-[62ch]">{career.summary}</p>}
            {seenIn.length > 0 && <SeenIn credits={seenIn} />}
          </div>
        )}
      </header>

      {career.knownFor.length > 0 && (
        <Section title="You probably know them from">
          <div className="poster-grid poster-grid-shelf">
            {career.knownFor.map((credit, index) => (
              <MediaCard
                key={titleKey(credit)}
                item={credit}
                mediaType={credit.media_type}
                priority={index < 4}
                note={career.isActor && credit.role ? `as ${credit.role}` : undefined}
                watched={watched.has(titleKey(credit))}
              />
            ))}
          </div>
        </Section>
      )}

      {(career.decades.length > 0 || career.genres.length > 0) && (
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
          {career.decades.length > 0 && (
            <Section title="Career by decade">
              <DecadeTimeline decades={career.decades} watched={watched} />
            </Section>
          )}

          <div className="space-y-12">
            {career.genres.length > 0 && (
              <Section title="Most often in">
                <GenreBars genres={career.genres} />
              </Section>
            )}
            <CareerFacts career={career} />
          </div>
        </div>
      )}

      {career.filmography.length > 0 && (
        <Filmography credits={career.filmography} watched={watched} />
      )}

      <Biography person={person} />
    </div>
  );
}

/** Owner only: the person's titles that are in the library as watched. */
function SeenIn({ credits }: { credits: Credit[] }) {
  const shown = credits.slice(0, 3);
  const more = credits.length - shown.length;
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm text-muted-foreground">
      <Check className="size-3.5 translate-y-0.5 text-mint" weight="bold" aria-hidden="true" />
      You&apos;ve watched them in
      {shown.map((credit, index) => (
        <span key={titleKey(credit)}>
          <Link href={`/${credit.media_type}/${credit.id}`} className="font-medium text-foreground hover:underline">
            {creditLabel(credit)}
          </Link>
          {index < shown.length - 1 ? (index === shown.length - 2 && more === 0 ? " and" : ",") : ""}
        </span>
      ))}
      {more > 0 && <span>and {more} more</span>}
    </p>
  );
}

function DecadeTimeline({ decades, watched }: { decades: DecadeSummary[]; watched: Set<string> }) {
  const busiest = Math.max(...decades.map((decade) => decade.movies + decade.shows));

  return (
    <ol className="divide-y divide-border">
      {decades.map((decade) => {
        const total = decade.movies + decade.shows;
        const counts = [
          decade.movies && `${decade.movies} ${decade.movies === 1 ? "movie" : "movies"}`,
          decade.shows && `${decade.shows} ${decade.shows === 1 ? "show" : "shows"}`,
        ].filter(Boolean);
        return (
          <li
            key={decade.decade}
            className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-4 py-4 first:pt-0 sm:grid-cols-[6rem_minmax(0,1fr)]"
          >
            <div>
              <p className="font-serif text-xl font-medium leading-tight">{decade.decade}s</p>
              <p className="mt-1 text-xs text-muted-foreground">{counts.join(", ")}</p>
              <div className="mt-2 h-1 rounded-sm bg-border" aria-hidden="true">
                <div
                  className="h-full rounded-sm bg-violet/70"
                  style={{ width: `${Math.max(8, (total / busiest) * 100)}%` }}
                />
              </div>
            </div>

            <ul className="flex min-w-0 gap-2">
              {decade.top.map((credit) => (
                <li key={titleKey(credit)} className="w-14 shrink-0 sm:w-[4.5rem]">
                  <Link href={`/${credit.media_type}/${credit.id}`} className="group block" title={creditLabel(credit)}>
                    <span className="poster-frame relative block aspect-[2/3] overflow-hidden transition-[outline-color] group-hover:outline-violet/60">
                      <Image
                        src={getImageUrl(credit.poster_path, "poster", "w154")}
                        alt=""
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                      {watched.has(titleKey(credit)) && (
                        <span className="absolute bottom-1 right-1 rounded-sm bg-background/85 p-0.5 text-mint">
                          <Check className="size-3" weight="bold" aria-hidden="true" />
                          <span className="sr-only">Watched</span>
                        </span>
                      )}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[0.6875rem] leading-tight text-muted-foreground group-hover:text-foreground">
                      {creditLabel(credit)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

function GenreBars({ genres }: { genres: GenreShare[] }) {
  return (
    <ul className="space-y-4">
      {genres.map((genre) => (
        <li key={genre.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>{sentenceCase(genre.label)}</span>
            <span className="tabular-nums text-muted-foreground">
              {genre.count} {genre.count === 1 ? "title" : "titles"}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-sm bg-border" aria-hidden="true">
            <div
              className="h-full rounded-sm bg-violet/70"
              style={{ width: `${Math.round(genre.share * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function CreditLink({ credit, detail }: { credit: Credit; detail?: string }) {
  return (
    <>
      <Link href={`/${credit.media_type}/${credit.id}`} className="hover:underline">
        {creditLabel(credit)}
      </Link>
      {detail && <span className="text-muted-foreground"> ({detail})</span>}
    </>
  );
}

function CareerFacts({ career }: { career: ReturnType<typeof analyzeCareer> }) {
  const { highestRated, longestRunning, next } = career;
  return (
    <FactList
      className="sm:grid-cols-3 lg:grid-cols-1"
      facts={[
        {
          label: "Highest rated",
          value: highestRated && (
            <CreditLink credit={highestRated} detail={`${formatVoteAverage(highestRated.vote_average)}/10`} />
          ),
        },
        {
          label: "Longest TV role",
          value: longestRunning && (
            <CreditLink credit={longestRunning} detail={`${longestRunning.episode_count} episodes`} />
          ),
        },
        {
          label: "Coming up",
          value: next && <CreditLink credit={next} detail={String(creditYear(next) ?? "TBA")} />,
        },
      ]}
    />
  );
}

type FilmographyFilter = "all" | "movie" | "tv";

function Filmography({ credits, watched }: { credits: Credit[]; watched: Set<string> }) {
  const [filter, setFilter] = useState<FilmographyFilter>("all");
  const [expanded, setExpanded] = useState(false);
  const movies = credits.filter((credit) => credit.media_type === "movie").length;
  const shows = credits.length - movies;
  const filtered = filter === "all" ? credits : credits.filter((credit) => credit.media_type === filter);
  const shown = expanded ? filtered : filtered.slice(0, FILMOGRAPHY_PREVIEW);

  const options: { value: FilmographyFilter; label: string }[] = [
    { value: "all", label: `All ${credits.length}` },
    ...(movies && shows
      ? ([
          { value: "movie", label: `Movies ${movies}` },
          { value: "tv", label: `TV ${shows}` },
        ] as const)
      : []),
  ];

  return (
    <Section
      title="Filmography"
      action={
        options.length > 1 && (
          <div className="-my-2 flex gap-1" role="group" aria-label="Filter filmography">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFilter(option.value);
                  setExpanded(false);
                }}
                aria-pressed={filter === option.value}
                className={cn(
                  "min-h-9 rounded-sm px-2.5 text-sm tabular-nums transition-colors",
                  filter === option.value
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )
      }
    >
      <ol className="divide-y divide-border">
        {shown.map((credit) => (
          <li key={titleKey(credit)}>
            <Link
              href={`/${credit.media_type}/${credit.id}`}
              className="group grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 py-3 sm:grid-cols-[4rem_minmax(0,1fr)_auto]"
            >
              <span className="text-sm tabular-nums text-muted-foreground">
                {creditYear(credit) ?? "TBA"}
              </span>
              <span className="min-w-0">
                <span className="font-medium group-hover:underline group-hover:underline-offset-4">
                  {creditLabel(credit)}
                </span>
                {watched.has(titleKey(credit)) && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-mint">
                    <Check className="size-3" weight="bold" aria-hidden="true" />
                    Watched
                  </span>
                )}
                {credit.role && (
                  <span className="block truncate text-sm text-muted-foreground">{credit.role}</span>
                )}
              </span>
              <span className="hidden text-sm tabular-nums text-muted-foreground sm:block">
                {credit.media_type === "tv"
                  ? credit.episode_count
                    ? `TV, ${credit.episode_count} ep${credit.episode_count === 1 ? "" : "s"}`
                    : "TV"
                  : "Movie"}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {filtered.length > FILMOGRAPHY_PREVIEW && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
            {expanded ? "Show less" : `Show all ${filtered.length}`}
          </Button>
        </div>
      )}
    </Section>
  );
}

function Biography({ person }: { person: PersonDetails }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = person.biography
    ? person.biography.split(/\n+/).filter((paragraph) => paragraph.trim())
    : [];
  const shown = expanded ? paragraphs : paragraphs.slice(0, 2);

  const links = [
    person.external_ids?.imdb_id && {
      label: "IMDb",
      href: `https://www.imdb.com/name/${person.external_ids.imdb_id}`,
    },
    person.external_ids?.instagram_id && {
      label: "Instagram",
      href: `https://www.instagram.com/${person.external_ids.instagram_id}`,
    },
    person.homepage && { label: "Website", href: person.homepage },
  ].filter(Boolean) as { label: string; href: string }[];

  if (!paragraphs.length && !links.length) return null;

  return (
    <Section title="Biography">
      {shown.length > 0 && (
        <div className="reading-text max-w-[62ch] space-y-4">
          {shown.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          {paragraphs.length > 2 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="font-sans text-sm font-medium underline underline-offset-4 hover:text-muted-foreground"
            >
              {expanded ? "Show less" : "Read full biography"}
            </button>
          )}
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {links.map((link) => (
            <Button key={link.label} variant="outline" size="sm" asChild>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </Button>
          ))}
        </div>
      )}
    </Section>
  );
}
