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
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-x-3 gap-y-7 min-[480px]:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
          className,
        )}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <MediaCardSkeleton key={i} size={cardSize} />
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
        "grid grid-cols-2 gap-x-3 gap-y-7 min-[480px]:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
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
          priority={false}
          index={index}
        />
      ))}
    </div>
  );
}
