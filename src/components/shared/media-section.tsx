import Link from "next/link";
import { MediaGrid } from "./media-grid";
import { ArrowRight } from "@/components/ui/icons";
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
  limit = 12,
  showTrending = false,
  badge,
  cardSize = "md",
  showYear = true,
  showRating = true,
}: MediaSectionProps) {
  return (
    <section className={cn("layout-stable", className)}>
      <div className="mb-7 flex items-end justify-between gap-4 md:mb-9">
        <div className="min-w-0 flex-1">
          {(badge || showTrending) && (
            <p className="eyebrow mb-3">
              {showTrending ? "Trending now" : badge}
            </p>
          )}
          <h2 className="section-title">{title}</h2>
          <div className="editorial-rule mt-4 max-w-sm" aria-hidden="true" />
        </div>

        {href && showViewAll && (
          <Link
            href={href}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-sm px-2 text-xs font-bold uppercase tracking-[0.09em] text-muted-foreground transition-colors duration-150 hover:text-primary"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
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
      />
    </section>
  );
}
