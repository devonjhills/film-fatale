import Link from "@/components/ui/app-link";
import { MediaGrid } from "./media-grid";
import { Panel, panelLinkClass } from "@/components/ui/panel";
import type { MediaItem } from "./media-card";

interface MediaSectionProps {
  title: string;
  items: MediaItem[];
  mediaType: "movie" | "tv";
  href?: string;
  /** Link text for href; "See all" by default. */
  hrefLabel?: string;
  /** Two rows instead of one, for the shelf a page leads with. */
  tall?: boolean;
  watched?: Set<string>;
}

/** A titled shelf: one full row of posters (two on small screens), or two rows when tall. */
export function MediaSection({
  title,
  items,
  mediaType,
  href,
  hrefLabel = "See all",
  tall = false,
  watched,
}: MediaSectionProps) {
  if (!items.length) return null;
  // Two rows only when there are enough titles to fill both at every width.
  const twoRows = tall && items.length >= 16;

  return (
    <Panel
      title={title}
      aside={
        href && (
          <Link href={href} className={panelLinkClass}>
            {hrefLabel}
            {hrefLabel === "See all" && <span className="sr-only"> {title.toLowerCase()}</span>}
          </Link>
        )
      }
    >
      <MediaGrid
        items={items.slice(0, twoRows ? 16 : 8)}
        mediaType={mediaType}
        className={twoRows ? "poster-grid-two-rows" : "poster-grid-shelf"}
        watched={watched}
      />
    </Panel>
  );
}
