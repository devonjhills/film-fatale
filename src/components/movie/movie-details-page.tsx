"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, Film, Info, Star } from "lucide-react";
import { useMovieDetails, useMovieWatchProviders } from "@/lib/hooks/api-hooks";
import { DetailsHero } from "@/components/ui/details-hero";
import { CastGrid } from "@/components/person/cast-grid";
import { MovieGrid } from "@/components/movie/movie-grid";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatRuntime,
  formatVoteAverage,
  formatCurrency,
  getUSCertification,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BackNavigation } from "@/components/ui/back-navigation";
import { PersonCard } from "../person/person-card";

interface MovieDetailsPageProps {
  movieId: number;
}

function MovieDetailsSkeleton() {
  return (
    <div className="min-h-screen relative">
      {/* Hero Skeleton */}
      <div className="relative h-96 bg-muted">
        <div className="absolute inset-0 container mx-auto px-4 flex items-end pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
            <div className="md:col-span-3">
              <Skeleton className="aspect-[2/3] w-full max-w-xs mx-auto md:mx-0" />
            </div>
            <div className="md:col-span-9 space-y-4">
              <Skeleton className="h-12 w-full max-w-2xl" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-16 w-full max-w-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Movie Details Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cast Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MovieDetailsPage({ movieId }: MovieDetailsPageProps) {
  const { movie, isLoading, isError } = useMovieDetails(movieId);
  const { watchProviders } = useMovieWatchProviders(movieId);

  if (isLoading) {
    return <MovieDetailsSkeleton />;
  }

  if (isError || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Film className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Movie Not Found</h1>
          <p className="text-muted-foreground">
            The movie you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const rating = formatVoteAverage(movie.vote_average);
  const runtime = formatRuntime(movie.runtime);
  const releaseDate = formatDate(movie.release_date);
  const budget = formatCurrency(movie.budget);
  const revenue = formatCurrency(movie.revenue);

  // Get trailer video
  const trailer = movie.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );

  // Get main cast (first 10)
  const mainCast = movie.credits?.cast?.slice(0, 10) || [];

  // Get director
  const director = movie.credits?.crew?.find(
    (person) => person.job === "Director",
  );

  // Get US certification
  const usCertification = getUSCertification(movie.release_dates);

  // Get keywords
  const keywords = movie.keywords?.keywords?.slice(0, 10) || [];

  // Get key crew members with proper ordering
  const keyCrew =
    movie.credits?.crew
      ?.filter((person) =>
        [
          "Director",
          "Producer",
          "Executive Producer",
          "Writer",
          "Screenplay",
          "Story",
          "Cinematography",
          "Music",
          "Original Music Composer",
        ].includes(person.job),
      )
      .sort((a, b) => {
        // Priority order: Director first, then Writer/Screenplay, then others
        const jobPriority: Record<string, number> = {
          Director: 1,
          Writer: 2,
          Screenplay: 2,
          Story: 2,
          Producer: 3,
          "Executive Producer": 4,
          Cinematography: 5,
          Music: 6,
          "Original Music Composer": 6,
        };

        const priorityA = jobPriority[a.job] || 10;
        const priorityB = jobPriority[b.job] || 10;

        return priorityA - priorityB;
      })
      .slice(0, 8) || [];

  // Get recommendations
  const recommendations = movie.recommendations?.results?.slice(0, 10) || [];

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <DetailsHero
        item={movie}
        mediaType="movie"
        trailer={trailer}
        watchProviders={watchProviders?.results?.US}
      />

      {/* Main Content */}
      <div className="relative container mx-auto px-4 pt-4 pb-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Breadcrumb
            items={[
              { label: "Movies", href: "/" },
              { label: movie.title, current: true },
            ]}
          />
          <BackNavigation fallbackHref="/" />
        </div>
        <div className="space-y-8">
          {/* Movie Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Movie Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {director && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Director
                    </h4>
                    <Link
                      href={`/person/${director.id}`}
                      className="text-base font-medium text-primary hover:text-primary/80"
                    >
                      {director.name}
                    </Link>
                  </div>
                )}

                {movie.release_date && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Release Date
                    </h4>
                    <p className="text-base">{releaseDate}</p>
                  </div>
                )}

                {runtime && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Runtime
                    </h4>
                    <p className="text-base">{runtime}</p>
                  </div>
                )}

                {usCertification && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Rating
                    </h4>
                    <Badge variant="outline">{usCertification}</Badge>
                  </div>
                )}

                {movie.vote_average > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Rating
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-primary">
                        {rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / 10
                      </span>
                    </div>
                  </div>
                )}

                {movie.budget > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Budget
                    </h4>
                    <p className="text-base">{budget}</p>
                  </div>
                )}

                {movie.revenue > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Revenue
                    </h4>
                    <p className="text-base text-green-600">{revenue}</p>
                  </div>
                )}

                {movie.production_companies.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Production
                    </h4>
                    <div className="space-y-1">
                      {movie.production_companies.slice(0, 2).map((company) => (
                        <p key={company.id} className="text-sm">
                          {company.name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Keywords */}
              {keywords.length > 0 && (
                <div className="space-y-3 pt-6 border-t mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <Badge key={keyword.id} variant="secondary">
                        {keyword.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cast */}
          {mainCast.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cast</CardTitle>
              </CardHeader>
              <CardContent>
                <CastGrid
                  cast={movie.credits?.cast || []}
                  initialDisplayCount={12}
                  mediaType="movie"
                />
              </CardContent>
            </Card>
          )}

          {/* Key Crew */}
          {keyCrew.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Crew</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {keyCrew.map((person) => (
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

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>You might also like</CardTitle>
              </CardHeader>
              <CardContent>
                <MovieGrid
                  movies={recommendations}
                  cardSize="md"
                  showYear={true}
                  showRating={true}
                  showOverview={false}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
