"use client";

import { notFound } from "next/navigation";
import { useTVDetails, useTVWatchProviders } from "@/lib/hooks/api-hooks";
import {
  DetailHeader,
  DetailsPageSkeleton,
  PeopleLinks,
  RatingValue,
} from "@/components/ui/detail-header";
import { StreamingOn } from "@/components/shared/watch-providers";
import { TrailerModal } from "@/components/ui/trailer-modal";
import { LibraryButton } from "@/components/library/library-panel";
import { ShareButton } from "@/components/ui/share-button";
import { Chip } from "@/components/ui/chip";
import { Panel, PanelNote } from "@/components/ui/panel";
import { FactGrid } from "@/components/ui/fact-card";
import { getImageUrl } from "@/lib/api";
import { streamingServices } from "@/lib/watch-providers";
import { CastGrid, CrewList } from "@/components/person/cast-grid";
import { MediaSection } from "@/components/shared/media-section";
import { SeriesStrip } from "@/components/shared/series-strip";
import { useAuth } from "@/components/providers/auth-provider";
import { useWatchedTitles } from "@/lib/hooks/use-library";
import { similarListLink } from "@/lib/browse-link";
import type { RelatedShelf } from "@/lib/related";
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

  const providers = watchProviders?.results?.US;
  const numbered = seasons.filter((season) => season.season_number > 0).length;
  const hasSpecials = seasons.some((season) => season.season_number === 0);
  const firstYear = formatYear(tvShow.first_air_date);
  // "– present" only once a show has started airing.
  const started = Boolean(tvShow.first_air_date) && new Date(tvShow.first_air_date) <= new Date();
  const lastYear = tvShow.in_production
    ? started
      ? "present"
      : null
    : formatYear(tvShow.last_air_date);
  const aired = firstYear && (lastYear && lastYear !== firstYear ? `${firstYear} – ${lastYear}` : firstYear);
  const status = STATUS_LABELS[tvShow.status] ?? tvShow.status;
  const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

  return (
    <div>
      <DetailHeader
        backdrop={tvShow.backdrop_path ? getImageUrl(tvShow.backdrop_path, "backdrop", "w1280") : null}
        poster={{
          src: tvShow.poster_path ? getImageUrl(tvShow.poster_path, "poster", "w500") : null,
          alt: `${tvShow.name} poster`,
          fallback: "tv",
        }}
        title={tvShow.name}
        tagline={tvShow.tagline}
        overview={tvShow.overview && <p>{tvShow.overview}</p>}
        actions={
          <>
            {trailer && <TrailerModal trailer={trailer} title={tvShow.name} />}
            <LibraryButton
              meta={{
                tmdb_id: tvShow.id,
                media_type: "tv",
                title: tvShow.name,
                poster_path: tvShow.poster_path,
                overview: tvShow.overview,
                release_date: tvShow.first_air_date,
                vote_average: tvShow.vote_average,
              }}
              size="lg"
            />
            <ShareButton title={tvShow.name} />
          </>
        }
        facts={[
          { label: "Rating", value: tvShow.vote_average > 0 && <RatingValue value={tvShow.vote_average} /> },
          {
            label: "Aired",
            value: (aired || status) && (
              <span className="flex flex-wrap items-center gap-2">
                {aired && <span className="tabular-nums">{aired}</span>}
                {status && <Chip tone="mint">{status}</Chip>}
              </span>
            ),
          },
          {
            label: "Seasons",
            value:
              tvShow.number_of_seasons > 0 &&
              [
                plural(tvShow.number_of_seasons, "season"),
                tvShow.number_of_episodes > 0 && plural(tvShow.number_of_episodes, "episode"),
              ]
                .filter(Boolean)
                .join(", "),
          },
          { label: "Genres", value: tvShow.genres.map((genre) => genre.name).join(", ") },
          {
            label: "Created by",
            value: creators.length > 0 && <PeopleLinks people={creators.slice(0, 3)} />,
          },
          {
            label: "Network",
            value: tvShow.networks?.slice(0, 2).map((network) => network.name).join(", "),
          },
          {
            label: "Stream on",
            value: streamingServices(providers?.flatrate).length > 0 && <StreamingOn providers={providers} />,
          },
        ]}
      />

      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        {seasons.length > 0 && (
          <Panel
            title="Seasons"
            aside={
              <PanelNote>
                {plural(numbered, "season")}
                {hasSpecials && " + specials"}
              </PanelNote>
            }
          >
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
          </Panel>
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
          <Panel title="Cast">
            <CastGrid cast={mainCast} mediaType="tv" />
          </Panel>
        )}

        <Panel title="Details">
          <FactGrid
            facts={[
              {
                label: "Original title",
                value: tvShow.original_name !== tvShow.name ? tvShow.original_name : null,
              },
              { label: "First aired", value: tvShow.first_air_date ? firstAirDate : null },
              {
                label: tvShow.in_production ? "Latest episode" : "Last aired",
                value: tvShow.last_air_date ? lastAirDate : null,
              },
              {
                label: "Language",
                value: tvShow.spoken_languages?.[0]?.english_name || null,
              },
            ]}
          />

          <ExternalLinks
            className="mt-5 first:mt-0"
            externalIds={tvShow.external_ids}
            homepage={tvShow.homepage}
            title={tvShow.name}
            releaseDate={tvShow.first_air_date}
          />
        </Panel>

        {tvShow.credits?.crew?.length ? (
          <Panel title="Crew">
            <CrewList crew={tvShow.credits.crew} />
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

/** TMDB show statuses in the site's words. */
const STATUS_LABELS: Record<string, string> = {
  "Returning Series": "Returning",
  "In Production": "In production",
  Canceled: "Cancelled",
};
