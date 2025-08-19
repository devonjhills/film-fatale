"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Info, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Movie, FormattedMovie, TVShow } from "@/lib/types";

interface RotatingHeroSectionProps {
  items: (Movie | FormattedMovie | TVShow)[];
  className?: string;
  mediaType?: "movie" | "tv";
  autoRotate?: boolean;
  rotateInterval?: number;
}

export function RotatingHeroSection({
  items,
  className,
  mediaType = "movie",
  autoRotate = true,
  rotateInterval = 8000,
}: RotatingHeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredItems = items
    .filter(
      (item, index, arr) => arr.findIndex((i) => i.id === item.id) === index,
    )
    .slice(0, 5);
  const currentItem = featuredItems[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  }, [featuredItems.length]);

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + featuredItems.length) % featuredItems.length,
    );
  };

  useEffect(() => {
    if (!autoRotate || featuredItems.length <= 1) return;

    const interval = setInterval(handleNext, rotateInterval);
    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, featuredItems.length, handleNext]);

  if (!currentItem) return null;

  const rating = formatVoteAverage(currentItem.vote_average);

  // Handle both movie and TV show release dates
  const releaseDate =
    "release_date" in currentItem
      ? currentItem.release_date
      : "first_air_date" in currentItem
        ? currentItem.first_air_date
        : null;

  return (
    <div
      className={cn("relative h-96 md:h-[500px] overflow-hidden", className)}
    >
      {featuredItems.map((item, index) => {
        const backdropUrl = item.backdrop_path
          ? getImageUrl(item.backdrop_path, "backdrop", "w1280")
          : null;

        const itemTitle =
          "title" in item ? item.title : "name" in item ? item.name : "";

        return backdropUrl ? (
          <Image
            key={item.id}
            src={backdropUrl}
            alt={itemTitle}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              index === currentIndex ? "opacity-100" : "opacity-0",
            )}
            priority={index === 0}
          />
        ) : (
          <div
            key={item.id}
            className={cn(
              "absolute inset-0 bg-muted transition-opacity duration-500",
              index === currentIndex ? "opacity-100" : "opacity-0",
            )}
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

      {featuredItems.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 glass"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 glass"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
        <div className="container mx-auto">
          <div className="glass-strong rounded-lg p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-8">
              {currentItem.poster_path ? (
                <div className="w-36 md:w-48 aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                  <Image
                    src={getImageUrl(currentItem.poster_path, "poster", "w342")}
                    alt={
                      "title" in currentItem
                        ? currentItem.title
                        : currentItem.name
                    }
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-36 md:w-48 aspect-[2/3] bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {mediaType === "movie" ? (
                    <Info className="h-16 w-16 text-muted-foreground" />
                  ) : (
                    <Play className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
              )}

              <div className="flex-1 space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl text-noir-heading leading-tight">
                  {"title" in currentItem
                    ? currentItem.title
                    : currentItem.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                  {currentItem.vote_average > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-4 w-4 fill-current" />
                      {rating}
                    </Badge>
                  )}
                  {releaseDate && (
                    <Badge variant="outline">
                      {new Date(releaseDate).getFullYear()}
                    </Badge>
                  )}
                </div>

                {currentItem.overview && (
                  <p className="text-base md:text-lg leading-relaxed line-clamp-3 max-w-3xl text-body">
                    {currentItem.overview}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/${mediaType}/${currentItem.id}`}>
                      <Info className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Trailer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {featuredItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {featuredItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-foreground/40 hover:bg-foreground/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
