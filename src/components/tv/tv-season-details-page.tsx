"use client";

import Image from "next/image";
import Link from "@/components/ui/app-link";
import { ArrowLeft, ArrowRight, Play, Star } from "@/components/ui/icons";
import { useTVSeasonDetails, useTVDetails } from "@/lib/hooks/api-hooks";
import { getImageUrl } from "@/lib/api";
import { CastGrid, CrewList } from "@/components/person/cast-grid";
import { Panel, PanelNote } from "@/components/ui/panel";
import {
  DetailHeader,
  DetailsPageSkeleton,
  RatingValue,
} from "@/components/ui/detail-header";
import { Button } from "@/components/ui/button";
import { formatDate, formatVoteAverage, formatRuntime } from "@/lib/utils";
import type { TVSeasonDetails, TVShowDetails } from "@/lib/types";

interface TVSeasonDetailsPageProps {
  tvId: number;
  seasonNumber: number;
  initialSeason?: TVSeasonDetails;
  initialTVShow?: TVShowDetails;
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

  if (isLoading && !season) {
    return <DetailsPageSkeleton />;
  }

  if (isError || !season) {
    return (
      <div className="site-container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="page-title">Season not found</h1>
        <p className="page-lede">
          This season isn&apos;t listed for this show.
        </p>
        <Button asChild>
          <Link href={`/tv/${tvId}`}>Back to the show</Link>
        </Button>
      </div>
    );
  }

  const episodes = season.episodes || [];
  const seasonCast = season.credits?.cast || [];
  const seasonCrew = season.credits?.crew || [];

  const seasonNumbers = (tvShow?.seasons || [])
    .map((s) => s.season_number)
    .sort((a, b) => a - b);
  const index = seasonNumbers.indexOf(seasonNumber);
  const previous =
    index > 0
      ? tvShow?.seasons.find(
          (s) => s.season_number === seasonNumbers[index - 1],
        )
      : undefined;
  const next =
    index >= 0 && index < seasonNumbers.length - 1
      ? tvShow?.seasons.find(
          (s) => s.season_number === seasonNumbers[index + 1],
        )
      : undefined;

  return (
    <div>
      <DetailHeader
        backdrop={
          tvShow?.backdrop_path
            ? getImageUrl(tvShow.backdrop_path, "backdrop", "w1280")
            : null
        }
        poster={{
          src: season.poster_path
            ? getImageUrl(season.poster_path, "poster", "w500")
            : null,
          alt: `${season.name} poster`,
          fallback: "tv",
        }}
        eyebrow={
          <Link href={`/tv/${tvId}`} className="hover:text-ink hover:underline">
            {tvShow?.name || "Back to the show"}
          </Link>
        }
        title={season.name}
        overview={season.overview && <p>{season.overview}</p>}
        facts={[
          {
            label: "Rating",
            value: season.vote_average > 0 && (
              <RatingValue value={season.vote_average} />
            ),
          },
          {
            label: "Aired",
            value: season.air_date && formatDate(season.air_date),
          },
          {
            label: "Episodes",
            value:
              episodes.length > 0 &&
              `${episodes.length} episode${episodes.length === 1 ? "" : "s"}`,
          },
        ]}
      />

      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        {episodes.length > 0 && (
          <Panel
            title="Episodes"
            aside={<PanelNote>{episodes.length}</PanelNote>}
          >
            <ol className="divide-y divide-line">
              {episodes.map((episode) => {
                const stillUrl = getImageUrl(
                  episode.still_path,
                  "backdrop",
                  "w300",
                );
                return (
                  <li
                    key={episode.id}
                    className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:gap-5"
                  >
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md border border-line bg-surface-2 sm:w-44">
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
                          <Play
                            className="size-6 text-muted-foreground/50"
                            aria-hidden="true"
                          />
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
                              <Star
                                className="size-3"
                                weight="fill"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Rated </span>
                              {formatVoteAverage(episode.vote_average)}
                            </span>
                          )}
                          {episode.runtime > 0 && (
                            <span>{formatRuntime(episode.runtime)}</span>
                          )}
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
          </Panel>
        )}

        {seasonCast.length > 0 && (
          <Panel title="Cast">
            <CastGrid cast={seasonCast} mediaType="movie" />
          </Panel>
        )}

        {seasonCrew.length > 0 && (
          <Panel title="Crew">
            <CrewList crew={seasonCrew} />
          </Panel>
        )}

        {(previous || next) && (
          <nav aria-label="Seasons" className="flex justify-between gap-3">
            {previous ? (
              <Button variant="secondary" asChild>
                <Link href={`/tv/${tvId}/season/${previous.season_number}`}>
                  <ArrowLeft aria-hidden="true" />
                  {previous.name}
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {next && (
              <Button variant="secondary" asChild>
                <Link href={`/tv/${tvId}/season/${next.season_number}`}>
                  {next.name}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
