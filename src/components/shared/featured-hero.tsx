import Image from "next/image";
import Link from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Star } from "@/components/ui/icons";
import { formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import type { Movie, TVShow } from "@/lib/types";

interface FeaturedHeroProps {
  /** The first item with a backdrop is featured. */
  items: (Movie | TVShow)[];
  mediaType: "movie" | "tv";
}

/** The landing pages' backdrop banner for one current title, under the blinds. */
export function FeaturedHero({ items, mediaType }: FeaturedHeroProps) {
  const item = items.find((candidate) => candidate.backdrop_path) ?? items[0];
  if (!item) return null;

  const title = "title" in item ? item.title : item.name;
  const releaseDate = "release_date" in item ? item.release_date : item.first_air_date;
  const backdrop = item.backdrop_path
    ? getImageUrl(item.backdrop_path, "backdrop", "w1280")
    : null;

  return (
    <section
      className="blinds relative isolate overflow-hidden border-b border-border"
      aria-labelledby="featured-title"
    >
      {backdrop ? (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[center_25%]"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-muted" />
      )}
      <div className="art-scrim absolute inset-0 -z-10" aria-hidden="true" />

      <div className="site-container flex min-h-[24rem] items-end pb-10 pt-20 md:min-h-[30rem] md:pb-14">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm text-white/75">
            {mediaType === "movie" ? "In theaters" : "New episodes this week"}
          </p>
          <h1 id="featured-title" className="display-title text-shadow max-w-[16ch] text-white">
            {title}
          </h1>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums text-white/80">
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
            <p className="text-shadow mt-3 line-clamp-2 max-w-xl font-serif text-lg leading-relaxed text-white/90">
              {item.overview}
            </p>
          )}

          <Button asChild className="mt-6">
            <Link href={`/${mediaType}/${item.id}`}>View details</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
