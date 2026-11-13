"use client";

import { notFound } from "next/navigation";

import { useMovieDetails, useMovieWatchProviders } from "@/lib/hooks/api-hooks";
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
import {
  formatCurrency,
  formatDate,
  formatRuntime,
  formatYear,
  getUSCertification,
} from "@/lib/utils";
import type { MovieDetails } from "@/lib/types";

const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Dollars in a few characters: $839M, $1.2B. */
const compactMoney = (amount: number) => moneyFormat.format(amount);

/** People in credit order, each once (a writer can be credited for story and screenplay). */
function uniquePeople<T extends { id: number }>(people: T[]) {
  const seen = new Set<number>();
  return people.filter((person) => !seen.has(person.id) && seen.add(person.id));
}

interface MovieDetailsPageProps {
  movieId: number;
  initialMovie?: MovieDetails;
  /** Series, director and lead-actor shelves, fetched on the server. */
  related?: RelatedShelf[];
}

export function MovieDetailsPage({
  movieId,
  initialMovie,
  related = [],
}: MovieDetailsPageProps) {
  const { movie, isLoading, isError } = useMovieDetails(movieId, initialMovie);
  const { watchProviders, isLoading: providersLoading } = useMovieWatchProviders(movieId);
  const { user } = useAuth();
  const watched = useWatchedTitles(Boolean(user));

  if (isLoading && !movie) {
    return <DetailsPageSkeleton />;
  }

  if (isError || !movie) {
    return notFound();
  }

  const trailer = movie.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );
  const cast = movie.credits?.cast || [];
  const crew = movie.credits?.crew || [];
  const directors = crew.filter((person) => person.job === "Director");
  const writers = uniquePeople(
    crew.filter((person) => ["Screenplay", "Writer", "Story", "Novel"].includes(person.job)),
  ).slice(0, 3);
  const credits: HeaderCredit[] = [
    ...directors.slice(0, 2).map((person) => ({ ...person, role: "Director" })),
    ...writers
      .filter((person) => !directors.some((director) => director.id === person.id))
      .slice(0, 1)
      .map((person) => ({ ...person, role: person.job === "Novel" ? "Novel" : "Writer" })),
  ];
  credits.push(
    ...cast
      .slice(0, 6 - credits.length)
      .map((person) => ({ ...person, role: person.character || "Cast" })),
  );
  const language = movie.spoken_languages?.find(
    (entry) => entry.iso_639_1 === movie.original_language,
  )?.english_name;
  const studio = movie.production_companies?.[0]?.name;
  // Titles in the series, director or star shelves aren't repeated here.
  const shownElsewhere = new Set(
    related.flatMap((entry) => entry.items.map((item) => `${item.media_type}-${item.id}`)),
  );
  const recommendations = (movie.recommendations?.results || [])
    .filter((item) => !shownElsewhere.has(`movie-${item.id}`))
    .slice(0, 16);
  const similarList = similarListLink("movie", movie.genres, movie.release_date);
  const shelf = (key: string) => related.find((entry) => entry.key === key);
  const collection = shelf("collection");
  const relatedSection = (entry: RelatedShelf | undefined) =>
    entry && (
      <MediaSection
        key={entry.key}
        title={entry.title}
        items={entry.items}
        mediaType="movie"
        href={entry.href}
        hrefLabel={entry.href ? "See their work" : undefined}
        watched={watched}
      />
    );

  const providers = watchProviders?.results?.US;
  const certification = getUSCertification(movie.release_dates);

  return (
    <div>
      <DetailHeader
        backdrop={movie.backdrop_path ? getImageUrl(movie.backdrop_path, "backdrop", "w1280") : null}
        poster={{
          src: movie.poster_path ? getImageUrl(movie.poster_path, "poster", "w500") : null,
          alt: `${movie.title} poster`,
          fallback: "movie",
        }}
        meta={[
          "Film",
          formatYear(movie.release_date),
          certification && <Chip>{certification}</Chip>,
          formatRuntime(movie.runtime),
        ]}
        title={movie.title}
        tagline={movie.tagline}
        genres={genreLinks("movie", movie.genres)}
        overview={movie.overview && <p>{movie.overview}</p>}
        actions={
          <>
            {trailer && <TrailerModal trailer={trailer} title={movie.title} />}
            <LibraryButton
              meta={{
                tmdb_id: movie.id,
                media_type: "movie",
                title: movie.title,
                poster_path: movie.poster_path,
                overview: movie.overview,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
              }}
              size="lg"
            />
            <ShareButton title={movie.title} />
          </>
        }
        credits={credits}
        score={{ value: movie.vote_average, votes: movie.vote_count }}
        facts={[
          {
            label: !movie.status || movie.status === "Released" ? "Released" : "Release date",
            value: movie.release_date ? formatDate(movie.release_date) : "TBA",
            detail: movie.status && movie.status !== "Released" ? movie.status : null,
          },
          {
            label: movie.revenue > 0 ? "Box office" : "Budget",
            value:
              movie.revenue > 0
                ? compactMoney(movie.revenue)
                : movie.budget > 0 && compactMoney(movie.budget),
            detail: movie.revenue > 0 && movie.budget > 0 ? `on a ${compactMoney(movie.budget)} budget` : null,
          },
          { label: "Language", value: language },
          {
            label: "Studio",
            value: studio,
            detail: movie.production_companies?.[1]?.name,
          },
        ]}
        watch={<WhereToWatch providers={providers} loading={providersLoading} />}
      />

      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        {collection && (
          <Panel title={collection.title} aside={<PanelNote>{collection.items.length} films</PanelNote>}>
            <SeriesStrip
              label={collection.title}
              items={collection.items.map((item) => ({
                key: String(item.id),
                href: `/movie/${item.id}`,
                title: item.title ?? "",
                detail: formatYear(item.release_date) || "TBA",
                posterPath: item.poster_path,
                current: item.current,
                watched: watched.has(`movie-${item.id}`),
              }))}
            />
          </Panel>
        )}

        <MediaSection
          title={`If you like ${movie.title}`}
          items={recommendations}
          mediaType="movie"
          href={similarList?.href}
          hrefLabel={similarList?.label}
          tall
          watched={watched}
        />

        {relatedSection(shelf("director"))}
        {relatedSection(shelf("star"))}

        {cast.length > 0 && (
          <Panel title="Cast">
            <CastGrid cast={cast} mediaType="movie" />
          </Panel>
        )}

        <Panel title="Details">
          <FactGrid
            facts={[
              {
                label: "Original title",
                value: movie.original_title !== movie.title ? movie.original_title : null,
              },
              { label: "Budget", value: movie.budget > 0 ? formatCurrency(movie.budget) : null },
              { label: "Box office", value: movie.revenue > 0 ? formatCurrency(movie.revenue) : null },
              {
                label: "Production",
                value: movie.production_companies.length
                  ? movie.production_companies.slice(0, 4).map((company) => company.name).join(", ")
                  : null,
              },
              {
                label: "Spoken languages",
                value: movie.spoken_languages?.map((entry) => entry.english_name).join(", ") || null,
              },
            ]}
          />

          <ExternalLinks
            className="mt-5 first:mt-0"
            externalIds={movie.external_ids}
            homepage={movie.homepage}
            title={movie.title}
            releaseDate={movie.release_date}
          />
        </Panel>

        {crew.length > 0 && (
          <Panel title="Crew">
            <CrewList crew={crew} />
          </Panel>
        )}
      </div>
    </div>
  );
}
