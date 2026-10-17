import Link from "next/link";
import { MediaGrid } from "./media-grid";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average: number;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
}

interface MediaSectionProps {
  title: string;
  items: MediaItem[];
  mediaType: "movie" | "tv";
  isLoading?: boolean;
  error?: Error | null;
  href?: string;
  className?: string;
  showViewAll?: boolean;
  limit?: number;
  showTrending?: boolean;
  badge?: string;
  cardSize?: "sm" | "md" | "lg";
  showYear?: boolean;
  showRating?: boolean;
}

export function MediaSection({
  title,
  items,
  mediaType,
  isLoading = false,
  error,
  href,
  className,
  showViewAll = true,
  limit = 16,
  cardSize = "md",
  showYear = true,
  showRating = true,
}: MediaSectionProps) {
  return (
    <section className={cn("layout-stable", className)}>
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 className="section-title min-w-0">{title}</h2>

        {href && showViewAll && (
          <Link
            href={href}
            className="flex min-h-11 shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            View all
            <span className="sr-only"> {title}</span>
          </Link>
        )}
      </div>

      <MediaGrid
        items={items.slice(0, limit)}
        mediaType={mediaType}
        isLoading={isLoading}
        error={error}
        cardSize={cardSize}
        showYear={showYear}
        showRating={showRating}
        className="poster-grid-two-rows"
      />
    </section>
  );
}
