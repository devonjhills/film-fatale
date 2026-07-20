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
        "relative isolate min-h-[38rem] overflow-hidden border-b border-border/75 md:min-h-[48rem]",
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
          className="absolute inset-0 -z-20 object-cover object-center saturate-[0.58] contrast-[1.12]"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-muted" />
      )}
      <div className="art-scrim absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,transparent_0%,transparent_68%,oklch(0.06_0.006_70/0.58)_100%)]" />
      <div
        className="absolute inset-x-0 bottom-0 z-10 h-3 border-y border-white/10 bg-[repeating-linear-gradient(90deg,transparent_0_1.25rem,oklch(0_0_0/0.9)_1.25rem_1.6rem)] opacity-70"
        aria-hidden="true"
      />

      <div className="site-container flex min-h-[38rem] items-end pb-16 pt-24 md:min-h-[48rem] md:pb-24">
        <div className="max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <p className="eyebrow">Tonight&apos;s feature</p>
            <span className="h-px w-12 bg-primary/70" aria-hidden="true" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/62">
              Feature presentation
            </span>
          </div>
          <h1
            id="featured-title"
            className="display-title text-shadow-cinematic max-w-[13ch] text-white"
          >
            {title}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
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
            <p className="text-shadow-cinematic mt-6 max-w-2xl text-base leading-7 text-white/85 md:text-lg md:leading-8">
              {item.overview}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/${mediaType}/${item.id}`}>
                View details
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/35 bg-black/48 text-white backdrop-blur-sm hover:border-primary hover:bg-black/72 hover:text-primary">
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
