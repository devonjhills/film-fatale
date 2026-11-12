import Image from "next/image";
import Link from "@/components/ui/app-link";
import { Check, Film } from "@/components/ui/icons";
import { getImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface SeriesStripItem {
  key: string;
  href: string;
  title: string;
  /** Year, episode count or similar. */
  detail?: string | null;
  posterPath: string | null;
  /** The page being viewed; shown in place, not linked. */
  current?: boolean;
  watched?: boolean;
}

/**
 * A series in order (a film collection, a show's seasons) as one row of small
 * poster-and-title entries that scrolls sideways, so a long run never takes
 * over the page.
 */
const entry =
  "flex h-full items-center gap-3 rounded-md border bg-surface-2 p-2 transition-colors";

export function SeriesStrip({ items, label }: { items: SeriesStripItem[]; label: string }) {
  return (
    <ol
      aria-label={label}
      className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:thin] sm:-mx-4 sm:px-4"
    >
      {items.map((item) => {
        const posterUrl = getImageUrl(item.posterPath, "poster", "w154");
        const content = (
          <>
            <span className="relative flex aspect-[2/3] w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-surface-3">
              {posterUrl ? (
                <Image src={posterUrl} alt="" fill sizes="44px" className="object-cover" />
              ) : (
                <Film className="size-4 text-ink-muted/50" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0">
              <span className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</span>
              <span className="flex items-center gap-1 text-xs tabular-nums text-ink-muted">
                {item.current ? "You're here" : item.detail}
                {item.watched && (
                  <span className="inline-flex items-center gap-0.5 text-mint">
                    <Check className="size-3" weight="bold" aria-hidden="true" />
                    <span className="sr-only">Watched</span>
                  </span>
                )}
              </span>
            </span>
          </>
        );
        return (
          <li key={item.key} className="w-48 shrink-0">
            {item.current ? (
              <div aria-current="page" className={cn(entry, "border-violet")}>
                {content}
              </div>
            ) : (
              <Link href={item.href} className={cn(entry, "border-line hover:border-line-strong hover:bg-surface-3")}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
