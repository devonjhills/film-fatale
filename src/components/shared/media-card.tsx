import Image from "next/image";
import Link from "next/link";
import { Film } from "@/components/ui/icons";
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
        className="block rounded-sm"
        aria-label={`${title}${releaseDate ? `, ${new Date(releaseDate).getFullYear()}` : ""}`}
      >
        <div className="poster-frame relative aspect-[2/3] overflow-hidden transition-[border-color,box-shadow,transform] duration-300 ease-out group-hover:-translate-y-1 group-hover:border-primary/70 group-hover:shadow-[0_0_0_4px_oklch(0.07_0.006_70),0_24px_55px_oklch(0_0_0/0.62)] group-focus-within:border-ring">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              sizes="(max-width: 479px) 45vw, (max-width: 767px) 30vw, (max-width: 1279px) 22vw, 180px"
              className="object-cover saturate-[0.82] transition-[filter,transform] duration-500 ease-out group-hover:scale-[1.035] group-hover:saturate-100"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted">
              <Film
                weight="duotone"
                className="size-8 text-muted-foreground/50"
                aria-hidden="true"
              />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent opacity-30 transition-opacity duration-300 group-hover:opacity-80" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
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

        <div className="pt-4">
          <h3 className="line-clamp-2 font-serif text-[1.05rem] font-semibold leading-[1.15] tracking-[-0.018em] text-foreground transition-colors duration-150 group-hover:text-primary">
            {title}
          </h3>
          {showYear && releaseDate && (
            <p className="mt-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] tabular-nums text-muted-foreground">
              {new Date(releaseDate).getFullYear()}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
