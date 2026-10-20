import Image from "next/image";
import Link from "next/link";
import type { ViewingHistoryItem } from "@/lib/types";
import { getImageUrl } from "@/lib/api";
import { Film, Star } from "@/components/ui/icons";
import { ItemMenu } from "./item-menu";
import { newEpisodesLabel } from "./progress";

interface LibraryTileProps {
  item: ViewingHistoryItem;
  onChange: () => void;
}

/** A poster tile with your rating and a menu for moving it between lists. */
export function LibraryTile({ item, onChange }: LibraryTileProps) {
  const poster = getImageUrl(item.poster_path, "poster", "w342");
  const year = item.release_date ? new Date(item.release_date).getUTCFullYear() : null;
  const badge = item.progress ? newEpisodesLabel(item.progress) : null;

  return (
    <article className="group relative min-w-0">
      <Link href={`/${item.media_type}/${item.tmdb_id}`} className="poster-card">
        <div className="poster-card-art">
          {poster ? (
            <Image src={poster} alt="" fill sizes="(max-width: 639px) 33vw, 180px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Film className="size-7 text-muted-foreground/50" aria-hidden="true" />
            </div>
          )}
          {badge && (
            <span className="absolute bottom-2 left-2 rounded-sm bg-mint px-1.5 py-0.5 text-xs font-semibold tabular-nums text-background">
              {badge}
            </span>
          )}
        </div>
        <div className="poster-card-body">
          <h3 className="line-clamp-2 min-h-[2.75em] pr-1 text-[0.8125rem] font-medium leading-snug text-foreground group-hover:underline group-hover:underline-offset-4">
            {item.title}
          </h3>
          <p className="mt-auto flex items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
            <span>
              {item.media_type === "tv" ? "TV" : "Film"}
              {year && `, ${year}`}
            </span>
            {item.rating && (
              <span className="inline-flex items-center gap-1 text-foreground">
                <Star className="size-3" weight="fill" aria-hidden="true" />
                <span className="sr-only">Your rating </span>
                {item.rating}
              </span>
            )}
          </p>
        </div>
      </Link>
      <ItemMenu
        item={item}
        onChange={onChange}
        className="absolute right-1.5 top-1.5 bg-black/70 text-white hover:bg-black/85 hover:text-white"
      />
    </article>
  );
}
