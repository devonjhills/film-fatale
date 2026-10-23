"use client";

import { useState } from "react";
import { mutate as revalidate } from "swr";
import { Button } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import {
  libraryItemKey,
  setEpisodeWatched,
  useEpisodeState,
  type LibraryMeta,
} from "@/lib/hooks/use-library";
import { formatDate, cn } from "@/lib/utils";
import { ProgressBar, progressSummary } from "@/components/library/progress";

interface EpisodeTrackerProps {
  show: LibraryMeta;
  /** Called after any episode is marked or cleared. */
  onChange?: () => void;
}

/** Season picker and episode grid. Seasons come from the progress data, so no TMDB page is needed. */
export function EpisodeTracker({ show, onChange }: EpisodeTrackerProps) {
  const { data, isLoading, mutate } = useEpisodeState(show.tmdb_id, true);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const progress = data?.progress;
  const watched = new Set(
    data?.episodes.map((ep) => `${ep.season_number}-${ep.episode_number}`),
  );

  const update = async (
    target: { season_number: number; episode_number?: number },
    isWatched: boolean,
  ) => {
    if (saving) return;
    setSaving(true);
    try {
      await mutate(setEpisodeWatched(show, target, isWatched), { revalidate: false });
      // Watching an episode can add the show to the library or change its status.
      void revalidate(libraryItemKey(show));
      onChange?.();
    } catch (error) {
      console.error("Error updating episodes:", error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !progress) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-4 w-1/2 rounded-sm bg-muted" />
        <div className="h-1 rounded-full bg-muted" />
        <div className="h-10 w-2/3 rounded-sm bg-muted" />
        <div className="h-24 rounded-sm bg-muted" />
      </div>
    );
  }

  const seasons = progress.seasons;
  if (seasons.length === 0) {
    return <p className="text-sm text-muted-foreground">No episodes listed yet.</p>;
  }

  // Open on the season you're in the middle of.
  const selectedSeason =
    selected ?? progress.next_episode?.season_number ?? seasons[0].season_number;
  const season = seasons.find((s) => s.season_number === selectedSeason) ?? seasons[0];
  const percent =
    progress.aired_episodes > 0
      ? (progress.watched_episodes / progress.aired_episodes) * 100
      : 0;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <p className="text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">{progress.watched_episodes}</span>
          {" of "}
          <span className="font-medium tabular-nums text-foreground">{progress.aired_episodes}</span>
          {" aired episodes watched"}
        </p>
        <p className="text-muted-foreground">{progressSummary(progress)}</p>
      </div>
      <ProgressBar value={percent} className="mt-3" />

      {seasons.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Season">
          {seasons.map((s) => {
            const isSelected = season.season_number === s.season_number;
            const done = s.aired > 0 && s.watched >= s.aired;
            return (
              <button
                key={s.season_number}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(s.season_number)}
                className={cn(
                  "flex min-h-10 min-w-12 items-center justify-center gap-1 rounded-sm border px-2.5 text-sm font-medium tabular-nums transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input text-foreground hover:border-foreground/60",
                  !isSelected && s.aired === 0 && "text-muted-foreground",
                )}
              >
                S{s.season_number}
                {done && <Check className="size-3.5" weight="bold" aria-label="watched" />}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">Season {season.season_number}</span>
          <span className="text-muted-foreground/50" aria-hidden="true">
            ·
          </span>
          <span className="tabular-nums text-muted-foreground">
            {season.aired > 0 ? `${season.watched} of ${season.aired} watched` : "Not aired yet"}
          </span>
        </p>
        {season.aired > 0 && (
          <div className="flex gap-1">
            {season.watched < season.aired && (
              <Button
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => update({ season_number: season.season_number }, true)}
              >
                <Check className="size-4" weight="bold" aria-hidden="true" />
                Whole season
              </Button>
            )}
            {season.watched > 0 && (
              <Button
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={() => update({ season_number: season.season_number }, false)}
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      <ul
        className={cn(
          "mt-3 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5",
          saving && "opacity-60",
        )}
      >
        {Array.from({ length: season.episode_count }, (_, i) => {
          const episode = i + 1;
          const isWatched = watched.has(`${season.season_number}-${episode}`);
          const hasAired = episode <= season.aired;

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
                  "flex h-10 w-full items-center justify-center rounded-sm border text-sm font-medium tabular-nums transition-colors",
                  isWatched
                    ? "border-mint bg-mint text-background"
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
      <p className="mt-3 text-xs text-muted-foreground">
        Marking an episode also marks every episode before it.
        {progress.next_air_date && ` Next episode airs ${formatDate(progress.next_air_date)}.`}
      </p>
    </div>
  );
}
