"use client";

import { useState } from "react";
import Link from "@/components/ui/app-link";
import { MediaGrid } from "@/components/shared/media-grid";
import type { MediaItem } from "@/components/shared/media-card";
import { Panel, panelLinkClass } from "@/components/ui/panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useAuth } from "@/components/providers/auth-provider";
import { useWatchedTitles } from "@/lib/hooks/use-library";

type Tab = "theaters" | "streaming" | "tv";

interface NewReleasesProps {
  theaters: MediaItem[];
  streaming: MediaItem[];
  tv: MediaItem[];
}

const TABS: { value: Tab; label: string; media: "movie" | "tv"; href?: string; hrefLabel?: string }[] = [
  { value: "theaters", label: "In theaters", media: "movie", href: "/movies/now-playing", hrefLabel: "All in theaters" },
  { value: "streaming", label: "On streaming", media: "movie" },
  { value: "tv", label: "New series", media: "tv", href: "/tv/on-the-air", hrefLabel: "All on the air" },
];

/** New releases in one panel: switch between theaters, streaming and new series. */
export function NewReleases({ theaters, streaming, tv }: NewReleasesProps) {
  const lists: Record<Tab, MediaItem[]> = { theaters, streaming, tv };
  const options = TABS.filter((tab) => lists[tab.value].length > 0);
  const [tab, setTab] = useState<Tab>(options[0]?.value ?? "theaters");
  const { user } = useAuth();
  const watched = useWatchedTitles(Boolean(user));

  const current = options.find((option) => option.value === tab);
  if (!current) return null;

  return (
    <Panel
      title="New releases"
      aside={
        current.href && (
          <Link href={current.href} className={panelLinkClass}>
            {current.hrefLabel}
          </Link>
        )
      }
    >
      <SegmentedControl
        label="Where it's new"
        size="sm"
        options={options.map(({ value, label }) => ({ value, label }))}
        value={tab}
        onChange={setTab}
        className="mb-4"
      />
      <MediaGrid
        key={tab}
        items={lists[tab].slice(0, 16)}
        mediaType={current.media}
        className="poster-grid-two-rows"
        watched={watched}
      />
    </Panel>
  );
}
