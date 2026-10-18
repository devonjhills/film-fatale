"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Film, Play, Star } from "@/components/ui/icons";
import { useTVSeasonDetails, useTVDetails } from "@/lib/hooks/api-hooks";
import { getImageUrl } from "@/lib/api";
import { CastGrid, CrewList } from "@/components/person/cast-grid";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { formatDate, formatVoteAverage, formatRuntime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { TVSeasonDetails, TVShowDetails } from "@/lib/types";

interface TVSeasonDetailsPageProps {
  tvId: number;
  seasonNumber: number;
  initialSeason?: TVSeasonDetails;
  initialTVShow?: TVShowDetails;
}

function SeasonDetailsSkeleton() {
  return (
    <div className="site-container space-y-16 py-14 md:py-20" aria-busy="true">
      <div className="flex flex-col gap-8 md:flex-row md:items-end">
        <Skeleton className="mx-auto aspect-[2/3] w-36 md:mx-0 md:w-44" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-64" />
          <Skeleton className="h-16 w-full max-w-2xl" />
        </div>
      </div>
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-5">
            <Skeleton className="aspect-video w-40 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TVSeasonDetailsPage({
  tvId,
  seasonNumber,
  initialSeason,
  initialTVShow,
}: TVSeasonDetailsPageProps) {
  const { season, isLoading, isError } = useTVSeasonDetails(
    tvId,
    seasonNumber,
    initialSeason,
  );
  const { tvShow } = useTVDetails(tvId, initialTVShow);

  if (isLoading) {
    return <SeasonDetailsSkeleton />;
  }

  if (isError || !season) {
    return (
      <div className="site-container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="page-title">Season not found</h1>
        <p className="page-lede">This season isn&apos;t listed for this show.</p>
        <Button asChild>
          <Link href={`/tv/${tvId}`}>Back to the show</Link>
        </Button>
      </div>
    );
  }

  const posterUrl = getImageUrl(season.poster_path, "poster", "w342");
  const episodes = season.episodes || [];
  const seasonCast = season.credits?.cast || [];
  const seasonCrew = season.credits?.crew || [];

  const seasonNumbers = (tvShow?.seasons || [])
    .map((s) => s.season_number)
    .sort((a, b) => a - b);
  const index = seasonNumbers.indexOf(seasonNumber);
  const previous = index > 0 ? tvShow?.seasons.find((s) => s.season_number === seasonNumbers[index - 1]) : undefined;
  const next = index >= 0 && index < seasonNumbers.length - 1
    ? tvShow?.seasons.find((s) => s.season_number === seasonNumbers[index + 1])
    : undefined;

  return (
    <div className="site-container space-y-16 py-14 md:space-y-20 md:py-20">
      <header className="flex flex-col gap-8 md:flex-row md:items-end md:gap-12">
        <div className="poster-frame relative mx-auto aspect-[2/3] w-36 shrink-0 overflow-hidden md:mx-0 md:w-48">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="192px"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Film className="size-8 text-muted-foreground/50" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/tv/${tvId}`}
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            {tvShow?.name || "Back to the show"}
          </Link>
          <h1 className="page-title mt-2">{season.name}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums text-muted-foreground">
            {season.vote_average > 0 && (
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Star className="size-3.5" weight="fill" aria-hidden="true" />
                <span className="sr-only">Rated </span>
                {formatVoteAverage(season.vote_average)}
              </span>
            )}
            {season.air_date && <span>{formatDate(season.air_date)}</span>}
            {episodes.length > 0 && (
              <span>
                {episodes.length} episode{episodes.length === 1 ? "" : "s"}
              </span>
            )}
          </p>
          {season.overview && (
            <p className="reading-text mt-5 max-w-[62ch]">{season.overview}</p>
          )}
        </div>
      </header>

      {episodes.length > 0 && (
        <Section title="Episodes">
          <ol className="divide-y divide-border">
            {episodes.map((episode) => {
              const stillUrl = getImageUrl(episode.still_path, "backdrop", "w300");
              return (
                <li key={episode.id} className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:gap-6">
                  <div className="poster-frame relative aspect-video w-full shrink-0 overflow-hidden sm:w-44">
                    {stillUrl ? (
                      <Image
                        src={stillUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 176px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Play className="size-6 text-muted-foreground/50" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="font-medium">
                        <span className="tabular-nums text-muted-foreground">
                          {episode.episode_number}.
                        </span>{" "}
                        {episode.name}
                      </h3>
                      <p className="flex gap-4 text-sm tabular-nums text-muted-foreground">
                        {episode.vote_average > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Star className="size-3" weight="fill" aria-hidden="true" />
                            <span className="sr-only">Rated </span>
                            {formatVoteAverage(episode.vote_average)}
                          </span>
                        )}
                        {episode.runtime > 0 && <span>{formatRuntime(episode.runtime)}</span>}
                      </p>
                    </div>
                    {episode.air_date && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDate(episode.air_date)}
                      </p>
                    )}
                    {episode.overview && (
                      <p className="mt-2 max-w-[75ch] text-sm leading-6 text-foreground/80">
                        {episode.overview}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {seasonCast.length > 0 && (
        <Section title="Cast">
          <CastGrid cast={seasonCast} mediaType="movie" />
        </Section>
      )}

      {seasonCrew.length > 0 && (
        <Section title="Crew">
          <CrewList crew={seasonCrew} />
        </Section>
      )}

      {(previous || next) && (
        <nav aria-label="Seasons" className="flex justify-between gap-4 border-t border-border pt-6">
          {previous ? (
            <Link
              href={`/tv/${tvId}/season/${previous.season_number}`}
              className="group flex min-h-11 items-center gap-2 text-sm"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span className="group-hover:underline">{previous.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/tv/${tvId}/season/${next.season_number}`}
              className="group flex min-h-11 items-center gap-2 text-sm"
            >
              <span className="group-hover:underline">{next.name}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
