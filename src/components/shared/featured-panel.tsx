import Image from "next/image";
import Link from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Star } from "@/components/ui/icons";
import { cn, formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import type { Movie, TVShow } from "@/lib/types";

interface FeaturedPanelProps {
  /** The first item with a backdrop is featured. */
  items: (Movie | TVShow)[];
  mediaType: "movie" | "tv";
}

const COPY = {
  movie: { kicker: "New in theaters", href: "/movies/now-playing", more: "Everything in theaters" },
  tv: { kicker: "New episodes this week", href: "/tv/on-the-air", more: "Everything on this week" },
};

/**
 * The landing pages' lead: one current title. Its backdrop fills the card;
 * the story sits on a heavier flat panel that the image runs under, beside
 * the picture on wide screens and below it on phones.
 */
export function FeaturedPanel({ items, mediaType }: FeaturedPanelProps) {
  const item = items.find((candidate) => candidate.backdrop_path) ?? items[0];
  if (!item) return null;

  const title = "title" in item ? item.title : item.name;
  const releaseDate = "release_date" in item ? item.release_date : item.first_air_date;
  const backdrop = item.backdrop_path ? getImageUrl(item.backdrop_path, "backdrop", "w1280") : null;
  const { kicker, href, more } = COPY[mediaType];
  const detailsHref = `/${mediaType}/${item.id}`;

  return (
    <section
      aria-labelledby="featured-title"
      className="relative isolate overflow-hidden rounded-xl border border-line bg-surface-1 lg:flex lg:min-h-[27rem]"
    >
      {backdrop && (
        <Link
          href={detailsHref}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block aspect-video lg:absolute lg:inset-y-0 lg:left-[28%] lg:right-0 lg:-z-10 lg:aspect-auto"
        >
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 1000px"
            className="object-cover object-[center_30%]"
          />
        </Link>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-col justify-center p-5 sm:p-6",
          backdrop && "border-t border-line lg:w-[44%] lg:border-r lg:border-t-0 lg:bg-page/90 lg:p-10",
        )}
      >
        <p className="text-ui font-semibold text-violet">{kicker}</p>
        <h1 id="featured-title" className="hero-title mt-1.5">
          {title}
        </h1>

        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums text-ink-muted">
          {item.vote_average > 0 && (
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <Star className="size-3.5 text-violet" weight="fill" aria-hidden="true" />
              <span className="sr-only">Rated </span>
              {formatVoteAverage(item.vote_average)}
            </span>
          )}
          {releaseDate && <span>{new Date(releaseDate).getUTCFullYear()}</span>}
        </p>

        {item.overview && <p className="reading-text mt-3 line-clamp-3 max-w-xl">{item.overview}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button asChild size="lg">
            <Link href={detailsHref}>View details</Link>
          </Button>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center text-ui text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors duration-150 hover:text-ink hover:decoration-ink"
          >
            {more}
          </Link>
        </div>
      </div>
    </section>
  );
}
