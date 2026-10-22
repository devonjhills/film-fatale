"use client";

import { useState } from "react";
import Image from "next/image";
import type { ViewingHistoryItem } from "@/lib/types";
import { getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Check, Film } from "@/components/ui/icons";
import { saveLibraryItem, setEpisodeWatched } from "@/lib/hooks/use-library";
import { formatDate } from "@/lib/utils";
import { ProgressBar, episodeLabel, newEpisodesLabel, progressSummary } from "./progress";

interface UpNextListProps {
  items: ViewingHistoryItem[];
  onChange: () => void;
  onOpen: (item: ViewingHistoryItem) => void;
}

/** In-progress shows and films, each with its next step one tap away. */
export function UpNextList({ items, onChange, onOpen }: UpNextListProps) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <UpNextRow key={item.id} item={item} onChange={onChange} onOpen={onOpen} />
      ))}
    </ol>
  );
}

function UpNextRow({ item, onChange, onOpen }: { item: ViewingHistoryItem } & Omit<UpNextListProps, "items">) {
  const [saving, setSaving] = useState(false);
  const open = () => onOpen(item);
  const poster = getImageUrl(item.poster_path, "poster", "w185");
  const progress = item.progress;
  const next = progress?.next_episode;
  const badge = progress ? newEpisodesLabel(progress) : null;
  const percent =
    progress && progress.aired_episodes > 0
      ? (progress.watched_episodes / progress.aired_episodes) * 100
      : 0;

  const run = async (action: () => Promise<unknown>) => {
    setSaving(true);
    try {
      await action();
      onChange();
    } catch (error) {
      console.error("Error updating library:", error);
    } finally {
      setSaving(false);
    }
  };

  let detail: string;
  if (item.media_type === "movie") {
    detail = item.release_date ? `Film, ${new Date(item.release_date).getUTCFullYear()}` : "Film";
  } else if (!progress) {
    detail = "TV";
  } else {
    detail = progressSummary(progress);
    if (progress.aired_episodes > 0) {
      detail += ` · ${progress.watched_episodes} of ${progress.aired_episodes} episodes`;
    }
    if (!next && progress.next_air_date) {
      detail += ` · next episode ${formatDate(progress.next_air_date)}`;
    }
  }

  return (
    <li className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-6">
      <button type="button" onClick={open} className="poster-frame relative row-span-2 aspect-[2/3] overflow-hidden sm:row-span-1" tabIndex={-1} aria-hidden="true">
        {poster ? (
          <Image src={poster} alt="" fill sizes="72px" className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Film className="size-5 text-muted-foreground/50" aria-hidden="true" />
          </span>
        )}
      </button>

      <div className="min-w-0 self-center">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            className="text-left font-medium hover:underline hover:underline-offset-4"
          >
            {item.title}
          </button>
          {badge && (
            <span className="rounded-sm bg-mint px-1.5 py-0.5 text-xs font-semibold tabular-nums text-background">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm tabular-nums text-muted-foreground">{detail}</p>
        {progress && progress.aired_episodes > 0 && (
          <ProgressBar value={percent} className="mt-3 max-w-sm" />
        )}
      </div>

      <div className="col-start-2 flex items-center gap-1 sm:col-start-3">
        {item.media_type === "tv" && next && (
          <Button
            size="sm"
            variant={badge ? "default" : "outline"}
            disabled={saving}
            onClick={() => run(() => setEpisodeWatched(item, next, true))}
          >
            <Check className="size-4" weight="bold" aria-hidden="true" />
            Watched {episodeLabel(next)}
          </Button>
        )}
        {item.media_type === "movie" && (
          <Button
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={() => run(() => saveLibraryItem(item, { status: "completed" }))}
          >
            <Check className="size-4" weight="bold" aria-hidden="true" />
            Mark watched
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={open} aria-haspopup="dialog">
          {item.media_type === "tv" ? "Episodes" : "Details"}
        </Button>
      </div>
    </li>
  );
}
