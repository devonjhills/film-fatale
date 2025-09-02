import Link from "next/link";
import { RatingBadge } from "@/components/ui/rating-badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { InViewAnimation } from "@/components/ui/progressive-loader";
import { cn, formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";

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
  showOverview?: boolean;
  priority?: boolean;
}

export function MediaCard({
  item,
  mediaType,
  className,
  size = "md",
  showYear = true,
  showRating = true,
  priority = false,
}: MediaCardProps) {
  // Optimized image sizes based on card size and device
  const getOptimalImageSize = () => {
    switch (size) {
      case "sm":
        return "w185"; // Small cards use w185 (185px)
      case "lg":
        return "w342"; // Large cards use w342 (342px)
      default:
        return "w185"; // Default to w185 for optimal quality/performance
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
    <InViewAnimation
      animation="fadeUp"
      delay={priority ? 0 : 100}
      className="w-full h-full"
      startVisible={priority}
    >
      <div className={cn(sizeClasses[size], "group h-full")}>
        <Link href={`/${mediaType}/${item.id}`} className="block h-full">
          <div
            className={cn(
              "space-y-2 transition-all duration-300 hover:scale-[1.02] hover:drop-shadow-lg h-full flex flex-col",
              className,
            )}
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-md shadow-md group-hover:shadow-lg transition-shadow duration-300 flex-shrink-0">
              {imageUrl ? (
                <OptimizedImage
                  src={imageUrl}
                  alt={title}
                  fill
                  aspectRatio="poster"
                  className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                  priority={priority}
                  quality={85}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted rounded-lg">
                  <span className="text-xs text-muted-foreground text-center px-2">
                    No Image
                  </span>
                </div>
              )}

              {showRating && item.vote_average > 0 && (
                <div className="absolute top-2 right-2">
                  <RatingBadge rating={rating} variant="overlay" size="sm" />
                </div>
              )}
            </div>

            <div className="space-y-1 flex-grow flex flex-col justify-start min-h-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                {title}
              </h3>
              {showYear && releaseDate && (
                <p className="text-xs text-muted-foreground">
                  {new Date(releaseDate).getFullYear()}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
    </InViewAnimation>
  );
}
