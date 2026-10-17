import Image from "next/image";
import Link from "next/link";
import { Film, Star } from "@/components/ui/icons";
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
  /** Kept for API compatibility; cards size themselves from the grid. */
  size?: "sm" | "md" | "lg";
  showYear?: boolean;
  showRating?: boolean;
  priority?: boolean;
}

export function MediaCard({
  item,
  mediaType,
  className,
  showYear = true,
  showRating = true,
  priority = false,
}: MediaCardProps) {
  // w342 keeps posters sharp on 2x screens at the grid's ~150–180px width.
  const imageUrl = getImageUrl(item.poster_path || null, "poster", "w342");
  const title = item.title || item.name || "Untitled";
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getUTCFullYear() : null;
  const rating =
    showRating && item.vote_average > 0
      ? formatVoteAverage(item.vote_average)
      : null;

  return (
    <article className={cn("group min-w-0", className)}>
      <Link href={`/${mediaType}/${item.id}`} className="poster-card">
        <div className="poster-card-art">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              sizes="(max-width: 639px) 33vw, 180px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Film
                className="size-7 text-muted-foreground/50"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        <div className="poster-card-body">
          <h3 className="line-clamp-2 min-h-[2.75em] text-[0.8125rem] font-medium leading-snug text-foreground group-hover:underline group-hover:underline-offset-4">
            {title}
          </h3>
          {((showYear && year) || rating) && (
            <p className="mt-auto flex items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
              <span>{showYear && year}</span>
              {rating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3" weight="fill" aria-hidden="true" />
                  <span className="sr-only">Rated </span>
                  {rating}
                </span>
              )}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
