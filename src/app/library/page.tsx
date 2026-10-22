"use client";

import { useState } from "react";
import Link from "next/link";
import { mutate as seed } from "swr";
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ViewingHistoryItem } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { libraryItemKey, useLibrary } from "@/lib/hooks/use-library";
import { UpNextList } from "@/components/library/up-next-list";
import { LibraryTile } from "@/components/library/library-tile";
import { LibraryPanel } from "@/components/library/library-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Tab = "watching" | "plan_to_watch" | "completed";
type MediaFilter = "all" | "movie" | "tv";

const TABS: { value: Tab; label: string }[] = [
  { value: "watching", label: "Watching" },
  { value: "plan_to_watch", label: "Want to watch" },
  { value: "completed", label: "Watched" },
];

const MEDIA_FILTERS: { value: MediaFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Films" },
  { value: "tv", label: "TV" },
];

const EMPTY: Record<Tab, { title: string; description: string }> = {
  watching: {
    title: "Nothing in progress",
    description:
      "Mark an episode watched or set a film to Watching and it will wait for you here.",
  },
  plan_to_watch: {
    title: "Your watchlist is empty",
    description: "Choose Want to watch on any film or show to save it for later.",
  },
  completed: {
    title: "Nothing watched yet",
    description: "Films and shows you finish collect here, with your ratings.",
  },
};

// Show the search box once a list is long enough to need it.
const SEARCH_THRESHOLD = 12;

const time = (value: string | null | undefined) => (value ? Date.parse(value) : 0);

/** Which list an item belongs in. Finished shows with new episodes return to Watching. */
function tabOf(item: ViewingHistoryItem): Tab {
  if (item.status === "completed" && item.progress?.has_new) return "watching";
  return item.status;
}

function sortFor(tab: Tab) {
  return (a: ViewingHistoryItem, b: ViewingHistoryItem) => {
    if (tab === "watching") {
      const newer = Number(!!b.progress?.has_new) - Number(!!a.progress?.has_new);
      if (newer) return newer;
      return time(b.last_watched_at || b.updated_at) - time(a.last_watched_at || a.updated_at);
    }
    if (tab === "completed") {
      return time(b.completed_at || b.updated_at) - time(a.completed_at || a.updated_at);
    }
    return time(b.created_at) - time(a.created_at);
  };
}

function parseTab(value: string | null): Tab {
  return value === "plan_to_watch" || value === "completed" ? value : "watching";
}

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab") || searchParams.get("status"));
  const [media, setMedia] = useState<MediaFilter>("all");
  const [query, setQuery] = useState("");
  const { items, error, isLoading, mutate } = useLibrary(!!user);
  const [active, setActive] = useState<ViewingHistoryItem | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  if (!authLoading && !user) {
    redirect("/admin");
  }

  const selectTab = (next: Tab) => {
    setQuery("");
    router.replace(next === "watching" ? pathname : `${pathname}?tab=${next}`, {
      scroll: false,
    });
  };

  const refresh = () => void mutate();

  const openPanel = (item: ViewingHistoryItem) => {
    // The list row is current, so the panel can open without a request.
    void seed(libraryItemKey(item), { items: [item] }, { revalidate: false });
    setActive(item);
    setPanelOpen(true);
  };
  const all = items || [];
  const counts = { watching: 0, plan_to_watch: 0, completed: 0 } as Record<Tab, number>;
  for (const item of all) counts[tabOf(item)]++;

  const inTab = all.filter((item) => tabOf(item) === tab);
  const needle = query.trim().toLowerCase();
  const shown = inTab
    .filter((item) => media === "all" || item.media_type === media)
    .filter((item) => !needle || item.title.toLowerCase().includes(needle))
    .sort(sortFor(tab));
  const newCount = all.filter((item) => item.progress?.has_new).length;

  return (
    <div className="min-h-screen">
      <header className="page-header">
        <div className="site-container py-10 md:py-14">
          <h1 className="page-title">Library</h1>
          {newCount > 0 && (
            <p className="page-lede mt-4">
              {newCount === 1
                ? "1 show you follow has new episodes."
                : `${newCount} shows you follow have new episodes.`}
            </p>
          )}
          <nav aria-label="Library lists" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {TABS.map(({ value, label }) => {
                const current = value === tab;
                return (
                  <li key={value}>
                    <button
                      type="button"
                      onClick={() => selectTab(value)}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-2 rounded-sm border px-4 text-sm font-medium transition-colors",
                        current
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                      )}
                    >
                      {label}
                      {items && (
                        <span className={cn("tabular-nums", current ? "text-background/60" : "text-muted-foreground/70")}>
                          {counts[value]}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      <div className="site-container py-10 md:py-14">
        {inTab.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1" role="group" aria-label="Type">
              {MEDIA_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={media === value}
                  onClick={() => setMedia(value)}
                  className={cn(
                    "min-h-9 rounded-sm px-3 text-sm font-medium transition-colors",
                    media === value
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {inTab.length >= SEARCH_THRESHOLD && (
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by title"
                aria-label="Filter by title"
                className="h-9 w-full sm:w-64"
              />
            )}
          </div>
        )}

        {error && !items ? (
          <EmptyState title="Library didn't load" description="Check your connection, then try again.">
            <Button variant="outline" onClick={refresh}>
              Try again
            </Button>
          </EmptyState>
        ) : isLoading || authLoading || !items ? (
          <LibrarySkeleton tab={tab} />
        ) : inTab.length === 0 ? (
          <EmptyState {...EMPTY[tab]}>
            <Button asChild>
              <Link href="/">Go to Discover</Link>
            </Button>
          </EmptyState>
        ) : shown.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Nothing matches these filters.</p>
        ) : tab === "watching" ? (
          <UpNextList items={shown} onChange={refresh} onOpen={openPanel} />
        ) : (
          <div className="poster-grid">
            {shown.map((item) => (
              <LibraryTile key={item.id} item={item} onOpen={openPanel} />
            ))}
          </div>
        )}
      </div>

      {active && (
        <LibraryPanel
          meta={active}
          initial={active}
          open={panelOpen}
          onOpenChange={setPanelOpen}
          pageLink
        />
      )}
    </div>
  );
}

function LibrarySkeleton({ tab }: { tab: Tab }) {
  if (tab === "watching") {
    return (
      <div className="divide-y divide-border border-y border-border" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex gap-4 py-4">
            <Skeleton className="aspect-[2/3] w-16 sm:w-[4.5rem]" />
            <div className="flex-1 space-y-3 pt-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
              <Skeleton className="h-1 w-full max-w-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="poster-grid" aria-busy="true">
      {Array.from({ length: 16 }, (_, i) => (
        <Skeleton key={i} className="aspect-[2/3]" />
      ))}
    </div>
  );
}
