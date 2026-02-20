"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { RatingBadge } from "@/components/ui/rating-badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn, formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import { motion } from "framer-motion";

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average: number;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
}

interface MediaCardProps {
  item: MediaItem;
  mediaType: "movie" | "tv";
  className?: string;
  size?: "sm" | "md" | "lg";
  showYear?: boolean;
  showRating?: boolean;
  priority?: boolean;
  index?: number;
}

export function MediaCard({
  item,
  mediaType,
  className,
  size = "md",
  showYear = true,
  showRating = true,
  priority = false,
  index = 0,
}: MediaCardProps) {
  const getOptimalImageSize = () => {
    switch (size) {
      case "sm": return "w185";
      case "lg": return "w342";
      default: return "w185";
    }
  };

  const imageUrl = getImageUrl(
    item.poster_path || null,
    "poster",
    getOptimalImageSize(),
  );
  const rating = formatVoteAverage(item.vote_average);
  const title = item.title || item.name || "";
  const releaseDate = item.release_date || item.first_air_date;

  const sizeClasses = {
    sm: "w-full max-w-[160px] mx-auto",
    md: "w-full max-w-[170px] mx-auto",
    lg: "w-full max-w-[180px] mx-auto",
  };

  return (
    <motion.div
      className={cn(sizeClasses[size], "group h-full")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.04, 0.5),
        ease: "easeOut",
      }}
    >
      <Link href={`/${mediaType}/${item.id}`} className="block h-full">
        <div
          className={cn(
            "space-y-3 h-full flex flex-col transition-all duration-300",
            className,
          )}
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-md elevation-1 transition-all duration-300 flex-shrink-0 group-hover:elevation-3">
            {/* Poster image */}
            {imageUrl ? (
              <OptimizedImage
                src={imageUrl}
                alt={title}
                fill
                aspectRatio="poster"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                priority={priority}
                quality={85}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted rounded-md transition-colors group-hover:bg-muted/80">
                <Icons.Film className="h-8 w-8 text-muted-foreground/50 transition-colors group-hover:text-primary/30" />
              </div>
            )}

            {/* Hover overlay — subtle red tint */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 transition-colors duration-300 rounded-md" />

            {showRating && item.vote_average > 0 && (
              <div className="absolute top-2 right-2">
                <RatingBadge rating={rating} variant="overlay" size="sm" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 flex-grow flex flex-col justify-start min-h-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 tracking-tight group-hover:text-primary transition-colors duration-200">
              {title}
            </h3>
            {showYear && releaseDate && (
              <p className="text-xs text-muted-foreground font-medium">
                {new Date(releaseDate).getFullYear()}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
