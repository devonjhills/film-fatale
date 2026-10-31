import Image from "next/image";
import Link from "next/link";
import { Film, MonitorPlay, Star } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/lib/api";
import { LibraryButton } from "@/components/library/library-panel";
import { ShareButton } from "@/components/ui/share-button";
import { TrailerModal } from "@/components/ui/trailer-modal";
import { StreamingOn } from "@/components/shared/watch-providers";
import {
  formatRuntime,
  formatVoteAverage,
  getUSCertification,
} from "@/lib/utils";
import type {
  WatchProviderRegion,
  MovieDetailsOrTVShowDetails,
} from "@/lib/types";
import { isMovieDetails, isTVShowDetails } from "@/lib/types";

interface DetailsHeroProps {
  item: MovieDetailsOrTVShowDetails;
  mediaType: "movie" | "tv";
  trailer?: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  };
  watchProviders?: WatchProviderRegion;
  /** The people a title is credited to, e.g. its directors or creators. */
  credit?: { label: string; people: { id: number; name: string }[] };
}

export function DetailsHero({
  item,
  mediaType,
  trailer,
  watchProviders,
  credit,
}: DetailsHeroProps) {
  const backdropUrl = getImageUrl(item.backdrop_path, "backdrop", "w1280");
  const posterUrl = getImageUrl(item.poster_path, "poster", "w500");
  const title = isMovieDetails(item) ? item.title : item.name;
  const rawReleaseDate = isMovieDetails(item)
    ? item.release_date
    : item.first_air_date;
  const runtime = isMovieDetails(item) ? formatRuntime(item.runtime) : null;
  const certification = isMovieDetails(item)
    ? getUSCertification(item.release_dates)
    : null;
  const tagline =
    (isMovieDetails(item) || isTVShowDetails(item)) && item.tagline
      ? item.tagline
      : null;
  const genres =
    isMovieDetails(item) || isTVShowDetails(item) ? item.genres : [];

  return (
    <section className="blinds relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-x-0 top-0 -z-20 h-[30rem] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] md:h-[36rem]">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-top opacity-60"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </div>
      <div className="art-scrim absolute inset-0 -z-10" />

      {/*
        Poster and text share one grid. On large screens the text block is
        centred against the poster (the 1fr rows above and below absorb the
        difference); on phones a small poster sits beside the title and the
        rest runs full width beneath.
      */}
      <div className="site-container pb-10 pt-12 md:pb-14 md:pt-20">
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-5 gap-y-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-12 lg:gap-y-0">
          <div className="poster-frame relative col-start-1 row-start-1 aspect-[2/3] w-full self-start overflow-hidden shadow-[0_24px_60px_rgb(0_0_0/0.55)] lg:row-span-4">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={`${title} poster`}
                fill
                loading="eager"
                sizes="(max-width: 640px) 104px, (max-width: 1024px) 144px, 240px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-muted">
                {mediaType === "movie" ? (
                  <Film className="size-12 text-muted-foreground/50" />
                ) : (
                  <MonitorPlay className="size-12 text-muted-foreground/50" />
                )}
              </div>
            )}
          </div>

          <div className="col-start-2 row-start-1 min-w-0 self-end lg:row-start-2">
            <h1 className="hero-title text-shadow">{title}</h1>
            {tagline && (
              <p className="mt-2 max-w-3xl font-serif text-lg italic leading-snug text-muted-foreground md:mt-3 md:text-xl">
                {tagline}
              </p>
            )}
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums text-muted-foreground md:mt-4">
              {item.vote_average > 0 && (
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <Star className="size-3.5" weight="fill" aria-hidden="true" />
                  <span className="sr-only">Rated </span>
                  {formatVoteAverage(item.vote_average)}
                </span>
              )}
              {certification && (
                <span className="rounded-sm border border-input px-1.5 py-px text-xs font-medium text-foreground">
                  {certification}
                </span>
              )}
              {rawReleaseDate && <span>{new Date(rawReleaseDate).getUTCFullYear()}</span>}
              {runtime && <span>{runtime}</span>}
              {isTVShowDetails(item) && item.number_of_seasons ? (
                <span>
                  {item.number_of_seasons} season{item.number_of_seasons === 1 ? "" : "s"}
                </span>
              ) : null}
              {genres.length > 0 && (
                <span>{genres.map((genre: { id: number; name: string }) => genre.name).join(", ")}</span>
              )}
            </p>
            {credit && credit.people.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {credit.label}{" "}
                {credit.people.map((person, index) => (
                  <span key={person.id}>
                    {index > 0 && ", "}
                    <Link
                      href={`/person/${person.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {person.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>

          <div className="col-span-2 row-start-2 min-w-0 lg:col-span-1 lg:col-start-2 lg:row-start-3 lg:mt-5">
            {item.overview && <p className="reading-text max-w-[62ch]">{item.overview}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              {trailer && <TrailerModal trailer={trailer} title={title} size="lg" />}
              <LibraryButton
                meta={{
                  tmdb_id: item.id,
                  media_type: mediaType,
                  title,
                  poster_path: item.poster_path,
                  overview: item.overview,
                  release_date: rawReleaseDate,
                  vote_average: item.vote_average,
                }}
                size="lg"
              />
              <ShareButton title={title} />
            </div>

            <StreamingOn providers={watchProviders} className="mt-6" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Loading state for movie and TV detail pages: hero, then two sections. */
export function DetailsPageSkeleton() {
  return (
    <div aria-busy="true">
      <div className="border-b border-border">
        <div className="site-container pb-10 pt-12 md:pb-14 md:pt-20">
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-12">
            <Skeleton className="aspect-[2/3] w-full" />
            <div className="space-y-5">
              <Skeleton className="h-12 w-3/4 max-w-2xl md:h-16" />
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-24 w-full max-w-2xl" />
              <div className="flex gap-3">
                <Skeleton className="h-11 w-36" />
                <Skeleton className="h-11 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="site-container space-y-12 py-10 md:py-14">
        {[0, 1].map((section) => (
          <div key={section}>
            <Skeleton className="mb-6 h-9 w-40" />
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
