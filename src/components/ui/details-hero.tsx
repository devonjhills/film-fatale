import Image from "next/image";
import { Film, MonitorPlay, Star } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/api";
import { WatchStatusButton } from "@/components/shared/watch-status-button";
import { ShareButton } from "@/components/ui/share-button";
import { TrailerModal } from "@/components/ui/trailer-modal";
import { WatchProvidersCompact } from "@/components/shared/watch-providers";
import { ExternalLinks } from "@/components/ui/external-links";
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
  const hasExternalLinks =
    Boolean(item.external_ids?.imdb_id) || Boolean(item.homepage);

  return (
    <section className="relative isolate overflow-hidden border-b border-border/70">
      <div className="absolute inset-x-0 top-0 -z-20 h-[34rem] md:h-[42rem]">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-top opacity-65"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </div>
      <div className="art-scrim absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/20 to-background" />

      <div className="site-container pb-14 pt-32 md:pb-20 md:pt-52">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-12">
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

            {watchProviders?.flatrate?.length ? (
              <div className="mx-auto mt-3 flex w-48 items-center justify-between gap-3 rounded-md border border-border/75 bg-card/95 p-3 sm:w-56 lg:w-full">
                <div>
                  <p className="eyebrow text-[0.58rem]">Streaming</p>
                  <p className="mt-1 text-xs font-semibold">Watch on</p>
                </div>
                <WatchProvidersCompact providers={watchProviders} />
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            <p className="eyebrow mb-4">
              {mediaType === "movie" ? "Film dossier" : "Series dossier"}
            </p>
            <h1 className="display-title text-shadow-cinematic max-w-5xl">
              {title}
            </h1>
            {tagline && (
              <p className="mt-5 max-w-3xl font-serif text-xl italic leading-relaxed text-foreground/72 md:text-2xl">
                “{tagline}”
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {item.vote_average > 0 && (
                <Badge variant="secondary" className="gap-1.5">
                  <Star className="size-3.5 text-brass" weight="fill" />
                  {formatVoteAverage(item.vote_average)}
                </Badge>
              )}
              {certification && <Badge variant="outline">{certification}</Badge>}
              {rawReleaseDate && (
                <Badge variant="secondary">
                  {new Date(rawReleaseDate).getFullYear()}
                </Badge>
              )}
              {runtime && <Badge variant="secondary">{runtime}</Badge>}
              {isTVShowDetails(item) && item.number_of_seasons ? (
                <Badge variant="secondary">
                  {item.number_of_seasons} season
                  {item.number_of_seasons === 1 ? "" : "s"}
                </Badge>
              ) : null}
            </div>

            {genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {genres.map((genre: { id: number; name: string }) => (
                  <span key={genre.id}>{genre.name}</span>
                ))}
              </div>
            )}

            {item.overview && (
              <p className="mt-6 max-w-4xl text-base leading-7 text-foreground/82 md:text-lg md:leading-8">
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
              <ShareButton
                title={`${title} - ${mediaType === "movie" ? "Movie" : "TV Show"} Details`}
                text={`Check out "${title}" on Film Fatale.`}
              />
            </div>

            {hasExternalLinks && (
              <div className="mt-8 border-t border-border/70 pt-5">
                <ExternalLinks
                  externalIds={item.external_ids}
                  homepage={item.homepage}
                  title={title}
                  releaseDate={rawReleaseDate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
