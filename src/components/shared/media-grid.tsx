import { MediaCard, type MediaItem } from "./media-card";
import { cn } from "@/lib/utils";

interface MediaGridProps {
  items: MediaItem[];
  /** Fallback for items that don't carry their own media_type. */
  mediaType: "movie" | "tv";
  className?: string;
  priorityCount?: number;
  /** Owner's watched titles ("movie-123"), marked on their posters. */
  watched?: Set<string>;
}

export function MediaGrid({ items, mediaType, className, priorityCount = 0, watched }: MediaGridProps) {
  return (
    <div className={cn("poster-grid", className)}>
      {items.map((item, index) => {
        const key = `${item.media_type ?? mediaType}-${item.id}`;
        return (
          <MediaCard
            key={key}
            item={item}
            mediaType={item.media_type ?? mediaType}
            priority={index < priorityCount}
            watched={watched?.has(key)}
          />
        );
      })}
    </div>
  );
}
