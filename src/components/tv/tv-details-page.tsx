"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Film } from "@/components/ui/icons";
import { useTVDetails, useTVWatchProviders } from "@/lib/hooks/api-hooks";
import { getImageUrl } from "@/lib/api";
import { DetailsHero, DetailsPageSkeleton } from "@/components/ui/details-hero";
import { CastGrid, CrewList } from "@/components/person/cast-grid";
import { MediaGrid } from "@/components/shared/media-grid";
import { Section, FactList } from "@/components/shared/section";
import { ExternalLinks } from "@/components/ui/external-links";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { TVShowDetails } from "@/lib/types";

interface TVDetailsPageProps {
  tvId: number;
  initialTVShow?: TVShowDetails;
}

export function TVDetailsPage({
  tvId,
  initialTVShow,
}: TVDetailsPageProps) {
  const { tvShow, isLoading, isError } = useTVDetails(tvId, initialTVShow);
  const { watchProviders } = useTVWatchProviders(tvId);

  if (isLoading) {
    return <DetailsPageSkeleton />;
  }

  if (isError || !tvShow) {
    return notFound();
  }

  const firstAirDate = formatDate(tvShow.first_air_date);
  const lastAirDate = formatDate(tvShow.last_air_date);

  // Get trailer video
  const trailer = tvShow.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );

  // Get main cast - transform aggregate_credits to match regular credits structure
  const mainCast = tvShow.aggregate_credits?.cast
    ? tvShow.aggregate_credits.cast.map((actor) => ({
        id: actor.id,
        name: actor.name,
        profile_path: actor.profile_path,
        character: actor.roles[0]?.character || "", // Use first role
        order: actor.order,
        episode_count: actor.total_episode_count, // Total episodes across all roles
        // Include other required CastMember fields
        adult: actor.adult,
        gender: actor.gender,
        known_for_department: actor.known_for_department,
        original_name: actor.original_name,
        popularity: actor.popularity,
        cast_id: 0, // Not available in aggregate_credits
        credit_id: actor.roles[0]?.credit_id || "",
      }))
    : tvShow.credits?.cast || [];

  // Get creators
  const creators = tvShow.created_by || [];

  // Get keywords
  const keywords = tvShow.keywords?.results?.slice(0, 12) || [];

  // Get TV recommendations
  const recommendations = tvShow.recommendations?.results?.slice(0, 16) || [];

  return (
    <div className="detail-page">
      {/* Hero Section */}
      <DetailsHero
        item={tvShow}
        mediaType="tv"
        trailer={trailer}
        watchProviders={watchProviders?.results?.US}
      />

      <div className="site-container space-y-16 py-14 md:space-y-20 md:py-20">
        <Section title="Details">
          <FactList
            facts={[
              {
                label: creators.length > 1 ? "Created by" : "Creator",
                value: creators.length
                  ? creators.slice(0, 3).map((creator, index) => (
                      <span key={creator.id}>
                        {index > 0 && ", "}
                        <Link href={`/person/${creator.id}`} className="hover:underline">
                          {creator.name}
                        </Link>
                      </span>
                    ))
                  : null,
              },
              { label: "First aired", value: tvShow.first_air_date ? firstAirDate : null },
              {
                label: tvShow.in_production ? "Latest episode" : "Last aired",
                value: tvShow.last_air_date ? lastAirDate : null,
              },
              { label: "Status", value: tvShow.status || null },
              { label: "Seasons", value: tvShow.number_of_seasons || null },
              { label: "Episodes", value: tvShow.number_of_episodes || null },
              {
                label: "Network",
                value: tvShow.networks?.length
                  ? tvShow.networks.slice(0, 2).map((network) => network.name).join(", ")
                  : null,
              },
              {
                label: "Language",
                value: tvShow.spoken_languages?.[0]?.english_name || null,
              },
            ]}
          />

          {keywords.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge key={keyword.id} variant="secondary">
                  {keyword.name}
                </Badge>
              ))}
            </div>
          )}

          <ExternalLinks
            className="mt-8"
            externalIds={tvShow.external_ids}
            homepage={tvShow.homepage}
            title={tvShow.name}
            releaseDate={tvShow.first_air_date}
          />
        </Section>

        {tvShow.seasons && tvShow.seasons.length > 0 && (
          <Section title="Seasons">
            <div className="poster-grid">
              {tvShow.seasons.map((season) => {
                const posterUrl = getImageUrl(season.poster_path, "poster", "w342");
                return (
                  <article key={season.id} className="group min-w-0">
                    <Link
                      href={`/tv/${tvId}/season/${season.season_number}`}
                      className="poster-card"
                    >
                      <div className="poster-card-art">
                        {posterUrl ? (
                          <Image
                            src={posterUrl}
                            alt=""
                            fill
                            sizes="(max-width: 639px) 33vw, 180px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Film className="size-7 text-muted-foreground/50" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="poster-card-body">
                        <h3 className="line-clamp-2 text-[0.8125rem] font-medium leading-snug text-foreground group-hover:underline group-hover:underline-offset-4">
                          {season.name}
                        </h3>
                        <p className="mt-auto flex justify-between gap-2 text-xs tabular-nums text-muted-foreground">
                          <span>
                            {season.episode_count} ep{season.episode_count === 1 ? "" : "s"}
                          </span>
                          {season.air_date && <span>{new Date(season.air_date).getUTCFullYear()}</span>}
                        </p>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </Section>
        )}

        {mainCast.length > 0 && (
          <Section title="Cast">
            <CastGrid cast={mainCast} mediaType="tv" />
          </Section>
        )}

        {tvShow.credits?.crew?.length ? (
          <Section title="Crew">
            <CrewList crew={tvShow.credits.crew} />
          </Section>
        ) : null}

        {recommendations.length > 0 && (
          <Section title="More like this">
            <MediaGrid
              items={recommendations}
              mediaType="tv"
              className="poster-grid-two-rows"
            />
          </Section>
        )}
      </div>
    </div>
  );
}
