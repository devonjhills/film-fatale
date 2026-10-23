"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { mutate as revalidate } from "swr";
import type { ViewingHistoryItem, WatchStatus } from "@/lib/types";
import { getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Check, ChevronDown, Clock, Film, Play, Star } from "@/components/ui/icons";
import { EpisodeTracker } from "@/components/tv/episode-tracker";
import { useAuth } from "@/components/providers/auth-provider";
import {
  removeLibraryItem,
  saveLibraryItem,
  useLibraryItem,
  type LibraryMeta,
} from "@/lib/hooks/use-library";
import { cn } from "@/lib/utils";

export const STATUS_LABELS: Record<WatchStatus, string> = {
  plan_to_watch: "Want to watch",
  watching: "Watching",
  completed: "Watched",
};

const STATUS_ORDER: WatchStatus[] = ["plan_to_watch", "watching", "completed"];
const STATUS_ICONS = { plan_to_watch: Clock, watching: Play, completed: Check };

const LIBRARY_KEY = "/api/viewing-history";
const episodesKey = (tmdbId: number) => `/api/episodes?tmdb_id=${tmdbId}`;

interface LibraryPanelProps {
  meta: LibraryMeta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The row from the library list, so opening the panel there costs no request. */
  initial?: ViewingHistoryItem;
  /** Show a link to the title's page (off when already on it). */
  pageLink?: boolean;
}

/**
 * Everything about one title in your library: list, episodes, rating,
 * notes. Changes save as you make them; the library list refreshes once,
 * when the panel closes.
 */
export function LibraryPanel({ meta, open, onOpenChange, initial, pageLink }: LibraryPanelProps) {
  const changed = useRef(false);

  const handleOpenChange = (next: boolean) => {
    if (!next && changed.current) {
      changed.current = false;
      void revalidate(LIBRARY_KEY);
    }
    onOpenChange(next);
  };

  const year = meta.release_date ? new Date(meta.release_date).getUTCFullYear() : null;
  const poster = getImageUrl(meta.poster_path, "poster", "w185");

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <header className="flex shrink-0 gap-4 border-b border-border p-5 pr-14">
          <div className="poster-frame relative aspect-[2/3] w-14 shrink-0 overflow-hidden">
            {poster ? (
              <Image src={poster} alt="" fill sizes="56px" className="object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center bg-muted">
                <Film className="size-5 text-muted-foreground/50" aria-hidden="true" />
              </span>
            )}
          </div>
          <div className="min-w-0 self-center">
            <SheetTitle className="line-clamp-2 font-serif text-2xl font-medium leading-tight">
              {meta.title}
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm text-muted-foreground">
              {meta.media_type === "tv" ? "TV" : "Film"}
              {year && `, ${year}`}
            </SheetDescription>
            {pageLink && (
              <Link
                href={`/${meta.media_type}/${meta.tmdb_id}`}
                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline hover:underline-offset-4"
              >
                Open page
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </header>

        {open && (
          <PanelBody meta={meta} initial={initial} onChange={() => (changed.current = true)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function PanelBody({
  meta,
  initial,
  onChange,
}: {
  meta: LibraryMeta;
  initial?: ViewingHistoryItem;
  onChange: () => void;
}) {
  const { item, mutate } = useLibraryItem(meta, true, initial);
  const [saving, setSaving] = useState(false);

  const save = async (changes: { status: WatchStatus; rating?: number | null; notes?: string | null }) => {
    if (saving) return;
    setSaving(true);
    try {
      const { item: saved } = await saveLibraryItem(meta, changes);
      await mutate({ items: [saved] }, { revalidate: false });
      // Marking a show watched fills its episodes.
      if (meta.media_type === "tv") void revalidate(episodesKey(meta.tmdb_id));
      onChange();
    } catch (error) {
      console.error("Error saving library item:", error);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const message =
      meta.media_type === "tv"
        ? `Remove ${meta.title} and its episode progress from your library?`
        : `Remove ${meta.title} from your library?`;
    if (!window.confirm(message)) return;
    setSaving(true);
    try {
      await removeLibraryItem(meta);
      await mutate({ items: [] }, { revalidate: false });
      if (meta.media_type === "tv") void revalidate(episodesKey(meta.tmdb_id));
      onChange();
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <section>
        <h3 className="text-sm font-medium">List</h3>
        <div className="mt-3 grid grid-cols-3 gap-1.5" role="group" aria-label="List">
          {STATUS_ORDER.map((status) => {
            const current = item?.status === status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={current}
                disabled={saving || item === undefined}
                onClick={() => !current && save({ status })}
                className={cn(
                  "flex min-h-11 items-center justify-center whitespace-nowrap rounded-sm border px-1.5 text-[0.8125rem] font-medium transition-colors disabled:opacity-60 sm:text-sm",
                  current
                    ? "border-primary bg-primary text-primary-foreground disabled:opacity-100"
                    : "border-input text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                )}
              >
                {STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>
      </section>

      {meta.media_type === "tv" && (
        <section>
          <h3 className="mb-3 text-sm font-medium">Episodes</h3>
          <EpisodeTracker show={meta} onChange={onChange} />
        </section>
      )}

      {item && (
        <>
          <RatingStars
            value={item.rating || 0}
            disabled={saving}
            onChange={(rating) => save({ status: item.status, rating: rating || null })}
          />

          <NotesField
            key={item.id}
            initial={item.notes || ""}
            disabled={saving}
            onSave={(notes) => save({ status: item.status, notes: notes || null })}
          />

          <div className="border-t border-border pt-5">
            <Button
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={remove}
              className="-ml-3.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Remove from library
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function RatingStars({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  // Hovering previews a rating before you pick it.
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-medium">Your rating</h3>
        <span className="text-sm tabular-nums text-muted-foreground">
          {shown > 0 ? `${shown}/10` : "Not rated"}
        </span>
      </div>
      <div
        className="mt-3 grid grid-cols-10"
        role="group"
        aria-label="Your rating"
        onMouseLeave={() => setHover(0)}
      >
        {Array.from({ length: 10 }, (_, i) => {
          const star = i + 1;
          const filled = star <= shown;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => onChange(value === star ? 0 : star)}
              onMouseEnter={() => setHover(star)}
              aria-label={`${star} out of 10`}
              aria-pressed={value === star}
              className="flex h-10 items-center justify-center rounded-sm transition-colors disabled:opacity-60"
            >
              <Star
                weight={filled ? "fill" : "regular"}
                className={cn(
                  "size-5 transition-colors",
                  filled ? "text-foreground" : "text-muted-foreground/70",
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Saves when you leave the field, if anything changed. */
function NotesField({
  initial,
  disabled,
  onSave,
}: {
  initial: string;
  disabled: boolean;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(initial);

  const commit = () => {
    const next = notes.trim();
    if (next !== initial.trim()) onSave(next);
  };

  return (
    <section>
      <label htmlFor="library-notes" className="text-sm font-medium">
        Notes
      </label>
      <Textarea
        id="library-notes"
        value={notes}
        disabled={disabled}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={commit}
        rows={3}
        placeholder="Anything to remember"
        className="mt-3"
      />
      <p className="mt-2 text-xs text-muted-foreground">Saves when you leave the field.</p>
    </section>
  );
}

/** The hero button on detail pages: shows your list, opens the library panel. */
export function LibraryButton({ meta, size = "default" }: { meta: LibraryMeta; size?: "sm" | "default" | "lg" }) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const { item } = useLibraryItem(meta, !!user);

  if (loading || !user) return null;

  const Icon = item ? STATUS_ICONS[item.status] : Clock;
  return (
    <>
      <Button
        variant={item ? "secondary" : "outline"}
        size={size}
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Icon className={cn("size-4", item?.status === "completed" && "text-mint")} weight="bold" aria-hidden="true" />
        {item ? STATUS_LABELS[item.status] : "Add to library"}
        <ChevronDown className="size-3" aria-hidden="true" />
      </Button>
      <LibraryPanel meta={meta} open={open} onOpenChange={setOpen} />
    </>
  );
}
