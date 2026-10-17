import Image from "next/image";
import { Film, MonitorPlay, Star } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/lib/api";
import { WatchStatusButton } from "@/components/shared/watch-status-button";
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
}

export function DetailsHero({
  item,
  mediaType,
  trailer,
  watchProviders,
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
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-x-0 top-0 -z-20 h-[32rem] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] md:h-[40rem]">
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

      <div className="site-container pb-14 pt-28 md:pb-20 md:pt-48">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-14">
          <div>
            <div className="poster-frame relative mx-auto aspect-[2/3] w-48 overflow-hidden sm:w-56 lg:mx-0 lg:w-full">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={`${title} poster`}
                  fill
                  loading="eager"
                  sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 300px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted">
                  {mediaType === "movie" ? (
                    <Film className="size-20 text-muted-foreground/50" weight="duotone" />
                  ) : (
                    <MonitorPlay className="size-20 text-muted-foreground/50" weight="duotone" />
                  )}
                </div>
              )}
            </div>

            <StreamingOn
              providers={watchProviders}
              className="mx-auto mt-5 w-48 sm:w-56 lg:w-full"
            />
          </div>

          <div className="min-w-0">
            <h1 className="display-title text-shadow-cinematic max-w-5xl">
              {title}
            </h1>
            {tagline && (
              <p className="mt-5 max-w-3xl font-serif text-xl leading-snug text-muted-foreground md:text-2xl">
                {tagline}
              </p>
            )}

            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums text-muted-foreground">
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
              {rawReleaseDate && <span>{new Date(rawReleaseDate).getFullYear()}</span>}
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

            {item.overview && (
              <p className="mt-5 max-w-[65ch] text-base leading-7 text-foreground/90 md:text-lg md:leading-8">
                {item.overview}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {trailer && (
                <TrailerModal trailer={trailer} title={title} size="lg" />
              )}
              <WatchStatusButton
                tmdb_id={item.id}
                media_type={mediaType}
                title={title}
                poster_path={item.poster_path}
                overview={item.overview}
                release_date={rawReleaseDate}
                vote_average={item.vote_average}
                size="lg"
              />
              <ShareButton />
            </div>

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
        <div className="site-container pb-14 pt-28 md:pb-20 md:pt-48">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-14">
            <Skeleton className="mx-auto aspect-[2/3] w-48 sm:w-56 lg:mx-0 lg:w-full" />
            <div className="space-y-5">
              <Skeleton className="h-16 w-3/4 max-w-2xl md:h-24" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-24 w-full max-w-2xl" />
              <div className="flex gap-3">
                <Skeleton className="h-11 w-36" />
                <Skeleton className="h-11 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="site-container space-y-16 py-14 md:py-20">
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
