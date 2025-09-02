"use client";

import Image from "next/image";
import {
  Calendar,
  Clock,
  Film as FilmIcon,
  MonitorPlay as TvIcon,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/api";
import { WatchStatusButton } from "@/components/shared/watch-status-button";
import { ShareButton } from "@/components/ui/share-button";
import { TrailerModal } from "@/components/ui/trailer-modal";
import { WatchProvidersCompact } from "@/components/shared/watch-providers";
import { ExternalLinks } from "@/components/ui/external-links";
import {
  formatDate,
  formatRuntime,
  formatVoteAverage,
  getUSCertification,
} from "@/lib/utils";
import type {
  WatchProviderRegion,
  MovieDetailsOrTVShowDetails,
} from "@/lib/types";
import { isMovieDetails, isTVShowDetails } from "@/lib/types";

interface DetailsHeroProps {
  item: MovieDetailsOrTVShowDetails;
  mediaType: "movie" | "tv";
  trailer?: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  };
  watchProviders?: WatchProviderRegion;
}

export function DetailsHero({
  item,
  mediaType,
  trailer,
  watchProviders,
}: DetailsHeroProps) {
  // Use highest quality backdrop for CSS background
  const backdropUrl = getImageUrl(item.backdrop_path, "backdrop", "original");
  // Use higher quality poster for larger display
  const posterUrl = getImageUrl(item.poster_path, "poster", "w500");
  const rating = formatVoteAverage(item.vote_average);
  const releaseDate = formatDate(
    isMovieDetails(item) ? item.release_date : item.first_air_date,
  );
  const runtime = isMovieDetails(item) ? formatRuntime(item.runtime) : null;
  const title = isMovieDetails(item) ? item.title : item.name;

  // Get US MPAA rating for movies
  const usCertification = isMovieDetails(item)
    ? getUSCertification(item.release_dates)
    : null;

  // External links - raw date for ExternalLinks component
  const rawReleaseDate = isMovieDetails(item)
    ? item.release_date
    : item.first_air_date;

  return (
    <>
      {/* Fixed Backdrop Background */}
      {backdropUrl && (
        <>
          <div
            className="backdrop-container"
            style={{
              backgroundImage: `url(${backdropUrl})`,
            }}
            role="img"
            aria-label={`${title} backdrop`}
          />
          <div className="backdrop-overlay" />
        </>
      )}

      {/* Hero Section */}
      <div className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="glass-hero rounded-xl p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="space-y-0">
                  {/* Poster Image */}
                  <div className="relative w-60 md:w-72 lg:w-80 aspect-[2/3] mx-auto lg:mx-0 max-h-[600px]">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={title}
                        fill
                        className={`object-cover shadow-xl ${
                          watchProviders?.flatrate?.length
                            ? "rounded-t-lg rounded-b-none"
                            : "rounded-lg"
                        }`}
                        sizes="(max-width: 768px) 240px, (max-width: 1024px) 288px, 320px"
                        priority
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center bg-muted shadow-xl ${
                          watchProviders?.flatrate?.length
                            ? "rounded-t-lg rounded-b-none"
                            : "rounded-lg"
                        }`}
                      >
                        {mediaType === "movie" ? (
                          <FilmIcon className="h-24 w-24 text-muted-foreground" />
                        ) : (
                          <TvIcon className="h-24 w-24 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Watch Now Footer - Seamlessly attached */}
                  {watchProviders?.flatrate?.length && (
                    <div className="w-60 md:w-72 lg:w-80 mx-auto lg:mx-0">
                      <div
                        className="rounded-b-lg rounded-t-none p-3 shadow-xl border-t-0"
                        style={{
                          background: "hsl(var(--glass-bg))",
                          backdropFilter: "blur(16px) saturate(180%)",
                          border: "1px solid hsl(var(--glass-border))",
                          borderTop: "none",
                          boxShadow:
                            "0 8px 32px hsl(var(--glass-shadow)), inset 0 1px 0 hsl(var(--glass-border))",
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div className="text-center space-y-0.5">
                            <div className="text-[10px] text-muted-foreground leading-tight">
                              Now Streaming
                            </div>
                            <div className="text-xs font-medium leading-tight">
                              Watch On
                            </div>
                          </div>
                          <WatchProvidersCompact providers={watchProviders} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title and Content */}
              <div className="flex-1 space-y-8">
                {/* Primary Information */}
                <div className="space-y-6">
                  <div>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.9] tracking-tight text-foreground drop-shadow-2xl">
                      {title}
                    </h1>
                    {((isMovieDetails(item) && item.tagline) ||
                      (isTVShowDetails(item) && item.tagline)) && (
                      <p className="font-serif text-lg md:text-xl lg:text-2xl text-foreground/90 italic mt-6 leading-relaxed drop-shadow-2xl">
                        &ldquo;
                        {isMovieDetails(item)
                          ? item.tagline
                          : isTVShowDetails(item)
                            ? item.tagline
                            : ""}
                        &rdquo;
                      </p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {item.vote_average > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{rating}</span>
                      </Badge>
                    )}

                    {usCertification && <Badge>{usCertification}</Badge>}

                    {releaseDate && (
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(
                            isMovieDetails(item)
                              ? item.release_date
                              : item.first_air_date,
                          ).getFullYear()}
                        </span>
                      </Badge>
                    )}

                    {runtime && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{runtime}</span>
                      </Badge>
                    )}

                    {isTVShowDetails(item) && item.number_of_seasons && (
                      <Badge variant="outline">
                        {item.number_of_seasons} Season
                        {item.number_of_seasons !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Genres and Overview */}
                <div className="space-y-6">
                  {((isMovieDetails(item) && item.genres) ||
                    (isTVShowDetails(item) && item.genres)) &&
                    (isMovieDetails(item)
                      ? item.genres
                      : isTVShowDetails(item)
                        ? item.genres
                        : []
                    ).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(isMovieDetails(item)
                          ? item.genres
                          : isTVShowDetails(item)
                            ? item.genres
                            : []
                        ).map((genre: { id: number; name: string }) => (
                          <Badge key={genre.id} variant="outline">
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                  {item.overview && (
                    <p className="text-base md:text-lg leading-relaxed max-w-4xl text-foreground/90 font-light">
                      {item.overview}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                  {trailer && (
                    <TrailerModal trailer={trailer} title={title} size="lg" />
                  )}

                  <WatchStatusButton
                    tmdb_id={item.id}
                    media_type={mediaType}
                    title={title}
                    poster_path={item.poster_path}
                    overview={item.overview}
                    release_date={rawReleaseDate}
                    vote_average={item.vote_average}
                    size="lg"
                  />

                  <ShareButton
                    title={`${title} - ${
                      mediaType === "movie" ? "Movie" : "TV Show"
                    } Details`}
                    text={`Check out "${title}" on this ${
                      mediaType === "movie" ? "movie" : "TV show"
                    } app!`}
                  />
                </div>

                {/* Additional Info */}
                {((isMovieDetails(item) && item.external_ids?.imdb_id) ||
                  (isTVShowDetails(item) && item.external_ids?.imdb_id) ||
                  (isMovieDetails(item) && item.homepage) ||
                  (isTVShowDetails(item) && item.homepage)) && (
                  <div className="pt-4 border-t">
                    <ExternalLinks
                      externalIds={
                        isMovieDetails(item)
                          ? item.external_ids
                          : isTVShowDetails(item)
                            ? item.external_ids
                            : undefined
                      }
                      homepage={
                        isMovieDetails(item)
                          ? item.homepage
                          : isTVShowDetails(item)
                            ? item.homepage
                            : undefined
                      }
                      title={title}
                      releaseDate={rawReleaseDate}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
