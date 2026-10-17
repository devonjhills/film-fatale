"use client";

import Link from "next/link";
import { notFound } from "next/navigation";

import { useMovieDetails, useMovieWatchProviders } from "@/lib/hooks/api-hooks";
import { DetailsHero, DetailsPageSkeleton } from "@/components/ui/details-hero";
import { CastGrid, CrewList } from "@/components/person/cast-grid";
import { MediaGrid } from "@/components/shared/media-grid";
import { Section, FactList } from "@/components/shared/section";
import { ExternalLinks } from "@/components/ui/external-links";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRuntime, formatCurrency } from "@/lib/utils";
import type { MovieDetails } from "@/lib/types";

interface MovieDetailsPageProps {
  movieId: number;
  initialMovie?: MovieDetails;
}

export function MovieDetailsPage({
  movieId,
  initialMovie,
}: MovieDetailsPageProps) {
  const { movie, isLoading, isError } = useMovieDetails(movieId, initialMovie);
  const { watchProviders } = useMovieWatchProviders(movieId);

  if (isLoading) {
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
  const keywords = movie.keywords?.keywords?.slice(0, 12) || [];
  const recommendations = movie.recommendations?.results?.slice(0, 16) || [];

  return (
    <div className="detail-page">
      <DetailsHero
        item={movie}
        mediaType="movie"
        trailer={trailer}
        watchProviders={watchProviders?.results?.US}
      />

      <div className="site-container space-y-16 py-14 md:space-y-20 md:py-20">
        <Section title="Details">
          <FactList
            facts={[
              {
                label: directors.length > 1 ? "Directors" : "Director",
                value: directors.length
                  ? directors.map((director, index) => (
                      <span key={director.id}>
                        {index > 0 && ", "}
                        <Link href={`/person/${director.id}`} className="hover:underline">
                          {director.name}
                        </Link>
                      </span>
                    ))
                  : null,
              },
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
            externalIds={movie.external_ids}
            homepage={movie.homepage}
            title={movie.title}
            releaseDate={movie.release_date}
          />
        </Section>

        {cast.length > 0 && (
          <Section title="Cast">
            <CastGrid cast={cast} mediaType="movie" />
          </Section>
        )}

        {crew.length > 0 && (
          <Section title="Crew">
            <CrewList crew={crew} />
          </Section>
        )}

        {recommendations.length > 0 && (
          <Section title="More like this">
            <MediaGrid
              items={recommendations}
              mediaType="movie"
              className="poster-grid-two-rows"
            />
          </Section>
        )}
      </div>
    </div>
  );
}
