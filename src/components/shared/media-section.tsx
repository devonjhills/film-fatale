import Link from "next/link";
import { MediaGrid } from "./media-grid";
import { Section } from "./section";
import type { MediaItem } from "./media-card";

interface MediaSectionProps {
  title: string;
  items: MediaItem[];
  mediaType: "movie" | "tv";
  href?: string;
}

/** A titled shelf: one full row of posters (two on small screens). */
export function MediaSection({ title, items, mediaType, href }: MediaSectionProps) {
  if (!items.length) return null;

  return (
    <Section
      title={title}
      action={
        href && (
          <Link
            href={href}
            className="-my-3 flex min-h-11 shrink-0 items-center text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            See all
            <span className="sr-only"> {title.toLowerCase()}</span>
          </Link>
        )
      }
    >
      <MediaGrid items={items.slice(0, 8)} mediaType={mediaType} className="poster-grid-shelf" />
    </Section>
  );
}
