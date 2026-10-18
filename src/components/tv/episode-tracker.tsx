"use client";

import { useState } from "react";
import { mutate as revalidate } from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { Section } from "@/components/shared/section";
import {
  setEpisodeWatched,
  useEpisodeState,
  type LibraryMeta,
} from "@/lib/hooks/use-library";
import { formatDate, cn } from "@/lib/utils";
import { ProgressBar, progressSummary } from "@/components/library/progress";

interface EpisodeTrackerProps {
  show: LibraryMeta;
  seasons: {
    season_number: number;
    episode_count: number;
    name: string;
  }[];
}

export function EpisodeTracker({ show, seasons }: EpisodeTrackerProps) {
  const { data, isLoading, mutate } = useEpisodeState(show.tmdb_id, true);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const regularSeasons = seasons.filter((season) => season.season_number > 0);
  const progress = data?.progress;
  const watched = new Set(
    data?.episodes.map((ep) => `${ep.season_number}-${ep.episode_number}`),
  );

  // Open on the season you're in the middle of.
  const selectedSeason =
    selected ??
    progress?.next_episode?.season_number ??
    regularSeasons[0]?.season_number ??
    1;
  const season = regularSeasons.find((s) => s.season_number === selectedSeason);
  const seasonProgress = progress?.seasons.find(
    (s) => s.season_number === selectedSeason,
  );
  const aired = seasonProgress?.aired ?? 0;

  const update = async (
    target: { season_number: number; episode_number?: number },
    isWatched: boolean,
  ) => {
    if (saving) return;
    setSaving(true);
    try {
      await mutate(setEpisodeWatched(show, target, isWatched), { revalidate: false });
      // Watching an episode can add the show to the library or change its status.
      void revalidate(`/api/viewing-history?tmdb_id=${show.tmdb_id}&media_type=tv`);
    } catch (error) {
      console.error("Error updating episodes:", error);
    } finally {
      setSaving(false);
    }
  };

  const action = (
    <Link
      href="/library"
      className="flex min-h-11 shrink-0 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      Open library
    </Link>
  );

  if (isLoading || !progress) {
    return (
      <Section title="Your progress" action={action}>
        <div className="animate-pulse space-y-4" aria-busy="true">
          <div className="h-4 w-1/3 rounded-sm bg-muted" />
          <div className="h-1 rounded-full bg-muted" />
          <div className="h-11 w-2/3 rounded-sm bg-muted" />
        </div>
      </Section>
    );
  }

  const percent =
    progress.aired_episodes > 0
      ? (progress.watched_episodes / progress.aired_episodes) * 100
      : 0;

  return (
    <Section title="Your progress" action={action}>
      <div className="mb-8 max-w-2xl">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
          <p>
            <span className="font-medium tabular-nums">
              {progress.watched_episodes} of {progress.aired_episodes}
            </span>{" "}
            <span className="text-muted-foreground">aired episodes watched</span>
          </p>
          <p className="text-muted-foreground">{progressSummary(progress)}</p>
        </div>
        <ProgressBar value={percent} className="mt-3" />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Season">
        {regularSeasons.map((s) => {
          const p = progress.seasons.find((x) => x.season_number === s.season_number);
          const isSelected = selectedSeason === s.season_number;
          const done = !!p && p.aired > 0 && p.watched >= p.aired;

          return (
            <button
              key={s.season_number}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(s.season_number)}
              className={cn(
                "flex min-h-11 min-w-14 items-center justify-center gap-1 rounded-sm border px-3 text-sm font-medium tabular-nums transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input text-foreground hover:border-foreground/60",
                !isSelected && p?.aired === 0 && "text-muted-foreground",
              )}
            >
              S{s.season_number}
              {done && <Check className="size-3.5" weight="bold" aria-label="watched" />}
            </button>
          );
        })}
      </div>

      {season && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-medium">{season.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {" "}
                {aired > 0
                  ? `${seasonProgress?.watched ?? 0} of ${aired} watched`
                  : "Not aired yet"}
              </span>
            </p>
            {aired > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => update({ season_number: season.season_number }, true)}
                >
                  <Check className="size-4" weight="bold" aria-hidden="true" />
                  Watched through this season
                </Button>
                {(seasonProgress?.watched ?? 0) > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={saving}
                    onClick={() => update({ season_number: season.season_number }, false)}
                  >
                    Clear season
                  </Button>
                )}
              </div>
            )}
          </div>

          <ul
            className={cn(
              "mt-5 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5",
              saving && "opacity-60",
            )}
          >
            {Array.from({ length: season.episode_count }, (_, i) => {
              const episode = i + 1;
              const isWatched = watched.has(`${season.season_number}-${episode}`);
              const hasAired = episode <= aired;

              return (
                <li key={episode}>
                  <button
                    type="button"
                    aria-pressed={isWatched}
                    aria-label={`Episode ${episode}${hasAired ? "" : ", not aired yet"}`}
                    disabled={!hasAired || saving}
                    onClick={() =>
                      update(
                        { season_number: season.season_number, episode_number: episode },
                        !isWatched,
                      )
                    }
                    className={cn(
                      "flex h-11 w-full items-center justify-center rounded-sm border text-sm font-medium tabular-nums transition-colors",
                      isWatched
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                      !hasAired && "border-dashed border-border text-muted-foreground/50 hover:border-border hover:text-muted-foreground/50",
                    )}
                  >
                    {episode}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Marking an episode also marks every episode before it.
            {progress.next_air_date &&
              ` Next episode airs ${formatDate(progress.next_air_date)}.`}
          </p>
        </div>
      )}
    </Section>
  );
}
