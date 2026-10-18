import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "@/components/ui/icons";
import { cn, formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import type { Movie, FormattedMovie, TVShow } from "@/lib/types";

interface FeaturedHeroProps {
  items: (Movie | FormattedMovie | TVShow)[];
  className?: string;
  mediaType?: "movie" | "tv";
}

export function RotatingHeroSection({
  items,
  className,
  mediaType = "movie",
}: FeaturedHeroProps) {
  const item = items.find((candidate) => candidate.backdrop_path) ?? items[0];
  if (!item) return null;

  const title = "title" in item ? item.title : item.name;
  const releaseDate =
    "release_date" in item ? item.release_date : item.first_air_date;
  const backdrop = item.backdrop_path
    ? getImageUrl(item.backdrop_path, "backdrop", "w1280")
    : null;

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b border-border",
        className,
      )}
      aria-labelledby="featured-title"
    >
      {backdrop ? (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-muted" />
      )}
      <div className="art-scrim absolute inset-0 -z-10" aria-hidden="true" />

      <div className="site-container flex min-h-[34rem] items-end pb-14 pt-24 md:min-h-[42rem] md:pb-20">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm text-white/70">
            {mediaType === "movie" ? "Now in theaters" : "On the air"}
          </p>
          <h1
            id="featured-title"
            className="display-title text-shadow-cinematic max-w-[14ch] text-white"
          >
            {title}
          </h1>

          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums text-white/80">
            {item.vote_average > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-3.5" weight="fill" aria-hidden="true" />
                <span className="sr-only">Rated </span>
                {formatVoteAverage(item.vote_average)}
              </span>
            )}
            {releaseDate && <span>{new Date(releaseDate).getUTCFullYear()}</span>}
          </p>

          {item.overview && (
            <p className="text-shadow-cinematic mt-4 line-clamp-3 max-w-xl font-serif text-lg leading-[1.65] text-white/90 md:text-xl">
              {item.overview}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/${mediaType}/${item.id}`}>View details</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-black/40 text-white hover:border-white hover:bg-black/60"
            >
              <Link href={mediaType === "movie" ? "/movies/popular" : "/tv/popular"}>
                Browse {mediaType === "movie" ? "films" : "shows"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
