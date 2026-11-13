"use client";

import { notFound } from "next/navigation";
import { useTVDetails, useTVWatchProviders } from "@/lib/hooks/api-hooks";
import { DetailHeader, DetailsPageSkeleton, type HeaderCredit } from "@/components/ui/detail-header";
import { WhereToWatch } from "@/components/shared/watch-providers";
import { TrailerModal } from "@/components/ui/trailer-modal";
import { LibraryButton } from "@/components/library/library-panel";
import { ShareButton } from "@/components/ui/share-button";
import { Chip } from "@/components/ui/chip";
import { Panel, PanelNote } from "@/components/ui/panel";
import { FactGrid } from "@/components/ui/fact-card";
import { getImageUrl } from "@/lib/api";
import { CastGrid, CrewList } from "@/components/person/cast-grid";
import { MediaSection } from "@/components/shared/media-section";
import { SeriesStrip } from "@/components/shared/series-strip";
import { useAuth } from "@/components/providers/auth-provider";
import { useWatchedTitles } from "@/lib/hooks/use-library";
import { genreLinks, similarListLink } from "@/lib/browse-link";
import type { RelatedShelf } from "@/lib/related";
import { ExternalLinks } from "@/components/ui/external-links";
import { cn, formatDate, formatYear, getUSContentRating } from "@/lib/utils";
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
  const { watchProviders, isLoading: providersLoading } = useTVWatchProviders(tvId);
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
  const nextEpisode = tvShow.next_episode_to_air?.air_date ? tvShow.next_episode_to_air : null;
  const credits: HeaderCredit[] = creators.slice(0, 2).map((person) => ({ ...person, role: "Creator" }));
  credits.push(
    ...mainCast
      .slice(0, 6 - credits.length)
      .map((person) => ({ ...person, role: person.character || "Cast" })),
  );
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
        meta={[
          tvShow.type === "Miniseries" ? "Limited series" : "TV series",
          aired,
          getUSContentRating(tvShow.content_ratings) && (
            <Chip>{getUSContentRating(tvShow.content_ratings)}</Chip>
          ),
          tvShow.number_of_seasons > 0 && plural(tvShow.number_of_seasons, "season"),
        ]}
        title={tvShow.name}
        tagline={tvShow.tagline}
        genres={genreLinks("tv", tvShow.genres)}
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
        credits={credits}
        score={{ value: tvShow.vote_average, votes: tvShow.vote_count }}
        facts={[
          {
            label: "Status",
            value: status && (
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full", tvShow.in_production ? "bg-mint" : "bg-ink-muted/60")}
                />
                {status}
              </span>
            ),
          },
          {
            label: "Episodes",
            value: tvShow.number_of_episodes > 0 && String(tvShow.number_of_episodes),
            detail: tvShow.number_of_seasons > 0 && `across ${plural(tvShow.number_of_seasons, "season")}`,
          },
          nextEpisode
            ? {
                label: "Next episode",
                value: formatDate(nextEpisode.air_date),
                detail: episodeName(nextEpisode),
              }
            : {
                label: "Last aired",
                value: tvShow.last_air_date && formatDate(tvShow.last_air_date),
                detail: tvShow.last_episode_to_air && episodeName(tvShow.last_episode_to_air),
              },
          {
            label: "Network",
            value: tvShow.networks?.[0]?.name,
            detail: tvShow.networks?.[1]?.name,
          },
        ]}
        watch={<WhereToWatch providers={providers} loading={providersLoading} />}
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

/** "Season 3, episode 5", for a fact's second line. */
const episodeName = (episode: { season_number: number; episode_number: number }) =>
  `Season ${episode.season_number}, episode ${episode.episode_number}`;

/** TMDB show statuses in the site's words. */
const STATUS_LABELS: Record<string, string> = {
  "Returning Series": "Returning",
  "In Production": "In production",
  Canceled: "Cancelled",
};
