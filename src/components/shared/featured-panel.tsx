import Image from "next/image";
import Link from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Panel, panelLinkClass } from "@/components/ui/panel";
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
  movie: { kicker: "New in theaters", href: "/movies/now-playing" },
  tv: { kicker: "New episodes this week", href: "/tv/on-the-air" },
};

/** The landing pages' lead: one current title, its story and its backdrop. */
export function FeaturedPanel({ items, mediaType }: FeaturedPanelProps) {
  const item = items.find((candidate) => candidate.backdrop_path) ?? items[0];
  if (!item) return null;

  const title = "title" in item ? item.title : item.name;
  const releaseDate = "release_date" in item ? item.release_date : item.first_air_date;
  const backdrop = item.backdrop_path ? getImageUrl(item.backdrop_path, "backdrop", "w1280") : null;
  const { kicker, href } = COPY[mediaType];

  return (
    <Panel
      title="Featured"
      aside={
        <Link href={href} className={panelLinkClass}>
          See all<span className="sr-only"> {kicker.toLowerCase()}</span>
        </Link>
      }
      bodyClassName={cn(
        "grid items-center gap-5 p-4 sm:p-6 lg:gap-8",
        backdrop && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
      )}
    >
      <div className="min-w-0">
        <p className="text-ui font-semibold text-violet">{kicker}</p>
        <h1 className="hero-title mt-1.5">{title}</h1>

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

        {item.overview && (
          <p className="reading-text mt-3 line-clamp-2 max-w-xl">{item.overview}</p>
        )}

        <Button asChild size="lg" className="mt-5">
          <Link href={`/${mediaType}/${item.id}`}>View details</Link>
        </Button>
      </div>

      {backdrop && (
        <Link
          href={`/${mediaType}/${item.id}`}
          tabIndex={-1}
          aria-hidden="true"
          className="relative order-first block aspect-video overflow-hidden rounded-md border border-line bg-surface-2 lg:order-none"
        >
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 760px"
            className="object-cover"
          />
        </Link>
      )}
    </Panel>
  );
}
