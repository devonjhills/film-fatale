"use client";

import { useState, useEffect, useCallback } from "react";
import { TVShowProgress, EpisodeProgress } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { Section } from "@/components/shared/section";
import { cn } from "@/lib/utils";

interface EpisodeTrackerProps {
  tmdb_id: number;
  seasons: {
    season_number: number;
    episode_count: number;
    name: string;
  }[]; // TMDB season data
}

export function EpisodeTracker({ tmdb_id, seasons }: EpisodeTrackerProps) {
  const [progress, setProgress] = useState<TVShowProgress | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/tv-progress/${tmdb_id}`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error("Error fetching TV progress:", error);
    }
  }, [tmdb_id]);

  const fetchEpisodes = useCallback(
    async (season?: number) => {
      try {
        const params = new URLSearchParams({ tmdb_id: tmdb_id.toString() });
        if (season) params.append("season_number", season.toString());

        const response = await fetch(`/api/episodes?${params}`);
        if (response.ok) {
          const data = await response.json();
          setEpisodes(data.episodes);
        }
      } catch (error) {
        console.error("Error fetching episodes:", error);
      } finally {
        setLoading(false);
      }
    },
    [tmdb_id],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProgress();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchProgress]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchEpisodes(selectedSeason);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedSeason, fetchEpisodes]);

  const toggleEpisode = async (
    season_number: number,
    episode_number: number,
    watched: boolean,
  ) => {
    try {
      const response = await fetch("/api/episodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tmdb_id,
          season_number,
          episode_number,
          watched,
        }),
      });

      if (response.ok) {
        await fetchProgress();
        await fetchEpisodes(selectedSeason);
      }
    } catch (error) {
      console.error("Error toggling episode:", error);
    }
  };

  const markSeasonWatched = async (season_number: number, watched: boolean) => {
    const season = seasons.find((s) => s.season_number === season_number);
    if (!season) return;

    try {
      // Create batch of episodes to update
      const episodesToUpdate = [];
      for (let ep = 1; ep <= season.episode_count; ep++) {
        episodesToUpdate.push({
          season_number,
          episode_number: ep,
          watched,
        });
      }

      // Send batch update request
      const response = await fetch("/api/episodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tmdb_id,
          episodes: episodesToUpdate,
        }),
      });

      if (response.ok) {
        // Refresh data after batch update
        await fetchProgress();
        await fetchEpisodes(selectedSeason);
      } else {
        console.error("Batch update failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error marking season:", error);
    }
  };

  const action = (
    <Link
      href="/library?tab=watching"
      className="flex min-h-11 shrink-0 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      Open library
    </Link>
  );

  if (loading) {
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

  const regularSeasons = seasons.filter((season) => season.season_number > 0);
  const season = regularSeasons.find((s) => s.season_number === selectedSeason);
  const seasonProgress = progress?.seasons.find(
    (s) => s.season_number === selectedSeason,
  );

  return (
    <Section title="Your progress" action={action}>
      {progress && (
        <div className="mb-8 max-w-2xl">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
            <p>
              <span className="font-medium tabular-nums">
                {progress.watched_episodes} of {progress.total_episodes}
              </span>{" "}
              <span className="text-muted-foreground">episodes watched</span>
            </p>
            {progress.next_episode && (
              <p className="text-muted-foreground">
                Next up{" "}
                <span className="font-medium tabular-nums text-foreground">
                  S{progress.next_episode.season_number} E
                  {progress.next_episode.episode_number}
                </span>
              </p>
            )}
          </div>
          <ProgressBar value={progress.completion_percentage} className="mt-3" />
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Season">
        {regularSeasons.map((s) => {
          const percent = progress?.seasons.find(
            (p) => p.season_number === s.season_number,
          )?.completion_percentage;
          const isSelected = selectedSeason === s.season_number;

          return (
            <button
              key={s.season_number}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedSeason(s.season_number)}
              className={cn(
                "flex min-h-11 min-w-16 flex-col items-center justify-center rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-input text-foreground hover:border-foreground/60",
              )}
            >
              S{s.season_number}
              {percent !== undefined && percent > 0 && (
                <span
                  className={cn(
                    "text-[0.6875rem] tabular-nums",
                    isSelected ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  {Math.round(percent)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {season && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-medium">{season.name}</span>
              {seasonProgress && (
                <span className="text-muted-foreground tabular-nums">
                  {" "}
                  · {seasonProgress.watched_episodes} of{" "}
                  {seasonProgress.total_episodes} watched
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markSeasonWatched(season.season_number, true)}
              >
                <Check className="size-4" weight="bold" aria-hidden="true" />
                Mark season watched
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markSeasonWatched(season.season_number, false)}
              >
                Clear
              </Button>
            </div>
          </div>

          <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5">
            {Array.from({ length: season.episode_count }, (_, i) => {
              const episode_number = i + 1;
              const isWatched =
                episodes.find(
                  (ep) =>
                    ep.season_number === season.season_number &&
                    ep.episode_number === episode_number,
                )?.watched || false;

              return (
                <li key={episode_number}>
                  <button
                    type="button"
                    aria-pressed={isWatched}
                    aria-label={`Episode ${episode_number}`}
                    onClick={() =>
                      toggleEpisode(season.season_number, episode_number, !isWatched)
                    }
                    className={cn(
                      "flex h-11 w-full items-center justify-center rounded-sm border text-sm font-medium tabular-nums transition-colors",
                      isWatched
                        ? "border-foreground bg-foreground text-background"
                        : "border-input text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                    )}
                  >
                    {episode_number}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Section>
  );
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div className="h-full bg-foreground" style={{ width: `${value}%` }} />
    </div>
  );
}
