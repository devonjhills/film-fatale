"use client";

import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { useTVDetails, useTVWatchProviders } from "@/lib/hooks/api-hooks";
import { getImageUrl } from "@/lib/api";
import { DetailsHero } from "@/components/ui/details-hero";
import { CastGrid } from "@/components/person/cast-grid";
import { PersonCard } from "@/components/person/person-card";
import { TVGrid } from "@/components/tv/tv-grid";
import { notFound } from "next/navigation";
import { EpisodeTracker } from "@/components/tv/episode-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatVoteAverage } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { BackNavigation } from "@/components/ui/back-navigation";
import { useAuth } from "@/components/providers/auth-provider";

interface TVDetailsPageProps {
  tvId: number;
}

function TVDetailsSkeleton() {
  return (
    <div className="detail-page">
      {/* Hero Skeleton */}
      <div className="relative h-[75vh] md:h-[85vh] bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 container mx-auto px-4 flex items-end pb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
            <div className="md:col-span-3">
              <Skeleton className="aspect-[2/3] w-full max-w-xs mx-auto md:mx-0" />
            </div>
            <div className="md:col-span-9 space-y-4">
              <Skeleton className="h-14 w-full max-w-2xl" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-20 w-full max-w-3xl" />
              <div className="flex gap-3">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="relative container mx-auto px-4 pt-16 pb-12">
        <div className="space-y-8">
          {/* TV Show Details Card */}
          <Card className="glass">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
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

          {/* Seasons Section */}
          <Card className="glass">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 border border-border/20 rounded-lg"
                  >
                    <Skeleton className="aspect-[2/3] w-20 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cast Section */}
          <Card className="glass">
            <CardContent className="p-6 space-y-6">
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
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Section */}
          <Card className="glass">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden bg-card border border-border/50 rounded-lg h-full flex flex-col transition-all duration-200 w-48"
                  >
                    <div className="p-3 space-y-3 flex-1 flex flex-col">
                      <div className="relative overflow-hidden rounded-lg aspect-[2/3]">
                        <Skeleton className="h-full w-full" />
                        <div className="absolute top-2 right-2">
                          <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-1 flex-1 flex flex-col">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function TVDetailsPage({ tvId }: TVDetailsPageProps) {
  const { tvShow, isLoading, isError } = useTVDetails(tvId);
  const { watchProviders } = useTVWatchProviders(tvId);
  const { user } = useAuth();

  if (isLoading) {
    return <TVDetailsSkeleton />;
  }

  if (isError || !tvShow) {
    return notFound();
  }

  const rating = formatVoteAverage(tvShow.vote_average);
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
        character: actor.roles[0]?.character || "Unknown Role", // Use first role
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

  // Get creators
  const creators = tvShow.created_by || [];

  // Get key crew members with proper ordering - for now, use regular credits since crew structure in aggregate_credits might be complex
  const keyCrew =
    tvShow.credits?.crew
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

  // Get keywords
  const keywords = tvShow.keywords?.results?.slice(0, 10) || [];

  // Get TV recommendations
  const recommendations = tvShow.recommendations?.results?.slice(0, 12) || [];

  return (
    <div className="detail-page">
      {/* Hero Section */}
      <DetailsHero
        item={tvShow}
        mediaType="tv"
        trailer={trailer}
        watchProviders={watchProviders?.results?.US}
      />

      {/* Main Content */}
      <div className="relative container mx-auto px-4 pt-4 pb-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <BreadcrumbNavigation
            items={[
              { label: "TV Shows", href: "/tv" },
              { label: tvShow.name, current: true },
            ]}
          />
          <BackNavigation fallbackHref="/tv" />
        </div>
        <div className="space-y-8">
          {/* TV Show Details - Full Width */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-serif font-bold text-foreground">
                <Icons.Tv className="h-6 w-6 text-primary" />
                TV Show Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {creators.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wide">
                      <Icons.Clapperboard className="h-4 w-4" />
                      Creator{creators.length > 1 ? "s" : ""}
                    </h4>
                    <div className="space-y-1">
                      {creators.slice(0, 2).map((creator) => (
                        <Link
                          key={creator.id}
                          href={`/person/${creator.id}`}
                          className="text-base font-medium text-primary hover:text-primary/80"
                        >
                          {creator.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {tvShow.first_air_date && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wide">
                      <Icons.Calendar className="h-4 w-4" />
                      First Aired
                    </h4>
                    <p className="text-base">{firstAirDate}</p>
                  </div>
                )}

                {tvShow.last_air_date && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wide">
                      <Icons.Calendar className="h-4 w-4" />
                      Last Aired
                    </h4>
                    <p className="text-base">{lastAirDate}</p>
                  </div>
                )}

                {tvShow.vote_average > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wide">
                      <Icons.Star className="h-4 w-4 fill-current" />
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

                <div className="space-y-2">
                  <h4 className="text-sm font-serif font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wide">
                    <Icons.Play className="h-4 w-4" />
                    Status
                  </h4>
                  <p className="text-base">{tvShow.status}</p>
                </div>

                {tvShow.number_of_seasons && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wide">
                      <Icons.Tv className="h-4 w-4" />
                      Seasons
                    </h4>
                    <p className="text-base">{tvShow.number_of_seasons}</p>
                  </div>
                )}

                {tvShow.number_of_episodes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wide">
                      <Icons.Play className="h-4 w-4" />
                      Episodes
                    </h4>
                    <p className="text-base">{tvShow.number_of_episodes}</p>
                  </div>
                )}

                {tvShow.networks && tvShow.networks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wide">
                      <Icons.Wifi className="h-4 w-4" />
                      Network
                    </h4>
                    <div className="space-y-1">
                      {tvShow.networks.slice(0, 2).map((network) => (
                        <p key={network.id} className="text-base">
                          {network.name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Keywords */}
              {keywords.length > 0 && (
                <div className="space-y-3 pt-6 border-t mt-6">
                  <h4 className="text-sm font-serif font-semibold text-muted-foreground flex items-center gap-1.5 tracking-wide">
                    <Icons.Tag className="h-4 w-4" />
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

          {/* Seasons - Full Width */}
          {tvShow.seasons && tvShow.seasons.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-serif font-bold text-foreground">
                  <Icons.Tv className="h-6 w-6 text-primary" />
                  Seasons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tvShow.seasons.map((season) => (
                    <Link
                      key={season.id}
                      href={`/tv/${tvId}/season/${season.season_number}`}
                      className="group flex space-x-4 p-4 rounded-lg border hover:shadow-lg transition-shadow"
                    >
                      <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {season.poster_path ? (
                          <Image
                            src={getImageUrl(
                              season.poster_path,
                              "poster",
                              "w185",
                            )}
                            alt={season.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Icons.Film className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <h4 className="font-serif font-semibold text-lg text-foreground">
                          {season.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {season.episode_count} episode
                          {season.episode_count !== 1 ? "s" : ""}
                          {season.air_date &&
                            ` • ${formatDate(season.air_date)}`}
                        </p>
                        {season.overview && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {season.overview}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Episode Tracker - Only for authenticated users */}
          {tvShow.seasons && tvShow.seasons.length > 0 && (
            <>
              {user ? (
                <EpisodeTracker tmdb_id={tvShow.id} seasons={tvShow.seasons} />
              ) : (
                <Card className="glass">
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Icons.Clock className="h-8 w-8" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-3xl font-serif font-bold text-foreground">
                          Track Your Progress
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Sign in to track which episodes you&apos;ve watched
                          and pick up where you left off.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild size="lg">
                          <Link href="/signin">
                            <Icons.User className="h-4 w-4 mr-2" />
                            Sign In to Track Episodes
                          </Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                          <Link href="/library">
                            <Icons.Bookmark className="h-4 w-4 mr-2" />
                            View My Library
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Cast - Full Width */}
          {mainCast.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-serif font-bold text-foreground">
                  <Icons.Users className="h-6 w-6 text-primary" />
                  Cast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CastGrid
                  cast={mainCast}
                  initialDisplayCount={12}
                  mediaType="tv"
                />
              </CardContent>
            </Card>
          )}
          {/* Key Crew - Full Width */}
          {keyCrew.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-serif font-bold text-foreground">
                  <Icons.Users className="h-6 w-6 text-primary" />
                  Key Crew
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

          {/* Recommendations - Full Width */}
          {recommendations.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-serif font-bold text-foreground">
                  <Icons.Tv className="h-6 w-6 text-primary" />
                  You might also like
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TVGrid
                  tvShows={recommendations}
                  cardSize="md"
                  showYear={true}
                  showRating={true}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
