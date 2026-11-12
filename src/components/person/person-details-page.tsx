"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "@/components/ui/app-link";
import { notFound } from "next/navigation";
import { Check, Film } from "@/components/ui/icons";
import { usePersonDetails } from "@/lib/hooks/api-hooks";
import { useWatchedTitles } from "@/lib/hooks/use-library";
import { useAuth } from "@/components/providers/auth-provider";
import { getImageUrl } from "@/lib/api";
import { formatDate, calculateAge, formatVoteAverage } from "@/lib/utils";
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
import { MediaCard } from "@/components/shared/media-card";
import { Panel, PanelNote } from "@/components/ui/panel";
import { FactCard } from "@/components/ui/fact-card";
import { DetailHeader, DetailsPageSkeleton } from "@/components/ui/detail-header";
import { SegmentedControl } from "@/components/ui/segmented-control";

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

export function PersonDetailsPage({ personId, initialPerson }: PersonDetailsPageProps) {
  const { person, isLoading, isError } = usePersonDetails(personId, initialPerson);
  const { user } = useAuth();
  const watched = useWatchedTitles(Boolean(user));
  const career = useMemo(() => (person ? analyzeCareer(person) : null), [person]);

  if (isLoading && !person) return <DetailsPageSkeleton />;
  if (isError || !person || !career) return notFound();

  const age = calculateAge(person.birthday, person.deathday);
  const department = person.known_for_department || "Acting";
  const filmCount = career.decades.reduce((sum, decade) => sum + decade.movies, 0);
  const seriesCount = career.decades.reduce((sum, decade) => sum + decade.shows, 0);
  // The scene behind their header: the first title they're known for that has one.
  const knownForBackdrop = career.knownFor.find((credit) => credit.backdrop_path)?.backdrop_path ?? null;
  const seenIn = career.filmography.filter((credit) => watched.has(titleKey(credit)));

  return (
    <div>
      <DetailHeader
        backdrop={knownForBackdrop ? getImageUrl(knownForBackdrop, "backdrop", "w1280") : null}
        poster={{
          src: person.profile_path ? getImageUrl(person.profile_path, "profile", "h632") : null,
          alt: person.name,
          fallback: "person",
        }}
        title={person.name}
        overview={career.summary && <p>{career.summary}</p>}
        afterOverview={seenIn.length > 0 && <SeenIn credits={seenIn} />}
        meta={[DEPARTMENT_ROLES[department] ?? department]}
        facts={[
          { label: "Born", value: person.birthday && formatDate(person.birthday), detail: person.place_of_birth },
          person.deathday
            ? { label: "Died", value: formatDate(person.deathday), detail: age !== null && `aged ${age}` }
            : { label: "Age", value: age !== null && String(age) },
          // Same counts as the summary: released titles, not appearances.
          { label: "Films", value: filmCount > 0 && String(filmCount) },
          { label: "Series", value: seriesCount > 0 && String(seriesCount) },
        ]}
      />

      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        {career.knownFor.length > 0 && (
          <Panel title="You probably know them from">
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
          </Panel>
        )}

        {(career.decades.length > 0 || career.genres.length > 0) && (
          <div className="grid items-start gap-5 md:gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {career.decades.length > 0 && (
              <Panel title="Career by decade">
                <DecadeTimeline decades={career.decades} watched={watched} />
              </Panel>
            )}

            <div className="space-y-5 md:space-y-6">
              {career.genres.length > 0 && (
                <Panel title="Most often in">
                  <GenreBars genres={career.genres} />
                </Panel>
              )}
              <CareerFacts career={career} />
            </div>
          </div>
        )}

        <div className="grid items-start gap-5 md:gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {career.filmography.length > 0 && (
            <Filmography credits={career.filmography} watched={watched} />
          )}
          <About person={person} />
        </div>
      </div>
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
    <ol className="divide-y divide-line">
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
              <div className="mt-2 h-1 rounded-sm bg-line" aria-hidden="true">
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
                    <span className="relative block aspect-[2/3] overflow-hidden rounded-sm border border-line bg-surface-2 transition-colors group-hover:border-violet/60">
                      <Image
                        src={getImageUrl(credit.poster_path, "poster", "w154")}
                        alt=""
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                      {watched.has(titleKey(credit)) && (
                        <span className="absolute bottom-1 right-1 rounded-sm bg-page/85 p-0.5 text-mint">
                          <Check className="size-3" weight="bold" aria-hidden="true" />
                          <span className="sr-only">Watched</span>
                        </span>
                      )}
                    </span>
                    <span className="mt-1 line-clamp-2 text-2xs text-muted-foreground group-hover:text-foreground">
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
          <div className="mt-1.5 h-1.5 rounded-sm bg-line" aria-hidden="true">
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
  if (!highestRated && !longestRunning && !next) return null;

  return (
    <Panel title="Highlights" bodyClassName="p-0 sm:p-0">
      <FactCard
        className="rounded-none border-0 bg-transparent"
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
    </Panel>
  );
}

type FilmographyFilter = "all" | "movie" | "tv" | "self";

/** Credits in year groups, newest first; undated titles come last. */
function groupByYear(credits: Credit[]) {
  const groups: { year: number | null; credits: Credit[] }[] = [];
  for (const credit of credits) {
    const year = creditYear(credit);
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.credits.push(credit);
    else groups.push({ year, credits: [credit] });
  }
  return groups;
}

function Filmography({ credits, watched }: { credits: Credit[]; watched: Set<string> }) {
  const [filter, setFilter] = useState<FilmographyFilter>("all");
  const [expanded, setExpanded] = useState(false);
  // Award shows, talk shows and playing themselves sit apart from the roles.
  const roles = credits.filter((credit) => !credit.appearance);
  const appearances = credits.filter((credit) => credit.appearance);
  const movies = roles.filter((credit) => credit.media_type === "movie");
  const shows = roles.filter((credit) => credit.media_type === "tv");
  const lists: Record<FilmographyFilter, Credit[]> = {
    all: roles.length ? roles : appearances,
    movie: movies,
    tv: shows,
    self: appearances,
  };
  const filtered = lists[filter];
  const shown = expanded ? filtered : filtered.slice(0, FILMOGRAPHY_PREVIEW);

  const options: { value: FilmographyFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: lists.all.length },
    ...(movies.length && shows.length
      ? ([
          { value: "movie", label: "Movies", count: movies.length },
          { value: "tv", label: "TV", count: shows.length },
        ] as const)
      : []),
    ...(roles.length && appearances.length
      ? ([{ value: "self", label: "Appearances", count: appearances.length }] as const)
      : []),
  ];
  const choose = (value: FilmographyFilter) => {
    setFilter(value);
    setExpanded(false);
  };
  const filters = (className: string) =>
    options.length > 1 && (
      <SegmentedControl
        label="Filter filmography"
        size="sm"
        options={options}
        value={filter}
        onChange={choose}
        className={className}
      />
    );

  return (
    <Panel
      title="Filmography"
      aside={options.length > 1 ? filters("hidden sm:flex sm:flex-nowrap") : <PanelNote>{lists.all.length}</PanelNote>}
    >
      {filters("mb-4 sm:hidden")}

      <ol className="divide-y divide-line">
        {groupByYear(shown).map((group) => (
          <li
            key={group.year ?? "tba"}
            className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 py-3 first:pt-0 sm:grid-cols-[4.5rem_minmax(0,1fr)]"
          >
            <p className="pt-3.5 font-serif text-lg font-medium leading-none tabular-nums text-muted-foreground">
              {group.year ?? "TBA"}
            </p>
            <ul className="space-y-1">
              {group.credits.map((credit) => (
                <li key={titleKey(credit)}>
                  <FilmographyRow credit={credit} watched={watched.has(titleKey(credit))} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {filtered.length > FILMOGRAPHY_PREVIEW && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : `Show all ${filtered.length}`}
        </Button>
      )}
    </Panel>
  );
}

function FilmographyRow({ credit, watched }: { credit: Credit; watched: boolean }) {
  const posterUrl = getImageUrl(credit.poster_path, "poster", "w92");
  const episodes = credit.episode_count;
  const kind =
    credit.media_type === "tv"
      ? episodes
        ? `TV, ${episodes} ${episodes === 1 ? "episode" : "episodes"}`
        : "TV"
      : null;

  return (
    <Link
      href={`/${credit.media_type}/${credit.id}`}
      className="group -mx-2 grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-2"
    >
      <span className="relative flex aspect-[2/3] items-center justify-center overflow-hidden rounded-sm border border-line bg-surface-2">
        {posterUrl ? (
          <Image src={posterUrl} alt="" fill sizes="36px" className="object-cover" />
        ) : (
          <Film className="size-4 text-muted-foreground/40" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-medium">{creditLabel(credit)}</span>
          {watched && (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-mint">
              <Check className="size-3" weight="bold" aria-hidden="true" />
              Watched
            </span>
          )}
        </span>
        {(credit.role || kind) && (
          <span className="flex gap-x-3 text-sm text-muted-foreground">
            {credit.role && <span className="truncate">{credit.role}</span>}
            {kind && <span className="shrink-0 tabular-nums">{kind}</span>}
          </span>
        )}
      </span>
    </Link>
  );
}

function About({ person }: { person: PersonDetails }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = person.biography
    ? person.biography.split(/\n+/).filter((paragraph) => paragraph.trim())
    : [];
  const shown = expanded ? paragraphs : paragraphs.slice(0, 2);
  const otherNames = (person.also_known_as ?? [])
    .filter((name) => name !== person.name && /^[\p{Script=Latin}\s.'-]+$/u.test(name))
    .slice(0, 3);

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

  if (!paragraphs.length && !otherNames.length && !links.length) return null;

  return (
    <Panel title="About">
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

      {otherNames.length > 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Also known as <span className="text-foreground">{otherNames.join(", ")}</span>
        </p>
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
    </Panel>
  );
}
