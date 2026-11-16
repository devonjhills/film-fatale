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
 * The landing pages' lead: one current title. Its backdrop has no frame and
 * eases into the card colour, so the story sits beside the picture on wide
 * screens and rises into its faded lower edge on phones.
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
          {/* The picture eases into the card colour where the text meets it:
              along the bottom on phones, from the left on wide screens. The
              fades run a pixel past the picture so its edge can't show. */}
          <span className="absolute inset-x-0 -bottom-px h-3/4 bg-linear-to-b from-transparent via-surface-1/80 via-55% to-surface-1 to-90% lg:hidden" />
          <span className="absolute inset-y-0 -left-px hidden w-1/2 bg-linear-to-r from-surface-1 via-surface-1/80 to-transparent lg:block" />
        </Link>
      )}

      <div
        className={cn(
          "relative flex min-w-0 flex-col justify-center p-5 sm:p-6",
          backdrop && "-mt-16 pt-0 sm:-mt-24 sm:pt-0 lg:mt-0 lg:w-[44%] lg:p-10",
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
