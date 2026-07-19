import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { RatingBadge } from "@/components/ui/rating-badge";
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
  const imageSize = size === "lg" ? "w342" : "w185";
  const imageUrl = getImageUrl(item.poster_path || null, "poster", imageSize);
  const title = item.title || item.name || "Untitled";
  const releaseDate = item.release_date || item.first_air_date;

  return (
    <article className={cn("group min-w-0", className)}>
      <Link
        href={`/${mediaType}/${item.id}`}
        className="block rounded-md focus-visible:outline-none"
        aria-label={`${title}${releaseDate ? `, ${new Date(releaseDate).getFullYear()}` : ""}`}
      >
        <div className="poster-frame relative aspect-[2/3] overflow-hidden transition-colors duration-100 group-hover:border-primary/65 group-focus-within:border-ring">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              sizes="(max-width: 479px) 45vw, (max-width: 767px) 30vw, (max-width: 1279px) 22vw, 180px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted">
              <Icons.Film
                className="size-8 text-muted-foreground/50"
                aria-hidden="true"
              />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-100 group-hover:opacity-100" />
          {showRating && item.vote_average > 0 && (
            <div className="absolute right-2 top-2">
              <RatingBadge
                rating={formatVoteAverage(item.vote_average)}
                variant="overlay"
                size="sm"
              />
            </div>
          )}
        </div>

        <div className="pt-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors duration-100 group-hover:text-primary">
            {title}
          </h3>
          {showYear && releaseDate && (
            <p className="mt-1 text-xs font-medium tabular-nums text-muted-foreground">
              {new Date(releaseDate).getFullYear()}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
