"use client";

import { MediaCard, type MediaItem } from "./media-card";
import { MediaCardSkeleton } from "@/components/ui/optimized-skeleton";
import { cn } from "@/lib/utils";

interface MediaGridProps {
  items: MediaItem[];
  mediaType: "movie" | "tv";
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  cardSize?: "sm" | "md" | "lg";
  showYear?: boolean;
  showRating?: boolean;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function MediaGrid({
  items,
  mediaType,
  isLoading = false,
  error,
  className,
  cardSize = "md",
  showYear = true,
  showRating = true,
  columns = { sm: 2, md: 4, lg: 5, xl: 6 },
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-4 sm:gap-5 md:gap-6 lg:gap-8 justify-items-center layout-stable",
          getGridClasses(columns),
          className,
        )}
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <MediaCardSkeleton key={i} size={cardSize} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3 glass rounded-xl p-8">
          <p className="text-destructive font-semibold text-lg">Failed to load content</p>
          <p className="text-sm text-muted-foreground">
            {error.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3 glass rounded-xl p-8">
          <p className="text-muted-foreground">
            No {mediaType === "movie" ? "movies" : "TV shows"} found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 md:gap-6 lg:gap-8 justify-items-center",
        getGridClasses(columns),
        className,
      )}
    >
      {items.slice(0, 20).map((item, index) => (
        <MediaCard
          key={item.id}
          item={item}
          mediaType={mediaType}
          size={cardSize}
          showYear={showYear}
          showRating={showRating}
          priority={index < 8}
          index={index}
        />
      ))}
    </div>
  );
}

function getGridClasses(columns: MediaGridProps["columns"]) {
  const smCols = columns?.sm || 3;
  const mdCols = columns?.md || 4;
  const lgCols = columns?.lg || 5;
  const xlCols = columns?.xl || 6;

  return cn([
    smCols === 2 ? "grid-cols-2" : smCols === 4 ? "grid-cols-4" : "grid-cols-3",
    mdCols === 3
      ? "sm:grid-cols-3"
      : mdCols === 5
        ? "sm:grid-cols-5"
        : mdCols === 6
          ? "sm:grid-cols-6"
          : "sm:grid-cols-4",
    lgCols === 4
      ? "md:grid-cols-4"
      : lgCols === 6
        ? "md:grid-cols-6"
        : lgCols === 7
          ? "md:grid-cols-7"
          : "md:grid-cols-5",
    xlCols === 5
      ? "lg:grid-cols-5"
      : xlCols === 7
        ? "lg:grid-cols-7"
        : xlCols === 8
          ? "lg:grid-cols-8"
          : "lg:grid-cols-6",
  ]);
}
