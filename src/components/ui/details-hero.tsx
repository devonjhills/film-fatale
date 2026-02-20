"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
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

const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number];

const stagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE },
    },
  },
};

export function DetailsHero({
  item,
  mediaType,
  trailer,
  watchProviders,
}: DetailsHeroProps) {
  const backdropUrl = getImageUrl(item.backdrop_path, "backdrop", "original");
  const posterUrl = getImageUrl(item.poster_path, "poster", "w500");
  const rating = formatVoteAverage(item.vote_average);
  const releaseDate = formatDate(
    isMovieDetails(item) ? item.release_date : item.first_air_date,
  );
  const runtime = isMovieDetails(item) ? formatRuntime(item.runtime) : null;
  const title = isMovieDetails(item) ? item.title : item.name;
  const usCertification = isMovieDetails(item)
    ? getUSCertification(item.release_dates)
    : null;
  const rawReleaseDate = isMovieDetails(item)
    ? item.release_date
    : item.first_air_date;

  return (
    <>
      {/* Fixed Backdrop Background */}
      {backdropUrl && (
        <>
          <motion.div
            className="backdrop-container"
            style={{ backgroundImage: `url(${backdropUrl})` }}
            role="img"
            aria-label={`${title} backdrop`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div className="backdrop-overlay" />
        </>
      )}

      {/* Hero Section */}
      <div className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="glass border border-border/40 rounded-xl p-8 md:p-12 elevation-2">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

              {/* Poster column */}
              <motion.div
                className="flex-shrink-0"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="space-y-0">
                  <div className="relative w-60 md:w-72 lg:w-80 aspect-[2/3] mx-auto lg:mx-0 max-h-[600px]">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={title}
                        fill
                        className={`object-cover shadow-2xl ${
                          watchProviders?.flatrate?.length
                            ? "rounded-t-lg rounded-b-none"
                            : "rounded-lg"
                        }`}
                        sizes="(max-width: 768px) 240px, (max-width: 1024px) 288px, 320px"
                        priority
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center bg-muted shadow-2xl ${
                          watchProviders?.flatrate?.length
                            ? "rounded-t-lg rounded-b-none"
                            : "rounded-lg"
                        }`}
                      >
                        {mediaType === "movie" ? (
                          <Icons.Film className="h-24 w-24 text-muted-foreground" />
                        ) : (
                          <Icons.MonitorPlay className="h-24 w-24 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>

                  {watchProviders?.flatrate?.length && (
                    <div className="w-60 md:w-72 lg:w-80 mx-auto lg:mx-0">
                      <div className="rounded-b-lg rounded-t-none p-3 bg-card border border-border border-t-0 elevation-1">
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
              </motion.div>

              {/* Title + Content column */}
              <motion.div
                className="flex-1 space-y-8"
                variants={stagger.container}
                initial="hidden"
                animate="visible"
              >
                {/* Primary Information */}
                <motion.div variants={stagger.item} className="space-y-6">
                  <div>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.9] tracking-tight text-foreground drop-shadow-2xl">
                      {title}
                    </h1>
                    {((isMovieDetails(item) && item.tagline) ||
                      (isTVShowDetails(item) && item.tagline)) && (
                      <p className="font-serif text-lg md:text-xl lg:text-2xl text-foreground/75 italic mt-5 leading-relaxed">
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
                </motion.div>

                {/* Metadata badges */}
                <motion.div
                  variants={stagger.item}
                  className="flex flex-wrap items-center gap-2.5"
                >
                  {item.vote_average > 0 && (
                    <Badge variant="secondary" className="gap-1.5">
                      <Icons.Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{rating}</span>
                    </Badge>
                  )}
                  {usCertification && <Badge>{usCertification}</Badge>}
                  {releaseDate && (
                    <Badge variant="secondary" className="gap-1">
                      <Icons.Calendar className="h-3 w-3" />
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
                    <Badge variant="secondary" className="gap-1">
                      <Icons.Clock className="h-3 w-3" />
                      <span>{runtime}</span>
                    </Badge>
                  )}
                  {isTVShowDetails(item) && item.number_of_seasons && (
                    <Badge variant="secondary">
                      {item.number_of_seasons} Season
                      {item.number_of_seasons !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </motion.div>

                {/* Genres + Overview */}
                <motion.div variants={stagger.item} className="space-y-5">
                  {(isMovieDetails(item) || isTVShowDetails(item)) &&
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
                          <Badge key={genre.id} variant="outline" className="border-border/60">
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                  {item.overview && (
                    <p className="text-base md:text-lg leading-relaxed max-w-4xl text-foreground/85 font-light">
                      {item.overview}
                    </p>
                  )}
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  variants={stagger.item}
                  className="flex flex-wrap gap-3"
                >
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
                    title={`${title} - ${mediaType === "movie" ? "Movie" : "TV Show"} Details`}
                    text={`Check out "${title}" on FilmFatale!`}
                  />
                </motion.div>

                {/* External links */}
                {((isMovieDetails(item) && item.external_ids?.imdb_id) ||
                  (isTVShowDetails(item) && item.external_ids?.imdb_id) ||
                  (isMovieDetails(item) && item.homepage) ||
                  (isTVShowDetails(item) && item.homepage)) && (
                  <motion.div
                    variants={stagger.item}
                    className="pt-4 border-t border-border/50"
                  >
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
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
