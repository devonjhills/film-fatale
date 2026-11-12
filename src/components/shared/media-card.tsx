import Image from "next/image";
import Link from "@/components/ui/app-link";
import { Check, Film, Star } from "@/components/ui/icons";
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
  /** Present on mixed lists such as trending and search results. */
  media_type?: "movie" | "tv";
}

interface MediaCardProps {
  item: MediaItem;
  mediaType: "movie" | "tv";
  className?: string;
  priority?: boolean;
  /** A short line under the title, e.g. the character someone played. */
  note?: string;
  /** Marks a title the owner has watched (from their library). */
  watched?: boolean;
}

export function MediaCard({
  item,
  mediaType,
  className,
  priority = false,
  note,
  watched = false,
}: MediaCardProps) {
  // w342 keeps posters sharp on 2x screens at the grid's ~150–180px width.
  const imageUrl = getImageUrl(item.poster_path || null, "poster", "w342");
  const title = item.title || item.name || "Untitled";
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getUTCFullYear() : null;
  const rating = item.vote_average > 0 ? formatVoteAverage(item.vote_average) : null;

  return (
    <article className={cn("min-w-0", className)}>
      <Link href={`/${mediaType}/${item.id}`} className="tile">
        <div className="tile-art">
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
          {watched && (
            <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-page/85 px-2 py-0.5 text-2xs font-medium text-mint">
              <Check className="size-3" weight="bold" aria-hidden="true" />
              Watched
            </span>
          )}
        </div>

        <div className="tile-body">
          <h3 className="line-clamp-2 min-h-[2.75em] text-ui font-medium leading-snug text-foreground">
            {title}
          </h3>
          {(note || year || rating) && (
            <div className="mt-auto space-y-0.5">
              {note && (
                <p className="line-clamp-1 text-xs text-muted-foreground" title={note}>
                  {note}
                </p>
              )}
              {(year || rating) && (
                <p className="flex items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
                  <span>{year}</span>
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
          )}
        </div>
      </Link>
    </article>
  );
}
