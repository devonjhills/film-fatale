import { MediaCard, type MediaItem } from "./media-card";
import { cn } from "@/lib/utils";

interface MediaGridProps {
  items: MediaItem[];
  /** Fallback for items that don't carry their own media_type. */
  mediaType: "movie" | "tv";
  className?: string;
  priorityCount?: number;
}

export function MediaGrid({ items, mediaType, className, priorityCount = 0 }: MediaGridProps) {
  return (
    <div className={cn("poster-grid", className)}>
      {items.map((item, index) => (
        <MediaCard
          key={`${item.media_type ?? mediaType}-${item.id}`}
          item={item}
          mediaType={item.media_type ?? mediaType}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
