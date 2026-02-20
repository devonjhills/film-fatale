"use client";

import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { useTVSeasonDetails, useTVDetails } from "@/lib/hooks/api-hooks";
import { getImageUrl } from "@/lib/api";
import { PersonCard } from "@/components/person/person-card";
import { formatDate, formatVoteAverage, formatRuntime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { BackNavigation } from "@/components/ui/back-navigation";

interface TVSeasonDetailsPageProps {
  tvId: number;
  seasonNumber: number;
}

function SeasonDetailsSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="relative bg-muted p-8">
        <div className="container mx-auto space-y-4">
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
      <div className="container mx-auto px-4 py-8 space-y-8">
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
}: TVSeasonDetailsPageProps) {
  const { season, isLoading, isError } = useTVSeasonDetails(tvId, seasonNumber);
  const { tvShow } = useTVDetails(tvId);

  if (isLoading) {
    return <SeasonDetailsSkeleton />;
  }

  if (isError || !season) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icons.Film className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Season Not Found</h1>
          <p className="text-muted-foreground">
            The season you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href={`/tv/${tvId}`}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Icons.ArrowLeft className="h-4 w-4 mr-2" />
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
      <div className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4">
          <BreadcrumbNavigation items={breadcrumbItems} />
          <BackNavigation fallbackHref={`/tv/${tvId}`} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8 space-y-8">
        {/* Season Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Season Poster */}
              <div className="relative aspect-[2/3] w-32 md:w-40 mx-auto md:mx-0 flex-shrink-0">
                {season.poster_path ? (
                  <Image
                    src={getImageUrl(season.poster_path, "poster", "w185")}
                    alt={season.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted rounded-lg">
                    <Icons.Film className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Season Info */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    {season.name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground">
                    {season.vote_average > 0 && (
                      <div className="flex items-center gap-1">
                        <Icons.Star className="h-4 w-4 fill-current" />
                        <span>{rating}</span>
                      </div>
                    )}
                    {airDate && (
                      <div className="flex items-center gap-1">
                        <Icons.Calendar className="h-4 w-4" />
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
                  <p className="text-base text-muted-foreground">
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
                    className="flex gap-4 p-4 border rounded-lg hover:shadow-lg transition-shadow"
                  >
                    {/* Episode Still */}
                    <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
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
                          <Icons.Play className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">
                            {episode.episode_number}. {episode.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {episode.air_date && formatDate(episode.air_date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {episode.vote_average > 0 && (
                            <div className="flex items-center gap-1">
                              <Icons.Star className="h-3 w-3 fill-current" />
                              <span>
                                {formatVoteAverage(episode.vote_average)}
                              </span>
                            </div>
                          )}
                          {episode.runtime > 0 && (
                            <div className="flex items-center gap-1">
                              <Icons.Clock className="h-3 w-3" />
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
