"use client";

import { useState } from "react";
import Image from "next/image";
import { mutate as revalidate } from "swr";
import { useAuth } from "@/components/providers/auth-provider";
import { Check, Play, Star } from "@/components/ui/icons";
import { MetaLine } from "@/components/ui/meta-line";
import { Panel, PanelNote } from "@/components/ui/panel";
import { getImageUrl } from "@/lib/api";
import {
  libraryItemKey,
  setEpisodeWatched,
  useEpisodeState,
  type EpisodeState,
  type LibraryMeta,
} from "@/lib/hooks/use-library";
import type { TVSeasonDetails } from "@/lib/types";
import { cn, formatDate, formatRuntime, formatVoteAverage } from "@/lib/utils";

type Episode = NonNullable<TVSeasonDetails["episodes"]>[number];

interface SeasonEpisodesProps {
  episodes: Episode[];
  seasonNumber: number;
  /** The show, for adding it to the library on a first watch. Null until loaded. */
  show: LibraryMeta | null;
}

/**
 * The season page's Episodes panel: each episode its own card. For the signed-in owner every aired
 * episode gets a watched toggle: one request per click, and the season's
 * progress is fetched once per visit. Visitors get the plain list.
 */
export function SeasonEpisodes({ episodes, seasonNumber, show }: SeasonEpisodesProps) {
  const { user } = useAuth();
  // Specials (season 0) aren't tracked.
  const tracking = Boolean(user && show && seasonNumber > 0);
  const { data, mutate } = useEpisodeState(show?.tmdb_id ?? 0, tracking);
  const [saving, setSaving] = useState<number | null>(null);

  const watched = new Set(
    (data?.episodes ?? [])
      .filter((ep) => ep.season_number === seasonNumber)
      .map((ep) => ep.episode_number),
  );
  const aired = data?.progress.seasons.find((s) => s.season_number === seasonNumber)?.aired ?? 0;

  const toggle = async (episodeNumber: number, isWatched: boolean) => {
    if (!show || saving !== null || !data) return;
    setSaving(episodeNumber);
    // Show the change at once: watching marks this episode and every one
    // before it, unwatching clears just this one. The reply replaces it.
    const others = data.episodes.filter((ep) => ep.season_number !== seasonNumber);
    const now = new Date().toISOString();
    const thisSeason = isWatched
      ? Array.from(new Set([...watched, ...Array.from({ length: episodeNumber }, (_, i) => i + 1)]))
      : [...watched].filter((n) => n !== episodeNumber);
    const optimistic: EpisodeState = {
      ...data,
      episodes: [
        ...others,
        ...thisSeason.map((n) => ({ season_number: seasonNumber, episode_number: n, watched_at: now })),
      ],
    };
    try {
      await mutate(setEpisodeWatched(show, { season_number: seasonNumber, episode_number: episodeNumber }, isWatched), {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      });
      // Watching can add the show to the library or change its status.
      void revalidate(libraryItemKey(show));
    } catch (error) {
      console.error("Error updating episodes:", error);
    } finally {
      setSaving(null);
    }
  };

  const watchedAired = [...watched].filter((n) => n <= aired).length;
  const note = tracking && data && aired > 0 ? `${watchedAired} of ${aired} watched` : String(episodes.length);

  return (
    <Panel title="Episodes" aside={<PanelNote>{note}</PanelNote>}>
      <ol className="space-y-2.5">
        {episodes.map((episode) => {
          const still = getImageUrl(episode.still_path, "backdrop", "w300");
          const isWatched = watched.has(episode.episode_number);
          const canMark = tracking && Boolean(data) && episode.episode_number <= aired;

          return (
            // Phones: a small still beside the number and title, then the
            // story and the toggle. Wide: still | text | toggle.
            <li
              key={episode.id}
              className={cn(
                "grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-md border bg-surface-2 p-3",
                "[grid-template-areas:'still_head'_'body_body'_'action_action']",
                "sm:grid-cols-[11rem_minmax(0,1fr)_auto] sm:gap-x-5 sm:gap-y-2 sm:p-4",
                "sm:[grid-template-areas:'still_head_action'_'still_body_body']",
                isWatched ? "border-mint/35" : "border-line",
              )}
            >
              <div className="relative aspect-video self-start overflow-hidden rounded-sm border border-line bg-surface-3 [grid-area:still]">
                {still ? (
                  <Image src={still} alt="" fill className="object-cover" sizes="(max-width: 640px) 112px, 176px" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Play className="size-5 text-ink-muted/50" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="min-w-0 self-center [grid-area:head] sm:self-start">
                <MetaLine
                  className="text-ui sm:text-sm"
                  items={[
                    <span key="n" className="font-medium text-ink">
                      Episode {episode.episode_number}
                    </span>,
                    episode.air_date && formatDate(episode.air_date),
                    episode.runtime > 0 && formatRuntime(episode.runtime),
                    episode.vote_average > 0 && (
                      <span key="r" className="inline-flex items-center gap-1">
                        <Star className="size-3 text-violet" weight="fill" aria-hidden="true" />
                        <span className="sr-only">Rated </span>
                        {formatVoteAverage(episode.vote_average)}
                      </span>
                    ),
                  ]}
                />
                <h3 className="mt-1 font-medium leading-snug text-ink">{episode.name}</h3>
              </div>

              {episode.overview && (
                <p className="max-w-[75ch] text-sm leading-6 text-ink/80 [grid-area:body]">{episode.overview}</p>
              )}

              {canMark && (
                <button
                  type="button"
                  aria-pressed={isWatched}
                  disabled={saving !== null}
                  onClick={() => toggle(episode.episode_number, !isWatched)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 justify-self-start rounded-md border px-3 text-sm font-medium transition-colors duration-150 [grid-area:action] disabled:opacity-60 sm:self-start",
                    isWatched
                      ? "border-mint/50 bg-mint/15 text-mint hover:bg-mint/25"
                      : "border-line-strong bg-surface-1 text-ink-muted hover:border-ink-muted hover:text-ink",
                  )}
                >
                  <Check className="size-3.5" weight="bold" aria-hidden="true" />
                  {isWatched ? "Watched" : "Mark watched"}
                  <span className="sr-only">: episode {episode.episode_number}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {tracking && data && aired > 0 && (
        <p className="mt-3 text-xs text-ink-muted">Marking an episode watched also marks every episode before it.</p>
      )}
    </Panel>
  );
}

