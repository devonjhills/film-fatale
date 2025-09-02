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
  showOverview?: boolean;
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
  showOverview = false,
  columns = { sm: 2, md: 4, lg: 5, xl: 6 },
}: MediaGridProps) {
  // Handle loading state
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

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3 border rounded-lg p-6">
          <p className="text-destructive font-semibold">
            Failed to load content
          </p>
          <p className="text-sm text-muted-foreground">
            {error.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3 border rounded-lg p-6">
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
          showOverview={showOverview}
          priority={index < 8} // Prioritize first 8 images for better top row coverage
        />
      ))}
    </div>
  );
}

function getGridClasses(columns: MediaGridProps["columns"]) {
  // Optimized for smaller cards (~160-180px) with more spacing
  // More columns = better spacing between cards
  const smCols = columns?.sm || 3;
  const mdCols = columns?.md || 4;
  const lgCols = columns?.lg || 5;
  const xlCols = columns?.xl || 6;

  return cn([
    // Mobile: 3 columns (smaller cards fit better)
    smCols === 2 ? "grid-cols-2" : smCols === 4 ? "grid-cols-4" : "grid-cols-3",
    // Small tablets: 4 columns
    mdCols === 3
      ? "sm:grid-cols-3"
      : mdCols === 5
        ? "sm:grid-cols-5"
        : mdCols === 6
          ? "sm:grid-cols-6"
          : "sm:grid-cols-4",
    // Medium screens: 5 columns
    lgCols === 4
      ? "md:grid-cols-4"
      : lgCols === 6
        ? "md:grid-cols-6"
        : lgCols === 7
          ? "md:grid-cols-7"
          : "md:grid-cols-5",
    // Large screens: 6 columns
    xlCols === 5
      ? "lg:grid-cols-5"
      : xlCols === 7
        ? "lg:grid-cols-7"
        : xlCols === 8
          ? "lg:grid-cols-8"
          : "lg:grid-cols-6",
  ]);
}
