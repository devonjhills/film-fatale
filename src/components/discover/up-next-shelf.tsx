"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "@/components/ui/app-link";
import { mutate as seed } from "swr";
import type { ViewingHistoryItem } from "@/lib/types";
import { getImageUrl } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { libraryItemKey, setEpisodeWatched, useLibrary } from "@/lib/hooks/use-library";
import { LibraryPanel } from "@/components/library/library-panel";
import { ProgressBar, episodeLabel, newEpisodesLabel } from "@/components/library/progress";
import { Button } from "@/components/ui/button";
import { Check, Film } from "@/components/ui/icons";
import { Panel, panelLinkClass } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SHOWN = 4;
const time = (value: string | null | undefined) => (value ? Date.parse(value) : 0);

/**
 * What to watch next, from the owner's library: shows with new or unwatched
 * episodes first (new episodes ahead of the rest), then films in progress,
 * then the latest additions to the watchlist.
 */
function pickUpNext(items: ViewingHistoryItem[]) {
  const inProgress = items
    .filter((item) => {
      const watching = item.status === "watching" || (item.status === "completed" && item.progress?.has_new);
      if (!watching) return false;
      return item.media_type === "movie" || Boolean(item.progress?.next_episode);
    })
    .sort((a, b) => {
      const newer = Number(!!b.progress?.has_new) - Number(!!a.progress?.has_new);
      if (newer) return newer;
      return time(b.last_watched_at || b.updated_at) - time(a.last_watched_at || a.updated_at);
    });
  const watchlist = items
    .filter((item) => item.status === "plan_to_watch")
    .sort((a, b) => time(b.created_at) - time(a.created_at));
  return [...inProgress, ...watchlist].slice(0, SHOWN);
}

/** The owner's next watches, on Discover. Renders nothing for visitors. */
export function UpNextShelf() {
  const { user, loading } = useAuth();
  const { items, mutate } = useLibrary(Boolean(user));
  const [active, setActive] = useState<ViewingHistoryItem | null>(null);
  const [open, setOpen] = useState(false);

  if (loading || !user) return null;

  const picks = items ? pickUpNext(items) : [];
  if (items && picks.length === 0) return null;

  const openPanel = (item: ViewingHistoryItem) => {
    void seed(libraryItemKey(item), { items: [item] }, { revalidate: false });
    setActive(item);
    setOpen(true);
  };

  return (
    <Panel
      title="Up next for you"
      aside={
        <Link href="/library" className={panelLinkClass}>
          Your library
        </Link>
      }
    >
      <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {items
          ? picks.map((item) => (
              <UpNextCard key={item.id} item={item} onOpen={openPanel} onChange={() => void mutate()} />
            ))
          : Array.from({ length: SHOWN }, (_, index) => (
              <li key={index}>
                <Skeleton className="h-[7.75rem] rounded-md" />
              </li>
            ))}
      </ul>

      {active && (
        <LibraryPanel meta={active} initial={active} open={open} onOpenChange={setOpen} pageLink />
      )}
    </Panel>
  );
}

function UpNextCard({
  item,
  onOpen,
  onChange,
}: {
  item: ViewingHistoryItem;
  onOpen: (item: ViewingHistoryItem) => void;
  onChange: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const poster = getImageUrl(item.poster_path, "poster", "w185");
  const progress = item.progress;
  const next = progress?.next_episode;
  const badge = progress ? newEpisodesLabel(progress) : null;
  const percent =
    progress && progress.aired_episodes > 0 ? (progress.watched_episodes / progress.aired_episodes) * 100 : 0;
  const year = item.release_date ? new Date(item.release_date).getUTCFullYear() : null;

  const kind = item.media_type === "movie" ? "Film" : "Series";
  let kicker: string;
  let detail: string;
  if (item.status === "plan_to_watch") {
    kicker = "From your watchlist";
    detail = year ? `${kind} from ${year}` : kind;
  } else if (item.media_type === "movie") {
    kicker = "Keep watching";
    detail = year ? `Film from ${year}` : "Film";
  } else {
    kicker = badge ?? "Keep watching";
    detail = next ? `Up next: ${episodeLabel(next)}` : "Series";
  }

  const markNext = async () => {
    if (!next) return;
    setSaving(true);
    try {
      await setEpisodeWatched(item, next, true);
      onChange();
    } catch (error) {
      console.error("Error updating library:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="flex min-w-0 gap-3 rounded-md border border-line bg-surface-2 p-3">
      <button
        type="button"
        onClick={() => onOpen(item)}
        tabIndex={-1}
        aria-hidden="true"
        className="relative aspect-[2/3] w-16 shrink-0 self-start overflow-hidden rounded-sm border border-line bg-surface-3"
      >
        {poster ? (
          <Image src={poster} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Film className="size-4 text-ink-muted/50" aria-hidden="true" />
          </span>
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className={cn("text-2xs font-semibold", badge ? "text-mint" : "text-ink-muted")}>{kicker}</p>
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-haspopup="dialog"
          className="mt-0.5 truncate text-left font-medium text-ink hover:underline hover:underline-offset-4"
        >
          {item.title}
        </button>
        <p className="mt-0.5 truncate text-ui tabular-nums text-ink-muted">{detail}</p>

        <div className="mt-auto pt-2.5">
          {next && item.status !== "plan_to_watch" ? (
            <div className="flex items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <ProgressBar value={percent} className="flex-1" />
                {progress && progress.aired_episodes > 0 && (
                  <span className="shrink-0 text-2xs tabular-nums text-ink-muted">
                    {progress.watched_episodes}/{progress.aired_episodes}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant={badge ? "default" : "outline"}
                disabled={saving}
                onClick={markNext}
                className="shrink-0 px-3"
              >
                <Check className="size-3.5" weight="bold" aria-hidden="true" />
                <span className="sr-only">Mark </span>
                {episodeLabel(next)}
                <span className="sr-only"> of {item.title} watched</span>
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onOpen(item)} aria-haspopup="dialog">
              Details<span className="sr-only"> for {item.title}</span>
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
