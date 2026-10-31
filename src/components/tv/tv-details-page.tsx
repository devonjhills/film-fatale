"use client";

import { notFound } from "next/navigation";
import { useTVDetails, useTVWatchProviders } from "@/lib/hooks/api-hooks";
import { DetailsHero, DetailsPageSkeleton } from "@/components/ui/details-hero";
import { CastGrid, CrewList } from "@/components/person/cast-grid";
import { MediaSection } from "@/components/shared/media-section";
import { SeriesStrip } from "@/components/shared/series-strip";
import { useAuth } from "@/components/providers/auth-provider";
import { useWatchedTitles } from "@/lib/hooks/use-library";
import { similarListLink } from "@/lib/browse-link";
import type { RelatedShelf } from "@/lib/related";
import { Section, FactList } from "@/components/shared/section";
import { ExternalLinks } from "@/components/ui/external-links";
import { formatDate, formatYear } from "@/lib/utils";
import type { TVShowDetails } from "@/lib/types";

interface TVDetailsPageProps {
  tvId: number;
  initialTVShow?: TVShowDetails;
  /** Creator and lead-actor shelves, fetched on the server. */
  related?: RelatedShelf[];
}

export function TVDetailsPage({
  tvId,
  initialTVShow,
  related = [],
}: TVDetailsPageProps) {
  const { tvShow, isLoading, isError } = useTVDetails(tvId, initialTVShow);
  const { watchProviders } = useTVWatchProviders(tvId);
  const { user } = useAuth();
  const watched = useWatchedTitles(Boolean(user));

  if (isLoading && !tvShow) {
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

  // Specials (season 0) go after the numbered seasons.
  const seasons = [...(tvShow.seasons || [])].sort(
    (a, b) => (a.season_number || Infinity) - (b.season_number || Infinity),
  );

  // Get creators
  const creators = tvShow.created_by || [];

  // Get TV recommendations
  // Titles in the series, director or star shelves aren't repeated here.
  const shownElsewhere = new Set(
    related.flatMap((entry) => entry.items.map((item) => `${item.media_type}-${item.id}`)),
  );
  const recommendations = (tvShow.recommendations?.results || [])
    .filter((item) => !shownElsewhere.has(`tv-${item.id}`))
    .slice(0, 16);
  const similarList = similarListLink("tv", tvShow.genres, tvShow.first_air_date);
  const relatedSections = related.map((entry) => (
    <MediaSection
      key={entry.key}
      title={entry.title}
      items={entry.items}
      mediaType="tv"
      href={entry.href}
      hrefLabel={entry.href ? "See their work" : undefined}
      watched={watched}
    />
  ));

  return (
    <div className="detail-page">
      <DetailsHero
        item={tvShow}
        mediaType="tv"
        trailer={trailer}
        watchProviders={watchProviders?.results?.US}
        credit={{ label: "Created by", people: creators.slice(0, 3) }}
      />

      <div className="site-container space-y-12 py-10 md:space-y-14 md:py-14">
        {seasons.length > 0 && (
          <Section title="Seasons">
            <SeriesStrip
              label="Seasons"
              items={seasons.map((season) => ({
                key: String(season.id),
                href: `/tv/${tvId}/season/${season.season_number}`,
                title: season.name,
                detail: [
                  formatYear(season.air_date),
                  `${season.episode_count} ep${season.episode_count === 1 ? "" : "s"}`,
                ]
                  .filter(Boolean)
                  .join(", "),
                posterPath: season.poster_path,
              }))}
            />
          </Section>
        )}

        <MediaSection
          title={`If you like ${tvShow.name}`}
          items={recommendations}
          mediaType="tv"
          href={similarList?.href}
          hrefLabel={similarList?.label}
          tall
          watched={watched}
        />

        {relatedSections}

        {mainCast.length > 0 && (
          <Section title="Cast">
            <CastGrid cast={mainCast} mediaType="tv" />
          </Section>
        )}

        <Section title="Details">
          <FactList
            facts={[
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

          <ExternalLinks
            className="mt-8"
            externalIds={tvShow.external_ids}
            homepage={tvShow.homepage}
            title={tvShow.name}
            releaseDate={tvShow.first_air_date}
          />
        </Section>

        {tvShow.credits?.crew?.length ? (
          <Section title="Crew">
            <CrewList crew={tvShow.credits.crew} />
          </Section>
        ) : null}
      </div>
    </div>
  );
}
