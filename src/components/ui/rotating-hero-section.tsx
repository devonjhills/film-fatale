"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Star, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
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
      className={cn(
        "relative h-[400px] md:h-[600px] lg:h-[700px] overflow-hidden layout-stable shadow-2xl",
        className,
      )}
    >
      {featuredItems.map((item, index) => {
        const backdropUrl = item.backdrop_path
          ? getImageUrl(item.backdrop_path, "backdrop", "w1280")
          : null;

        const itemTitle =
          "title" in item ? item.title : "name" in item ? item.name : "";

        return backdropUrl ? (
          <div
            key={item.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentIndex ? "opacity-100" : "opacity-0",
            )}
          >
            <OptimizedImage
              key={`hero-backdrop-${item.id}`}
              src={backdropUrl}
              alt={itemTitle}
              fill
              className="object-cover"
              priority={index === 0}
              quality={90}
              sizes="100vw"
            />
          </div>
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
      {/* Multiple overlays for better text legibility */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

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

      <div className="absolute inset-0 flex items-end p-6 md:p-12 z-10">
        <div className="container mx-auto">
          <div className="max-w-4xl">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-tight text-white drop-shadow-2xl text-shadow-strong">
                {"title" in currentItem ? currentItem.title : currentItem.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                {currentItem.vote_average > 0 && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-black/60 text-white border-white/20"
                  >
                    <Star className="h-4 w-4 fill-current" />
                    {rating}
                  </Badge>
                )}
                {releaseDate && (
                  <Badge
                    variant="secondary"
                    className="bg-black/60 text-white border-none"
                  >
                    {new Date(releaseDate).getFullYear()}
                  </Badge>
                )}
              </div>

              {currentItem.overview && (
                <p className="text-base md:text-lg leading-relaxed line-clamp-2 max-w-2xl text-white/90 drop-shadow-lg">
                  {currentItem.overview}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-black hover:bg-white/90"
                >
                  <Link href={`/${mediaType}/${currentItem.id}`}>
                    <Info className="h-4 w-4 mr-2" />
                    More Info
                  </Link>
                </Button>
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
