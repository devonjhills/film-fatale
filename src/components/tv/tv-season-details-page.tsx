"use client";

import Link from "@/components/ui/app-link";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { useTVSeasonDetails, useTVDetails } from "@/lib/hooks/api-hooks";
import { getImageUrl } from "@/lib/api";
import { CastGrid, CrewList } from "@/components/person/cast-grid";
import { Panel } from "@/components/ui/panel";
import { SeasonEpisodes } from "@/components/tv/season-episodes";
import { DetailHeader, DetailsPageSkeleton } from "@/components/ui/detail-header";
import { Button } from "@/components/ui/button";
import { formatDate, formatRuntime, formatYear } from "@/lib/utils";
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
  const finale = episodes.length > 1 ? episodes[episodes.length - 1] : undefined;
  const totalRuntime = episodes.reduce((sum, episode) => sum + (episode.runtime || 0), 0);

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
        meta={[
          season.season_number > 0 ? `Season ${season.season_number}` : "Specials",
          formatYear(season.air_date),
          episodes.length > 0 && `${episodes.length} episode${episodes.length === 1 ? "" : "s"}`,
        ]}
        score={{ value: season.vote_average }}
        facts={[
          { label: "Premiered", value: season.air_date && formatDate(season.air_date) },
          {
            label: "Finale",
            value: finale?.air_date && formatDate(finale.air_date),
          },
          {
            label: "Runtime",
            value: totalRuntime > 0 && formatRuntime(totalRuntime),
          },
          { label: "Network", value: tvShow?.networks?.[0]?.name },
        ]}
      />

      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        {episodes.length > 0 && (
          <SeasonEpisodes
            episodes={episodes}
            seasonNumber={season.season_number}
            show={
              tvShow
                ? {
                    tmdb_id: tvShow.id,
                    media_type: "tv",
                    title: tvShow.name,
                    poster_path: tvShow.poster_path,
                    overview: tvShow.overview,
                    release_date: tvShow.first_air_date,
                    vote_average: tvShow.vote_average,
                  }
                : null
            }
          />
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
