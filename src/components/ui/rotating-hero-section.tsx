"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { cn, formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { motion, AnimatePresence } from "framer-motion";
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
  const [direction, setDirection] = useState(1);

  const featuredItems = items
    .filter(
      (item, index, arr) => arr.findIndex((i) => i.id === item.id) === index,
    )
    .slice(0, 5);
  const currentItem = featuredItems[currentIndex];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  }, [featuredItems.length]);

  const handlePrevious = () => {
    setDirection(-1);
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
  const releaseDate =
    "release_date" in currentItem
      ? currentItem.release_date
      : "first_air_date" in currentItem
        ? currentItem.first_air_date
        : null;

  const backdropVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] } },
    exit: (dir: number) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] as [number,number,number,number] } }),
  };

  const contentVariants = {
    enter: { opacity: 0, y: 30 },
    center: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div
      className={cn(
        "relative h-[420px] md:h-[620px] lg:h-[720px] overflow-hidden shadow-2xl",
        className,
      )}
    >
      {/* Backdrop images with crossfade */}
      <AnimatePresence custom={direction} initial={false}>
        {featuredItems.map((item, index) => {
          if (index !== currentIndex) return null;
          const bd = item.backdrop_path
            ? getImageUrl(item.backdrop_path, "backdrop", "w1280")
            : null;
          const itemTitle =
            "title" in item ? item.title : "name" in item ? item.name : "";

          return (
            <motion.div
              key={item.id}
              custom={direction}
              variants={backdropVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              {bd ? (
                <OptimizedImage
                  src={bd}
                  alt={itemTitle}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Cinematic overlay layers */}
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20" />

      {/* Prev / Next controls */}
      {featuredItems.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 glass border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-200"
            onClick={handlePrevious}
            aria-label="Previous"
          >
            <Icons.ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 glass border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-200"
            onClick={handleNext}
            aria-label="Next"
          >
            <Icons.ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Content overlay — animated per slide */}
      <div className="absolute inset-0 flex items-end p-6 md:p-12 z-10">
        <div className="container mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentItem.id}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-4xl space-y-5"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-[0.95] text-white text-shadow-strong">
                {"title" in currentItem ? currentItem.title : currentItem.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                {currentItem.vote_average > 0 && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 bg-black/70 text-white border-white/20 backdrop-blur-sm"
                  >
                    <Icons.Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {rating}
                  </Badge>
                )}
                {releaseDate && (
                  <Badge
                    variant="secondary"
                    className="bg-black/70 text-white border-white/20 backdrop-blur-sm"
                  >
                    {new Date(releaseDate).getFullYear()}
                  </Badge>
                )}
              </div>

              {currentItem.overview && (
                <p className="text-base md:text-lg leading-relaxed line-clamp-2 max-w-2xl text-white/85 text-shadow">
                  {currentItem.overview}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-semibold transition-all duration-200 hover:scale-[1.03]"
                >
                  <Link href={`/${mediaType}/${currentItem.id}`}>
                    <Icons.Info className="h-4 w-4 mr-2" />
                    More Info
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="glass border-white/30 text-white hover:bg-white/15 hover:border-white/50 font-semibold transition-all duration-200"
                >
                  <Link href={`/${mediaType}/${currentItem.id}`}>
                    <Icons.Play className="h-4 w-4 mr-2 fill-current" />
                    Trailer
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot indicators */}
      {featuredItems.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 items-center">
          {featuredItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                index === currentIndex
                  ? "bg-white w-7 h-2"
                  : "bg-white/40 hover:bg-white/70 w-2 h-2",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
