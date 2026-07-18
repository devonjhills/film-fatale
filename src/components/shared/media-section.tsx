import Link from "next/link";
import { MediaGrid } from "./media-grid";
import { Icons } from "@/components/ui/icons";
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
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          {(badge || showTrending) && (
            <p className="eyebrow mb-3">
              {showTrending ? "Trending now" : badge}
            </p>
          )}
          <h2 className="section-title">{title}</h2>
        </div>

        {href && showViewAll && (
          <Link
            href={href}
            className="group flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <Icons.ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
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
