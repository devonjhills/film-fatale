"use client";

import { notFound } from "next/navigation";

import { useMovieDetails, useMovieWatchProviders } from "@/lib/hooks/api-hooks";
import { DetailsHero, DetailsPageSkeleton } from "@/components/ui/details-hero";
import { CastGrid, CrewList } from "@/components/person/cast-grid";
import { MediaSection } from "@/components/shared/media-section";
import { useAuth } from "@/components/providers/auth-provider";
import { useWatchedTitles } from "@/lib/hooks/use-library";
import { similarListLink } from "@/lib/browse-link";
import type { RelatedShelf } from "@/lib/related";
import { Section, FactList } from "@/components/shared/section";
import { ExternalLinks } from "@/components/ui/external-links";
import { formatDate, formatRuntime, formatCurrency } from "@/lib/utils";
import type { MovieDetails } from "@/lib/types";

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
  const { watchProviders } = useMovieWatchProviders(movieId);
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
  // Titles in the series, director or star shelves aren't repeated here.
  const shownElsewhere = new Set(
    related.flatMap((entry) => entry.items.map((item) => `${item.media_type}-${item.id}`)),
  );
  const recommendations = (movie.recommendations?.results || [])
    .filter((item) => !shownElsewhere.has(`movie-${item.id}`))
    .slice(0, 16);
  const similarList = similarListLink("movie", movie.genres, movie.release_date);
  const shelf = (key: string) => related.find((entry) => entry.key === key);
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

  return (
    <div className="detail-page">
      <DetailsHero
        item={movie}
        mediaType="movie"
        trailer={trailer}
        watchProviders={watchProviders?.results?.US}
        credit={{ label: "Directed by", people: directors }}
      />

      <div className="site-container space-y-12 py-10 md:space-y-14 md:py-14">
        {cast.length > 0 && (
          <Section title="Cast">
            <CastGrid cast={cast} mediaType="movie" />
          </Section>
        )}

        {relatedSection(shelf("collection"))}

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

        <Section title="Details">
          <FactList
            facts={[
              { label: "Released", value: movie.release_date ? formatDate(movie.release_date) : null },
              { label: "Runtime", value: formatRuntime(movie.runtime) || null },
              { label: "Status", value: movie.status !== "Released" ? movie.status : null },
              { label: "Budget", value: movie.budget > 0 ? formatCurrency(movie.budget) : null },
              { label: "Box office", value: movie.revenue > 0 ? formatCurrency(movie.revenue) : null },
              {
                label: "Production",
                value: movie.production_companies.length
                  ? movie.production_companies.slice(0, 2).map((company) => company.name).join(", ")
                  : null,
              },
              {
                label: "Language",
                value: movie.spoken_languages?.[0]?.english_name || null,
              },
            ]}
          />

          <ExternalLinks
            className="mt-8"
            externalIds={movie.external_ids}
            homepage={movie.homepage}
            title={movie.title}
            releaseDate={movie.release_date}
          />
        </Section>

        {crew.length > 0 && (
          <Section title="Crew">
            <CrewList crew={crew} />
          </Section>
        )}
      </div>
    </div>
  );
}
