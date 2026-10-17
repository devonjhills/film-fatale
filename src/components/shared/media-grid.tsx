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
  priorityCount?: number;
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
  priorityCount = 0,
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "poster-grid",
          className,
        )}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="surface-panel max-w-md space-y-3 p-8 text-center">
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
        <div className="surface-panel max-w-md space-y-3 p-8 text-center">
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
        "poster-grid",
        className,
      )}
    >
      {items.map((item, index) => (
        <MediaCard
          key={item.id}
          item={item}
          mediaType={mediaType}
          size={cardSize}
          showYear={showYear}
          showRating={showRating}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
