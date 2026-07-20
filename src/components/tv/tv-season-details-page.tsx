"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Film, Play, Star } from "@/components/ui/icons";
import { useTVSeasonDetails, useTVDetails } from "@/lib/hooks/api-hooks";
import { getImageUrl } from "@/lib/api";
import { PersonCard } from "@/components/person/person-card";
import { formatDate, formatVoteAverage, formatRuntime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { BackNavigation } from "@/components/ui/back-navigation";
import type { TVSeasonDetails, TVShowDetails } from "@/lib/types";

interface TVSeasonDetailsPageProps {
  tvId: number;
  seasonNumber: number;
  initialSeason?: TVSeasonDetails;
  initialTVShow?: TVShowDetails;
}

function SeasonDetailsSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="relative bg-muted p-8">
        <div className="site-container space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <Skeleton className="aspect-[2/3] w-full max-w-xs" />
            </div>
            <div className="md:col-span-9 space-y-4">
              <Skeleton className="h-12 w-96" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-20 w-full max-w-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="site-container space-y-8 py-8">
        {/* Season Overview Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Episodes List Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg">
                    <Skeleton className="aspect-video w-32 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-48" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-12 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cast Section Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 rounded-lg"
                  >
                    <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
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

  if (isLoading) {
    return <SeasonDetailsSkeleton />;
  }

  if (isError || !season) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Film className="mx-auto h-16 w-16 text-muted-foreground" weight="duotone" />
          <h1 className="text-2xl font-bold">Season Not Found</h1>
          <p className="text-muted-foreground">
            The season you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href={`/tv/${tvId}`}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to TV Show
          </Link>
        </div>
      </div>
    );
  }

  const rating = formatVoteAverage(season.vote_average);
  const airDate = formatDate(season.air_date);

  // Get season cast with episode counts
  const seasonCast = season.credits?.cast || [];
  const seasonCrew = season.credits?.crew || [];

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: "TV Shows", href: "/tv" },
    {
      label: tvShow?.name || "TV Show",
      href: `/tv/${tvId}`,
    },
    {
      label: `Season ${seasonNumber}`,
      current: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="site-container pb-6 pt-10">
        <div className="flex items-center justify-between gap-4">
          <BreadcrumbNavigation items={breadcrumbItems} />
          <BackNavigation fallbackHref={`/tv/${tvId}`} />
        </div>
      </div>

      {/* Main Content */}
      <div className="site-container space-y-8 pb-16">
        {/* Season Header */}
        <Card className="overflow-hidden bg-[linear-gradient(120deg,oklch(0.25_0.072_25/0.22),transparent_42%),var(--card)]">
          <CardContent className="p-7 md:p-9">
            <div className="flex flex-col gap-8 md:flex-row md:items-end">
              {/* Season Poster */}
              <div className="poster-frame relative mx-auto aspect-[2/3] w-36 flex-shrink-0 overflow-hidden md:mx-0 md:w-44">
                {season.poster_path ? (
                  <Image
                    src={getImageUrl(season.poster_path, "poster", "w185")}
                    alt={season.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Film className="h-8 w-8 text-muted-foreground" weight="duotone" />
                  </div>
                )}
              </div>

              {/* Season Info */}
              <div className="flex-1 space-y-5 text-center md:text-left">
                <div>
                  <p className="dossier-label mb-4 justify-center md:justify-start">
                    Season dossier
                  </p>
                  <h1 className="font-serif text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                    {season.name}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-muted-foreground md:justify-start">
                    {season.vote_average > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" weight="fill" />
                        <span>{rating}</span>
                      </div>
                    )}
                    {airDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{airDate}</span>
                      </div>
                    )}
                    {season.episodes && season.episodes.length > 0 && (
                      <span>
                        {season.episodes.length} episode
                        {season.episodes.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {season.overview && (
                  <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                    {season.overview}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Episodes */}
        {season.episodes && season.episodes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Episodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {season.episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="flex flex-col gap-4 rounded-sm border border-border/70 bg-background/30 p-4 transition-colors duration-150 hover:border-primary/55 hover:bg-accent/25 sm:flex-row"
                  >
                    {/* Episode Still */}
                    <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-sm bg-muted sm:w-32">
                      {episode.still_path ? (
                        <Image
                          src={getImageUrl(
                            episode.still_path,
                            "backdrop",
                            "w300",
                          )}
                          alt={episode.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Play className="h-6 w-6 text-muted-foreground" weight="duotone" />
                        </div>
                      )}
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {episode.episode_number}. {episode.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {episode.air_date && formatDate(episode.air_date)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          {episode.vote_average > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" weight="fill" />
                              <span>
                                {formatVoteAverage(episode.vote_average)}
                              </span>
                            </div>
                          )}
                          {episode.runtime > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatRuntime(episode.runtime)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {episode.overview && (
                        <p className="text-sm text-muted-foreground">
                          {episode.overview}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Season Cast */}
        {seasonCast.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Season Cast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {seasonCast.slice(0, 8).map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    role={person.character}
                    mediaType="tv"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Season Crew */}
        {seasonCrew.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Season Crew</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {seasonCrew.slice(0, 8).map((person) => (
                  <PersonCard
                    key={`${person.id}-${person.job}`}
                    person={person}
                    role={person.job}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
