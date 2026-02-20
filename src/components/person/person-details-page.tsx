"use client";

import { useState } from "react";
import Image from "next/image";
import { Icons } from "@/components/ui/icons";
import { usePersonDetails } from "@/lib/hooks/api-hooks";
import { getImageUrl } from "@/lib/api";
import { formatDate, calculateAge } from "@/lib/utils";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Movie, TVShow } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { BackNavigation } from "@/components/ui/back-navigation";
import { PaginatedContent } from "@/components/ui/paginated-content";
import { Badge } from "@/components/ui/badge";
import { PersonCreditsCard } from "./person-credits-card";
import { notFound } from "next/navigation";

interface PersonDetailsPageProps {
  personId: number;
}

function PersonDetailsSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Skeleton */}
          <div className="space-y-6">
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-2xl p-6">
              <div className="space-y-6">
                <Skeleton className="aspect-[2/3] w-full max-w-sm mx-auto rounded-lg" />
                <div className="space-y-4 text-center">
                  <Skeleton className="h-10 w-48 mx-auto" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-2xl p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biography Card */}
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-2xl p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>

            {/* Known For Movies Card */}
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-2xl p-6">
              <div className="space-y-6">
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
              </div>
            </div>

            {/* Known For TV Shows Card */}
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-lg shadow-2xl p-6">
              <div className="space-y-6">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PersonDetailsPage({ personId }: PersonDetailsPageProps) {
  const { person, isLoading, isError } = usePersonDetails(personId);
  const [movieCreditsExpanded, setMovieCreditsExpanded] = useState(false);
  const [tvCreditsExpanded, setTvCreditsExpanded] = useState(false);
  const [movieCreditsPage, setMovieCreditsPage] = useState(1);
  const [tvCreditsPage, setTvCreditsPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  if (isLoading) {
    return <PersonDetailsSkeleton />;
  }

  if (isError || !person) {
    return notFound();
  }

  const profileUrl = getImageUrl(person.profile_path, "profile", "h632");
  const birthDate = formatDate(person.birthday);
  const deathDate = formatDate(person.deathday);
  const age = calculateAge(person.birthday, person.deathday);

  // Sort and organize credits
  const movieCredits =
    person.combined_credits?.cast?.filter(
      (credit) => credit.media_type === "movie",
    ) || [];
  const tvCredits =
    person.combined_credits?.cast?.filter(
      (credit) => credit.media_type === "tv",
    ) || [];

  // Sort by release date (newest to oldest)
  const sortedMovieCredits = [...movieCredits].sort((a, b) => {
    // Sort by release date (descending - newest first)
    const dateA = new Date(a.release_date || "").getTime() || 0;
    const dateB = new Date(b.release_date || "").getTime() || 0;

    // If dates are different, sort by date
    if (dateA !== dateB) return dateB - dateA;

    // If dates are same or both missing, sort by popularity as secondary
    return (b.popularity || 0) - (a.popularity || 0);
  });

  const sortedTVCredits = [...tvCredits].sort((a, b) => {
    // Sort by first air date (descending - newest first)
    const dateA = new Date(a.first_air_date || "").getTime() || 0;
    const dateB = new Date(b.first_air_date || "").getTime() || 0;

    // If dates are different, sort by date
    if (dateA !== dateB) return dateB - dateA;

    // If dates are same or both missing, sort by popularity as secondary
    return (b.popularity || 0) - (a.popularity || 0);
  });

  // Get credits for display based on expansion state and pagination
  const getDisplayedCredits = <T,>(
    credits: T[],
    expanded: boolean,
    page: number,
  ): T[] => {
    if (!expanded) {
      return credits.slice(0, 6);
    }
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return credits.slice(startIndex, endIndex);
  };

  const displayedMovies = getDisplayedCredits(
    sortedMovieCredits,
    movieCreditsExpanded,
    movieCreditsPage,
  );
  const displayedTV = getDisplayedCredits(
    sortedTVCredits,
    tvCreditsExpanded,
    tvCreditsPage,
  );

  const movieTotalPages = Math.ceil(sortedMovieCredits.length / ITEMS_PER_PAGE);
  const tvTotalPages = Math.ceil(sortedTVCredits.length / ITEMS_PER_PAGE);

  // Get all departments the person has worked in
  const getAllDepartments = () => {
    const departments = new Set<string>();

    // Add primary known_for_department
    if (person.known_for_department) {
      departments.add(person.known_for_department);
    }

    // Add departments from crew credits
    if (person.combined_credits?.crew) {
      person.combined_credits.crew.forEach((credit) => {
        if (credit.department) {
          departments.add(credit.department);
        }
      });
    }

    return Array.from(departments).sort();
  };

  const allDepartments = getAllDepartments();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4">
          <BreadcrumbNavigation
            items={[
              { label: "People", href: "/search?tab=people" },
              { label: person.name, current: true },
            ]}
          />
          <BackNavigation fallbackHref="/search?tab=people" />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Image */}
            <div className="relative aspect-[2/3] w-full max-w-sm mx-auto lg:max-w-full">
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt={person.name}
                  fill
                  className="object-cover rounded-lg shadow-lg"
                  sizes="(max-width: 1024px) 100vw, 300px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted rounded-lg">
                  <Icons.User className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-serif font-bold text-foreground">
                  <Icons.Info className="h-5 w-5 text-primary" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {allDepartments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground tracking-wide">
                      Known For
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {allDepartments.map((department, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {department}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {person.birthday && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground tracking-wide">
                      Born
                    </h4>
                    <div className="text-base font-medium space-y-1">
                      <div className="flex items-center space-x-1">
                        <Icons.Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{birthDate}</span>
                        {age !== null && !person.deathday && (
                          <span className="text-muted-foreground">
                            ({age} years old)
                          </span>
                        )}
                      </div>
                      {person.place_of_birth && (
                        <div className="flex items-center space-x-1">
                          <Icons.Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{person.place_of_birth}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {person.deathday && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground tracking-wide">
                      Died
                    </h4>
                    <div className="text-base font-medium">
                      <div className="flex items-center space-x-1">
                        <Icons.Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{deathDate}</span>
                        {age !== null && (
                          <span className="text-muted-foreground">
                            (aged {age})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {person.also_known_as && person.also_known_as.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-serif font-semibold text-muted-foreground tracking-wide">
                      Also Known As
                    </h4>
                    <div className="text-base font-medium space-y-1">
                      {person.also_known_as.slice(0, 3).map((name, index) => (
                        <p key={index}>{name}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* External Links */}
            {person.external_ids && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-serif font-bold text-foreground">
                    <Icons.LinkIcon className="h-5 w-5 text-primary" />
                    External Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {person.external_ids.imdb_id && (
                    <a
                      href={`https://www.imdb.com/name/${person.external_ids.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Icons.ExternalLink className="h-4 w-4" />
                      <span>IMDB</span>
                    </a>
                  )}
                  {person.external_ids.instagram_id && (
                    <a
                      href={`https://www.instagram.com/${person.external_ids.instagram_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Icons.ExternalLink className="h-4 w-4" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {person.external_ids.twitter_id && (
                    <a
                      href={`https://www.twitter.com/${person.external_ids.twitter_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Icons.ExternalLink className="h-4 w-4" />
                      <span>Twitter</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Name and Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                  {person.name}
                </h1>
              </div>

              {/* Quick stats for mobile */}
              <div className="lg:hidden flex flex-wrap gap-4 text-sm">
                {person.birthday && (
                  <div className="flex items-center gap-1">
                    <Icons.Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(person.birthday)}</span>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex items-center gap-1">
                    <Icons.Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{person.place_of_birth}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Biography */}
            {person.biography && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-serif font-bold text-foreground">
                    <Icons.FileText className="h-6 w-6 text-primary" />
                    Biography
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-foreground/90">
                    {person.biography.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Movie Credits */}
            {displayedMovies.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-2xl font-serif font-bold text-foreground">
                      <Icons.Film className="h-6 w-6 text-primary" />
                      <span>Movie Credits</span>
                      <span className="text-base font-medium text-muted-foreground ml-2 font-sans">
                        ({movieCredits.length} total)
                      </span>
                    </CardTitle>
                    {movieCredits.length > 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMovieCreditsExpanded(!movieCreditsExpanded);
                          if (movieCreditsExpanded) {
                            setMovieCreditsPage(1);
                          }
                        }}
                        className="flex items-center gap-1"
                      >
                        {movieCreditsExpanded ? (
                          <>
                            Show Less
                            <Icons.ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show All
                            <Icons.ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayedMovies.map((movie) => (
                      <PersonCreditsCard
                        key={`${movie.id}-${movie.credit_id}`}
                        credit={{ ...movie, media_type: "movie" }}
                      />
                    ))}
                  </div>

                  {/* Pagination for expanded view */}
                  {movieCreditsExpanded && movieTotalPages > 1 && (
                    <div className="mt-6">
                      <PaginatedContent
                        currentPage={movieCreditsPage}
                        totalPages={movieTotalPages}
                        totalResults={movieCredits.length}
                        onPageChange={setMovieCreditsPage}
                      />
                    </div>
                  )}

                  {/* Show count for collapsed view */}
                  {!movieCreditsExpanded && movieCredits.length > 6 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Showing {displayedMovies.length} of{" "}
                        {movieCredits.length} movie credits
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* TV Credits */}
            {displayedTV.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-2xl font-serif font-bold text-foreground">
                      <Icons.Tv className="h-6 w-6 text-primary" />
                      <span>TV Credits</span>
                      <span className="text-base font-medium text-muted-foreground ml-2 font-sans">
                        ({tvCredits.length} total)
                      </span>
                    </CardTitle>
                    {tvCredits.length > 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTvCreditsExpanded(!tvCreditsExpanded);
                          if (tvCreditsExpanded) {
                            setTvCreditsPage(1);
                          }
                        }}
                        className="flex items-center gap-1"
                      >
                        {tvCreditsExpanded ? (
                          <>
                            Show Less
                            <Icons.ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show All
                            <Icons.ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayedTV.map((show) => (
                      <PersonCreditsCard
                        key={`${show.id}-${show.credit_id}`}
                        credit={{ ...show, media_type: "tv" }}
                      />
                    ))}
                  </div>

                  {/* Pagination for expanded view */}
                  {tvCreditsExpanded && tvTotalPages > 1 && (
                    <div className="mt-6">
                      <PaginatedContent
                        currentPage={tvCreditsPage}
                        totalPages={tvTotalPages}
                        totalResults={tvCredits.length}
                        onPageChange={setTvCreditsPage}
                      />
                    </div>
                  )}

                  {/* Show count for collapsed view */}
                  {!tvCreditsExpanded && tvCredits.length > 6 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Showing {displayedTV.length} of {tvCredits.length} TV
                        credits
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
