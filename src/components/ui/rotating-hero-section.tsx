import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "@/components/ui/icons";
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
        "relative isolate min-h-[34rem] overflow-hidden border-b border-border/70 md:min-h-[42rem]",
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
          className="absolute inset-0 -z-20 object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-muted" />
      )}
      <div className="art-scrim absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,transparent_0%,transparent_68%,oklch(0.1_0.01_20/0.46)_100%)]" />

      <div className="site-container flex min-h-[34rem] items-end pb-12 pt-24 md:min-h-[42rem] md:pb-18">
        <div className="max-w-3xl">
          <p className="eyebrow mb-5">Tonight&apos;s feature</p>
          <h1
            id="featured-title"
            className="display-title text-shadow-cinematic text-white"
          >
            {title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {item.vote_average > 0 && (
              <Badge
                variant="overlay"
                className="gap-1.5 border-white/25 bg-black/70"
              >
                <Star
                  className="size-3.5 text-brass"
                  weight="fill"
                  aria-hidden="true"
                />
                {formatVoteAverage(item.vote_average)}
              </Badge>
            )}
            {releaseDate && (
              <Badge variant="overlay" className="border-white/25 bg-black/70">
                {new Date(releaseDate).getFullYear()}
              </Badge>
            )}
          </div>

          {item.overview && (
            <p className="text-shadow-cinematic mt-5 max-w-2xl text-base leading-7 text-white/82 md:text-lg">
              {item.overview}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/${mediaType}/${item.id}`}>
                View details
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/28 bg-black/45 text-white hover:bg-white/12">
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
