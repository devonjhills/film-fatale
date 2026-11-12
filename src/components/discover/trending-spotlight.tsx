import Image from "next/image";
import Link from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Film, Star } from "@/components/ui/icons";
import { MetaLine } from "@/components/ui/meta-line";
import { Panel, PanelNote } from "@/components/ui/panel";
import { getImageUrl } from "@/lib/api";
import { GENRE_NAMES } from "@/lib/constants";
import type { TrendingItem } from "@/lib/data-fetching";
import { formatVoteAverage } from "@/lib/utils";

const titleOf = (item: TrendingItem) => (item.media_type === "movie" ? item.title : item.name);
const dateOf = (item: TrendingItem) =>
  item.media_type === "movie" ? item.release_date : item.first_air_date;
const yearOf = (item: TrendingItem) => {
  const date = dateOf(item);
  return date ? new Date(date).getUTCFullYear() : null;
};
const kindOf = (item: TrendingItem) => (item.media_type === "movie" ? "Film" : "Series");
const hrefOf = (item: TrendingItem) => `/${item.media_type}/${item.id}`;

/** "Horror film", "Drama series": the main genre and the kind of title, as a phrase. */
function describe(item: TrendingItem) {
  const genre = genreNames(item, 1)[0];
  const kind = item.media_type === "movie" ? "film" : "series";
  return genre ? `${genre} ${kind}` : kindOf(item);
}

function genreNames(item: TrendingItem, limit: number) {
  const names: Record<number, string> = GENRE_NAMES[item.media_type];
  return item.genre_ids
    .map((id) => names[id])
    .filter(Boolean)
    .slice(0, limit);
}

/**
 * Discover's lead: today's most-talked-about title with its backdrop, beside
 * a ranked list of the next six. Films and series together.
 */
export function TrendingSpotlight({ items }: { items: TrendingItem[] }) {
  const lead = items.find((item) => item.backdrop_path) ?? items[0];
  if (!lead) return null;
  const rest = items.filter((item) => item !== lead).slice(0, 6);
  const backdrop = lead.backdrop_path ? getImageUrl(lead.backdrop_path, "backdrop", "w1280") : null;
  const year = yearOf(lead);

  return (
    <Panel
      title="Trending today"
      aside={<PanelNote>Films and series</PanelNote>}
      bodyClassName="grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-8"
    >
      <article className="min-w-0">
        {backdrop && (
          <Link
            href={hrefOf(lead)}
            tabIndex={-1}
            aria-hidden="true"
            className="relative block aspect-video overflow-hidden rounded-md border border-line bg-surface-2"
          >
            <Image
              src={backdrop}
              alt=""
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 820px"
              className="object-cover"
            />
            <span className="absolute left-3 top-3 inline-flex h-7 items-center rounded-full bg-violet px-2.5 text-xs font-semibold text-page">
              No. 1 today
            </span>
          </Link>
        )}

        <MetaLine
          className="mt-5"
          items={[
            lead.vote_average > 0 && (
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <Star className="size-3.5 text-violet" weight="fill" aria-hidden="true" />
                <span className="sr-only">Rated </span>
                {formatVoteAverage(lead.vote_average)}
              </span>
            ),
            kindOf(lead),
            year,
            genreNames(lead, 2).join(", "),
          ]}
        />
        <h2 className="hero-title mt-2">
          <Link href={hrefOf(lead)} className="hover:underline hover:decoration-line-strong hover:underline-offset-8">
            {titleOf(lead)}
          </Link>
        </h2>
        {lead.overview && <p className="reading-text mt-3 line-clamp-3 max-w-[62ch]">{lead.overview}</p>}
        <Button asChild size="lg" className="mt-5">
          <Link href={hrefOf(lead)}>
            View {lead.media_type === "movie" ? "film" : "series"}
            <span className="sr-only">: {titleOf(lead)}</span>
          </Link>
        </Button>
      </article>

      {rest.length > 0 && (
        <ol aria-label="Also trending" className="-my-1 flex min-w-0 flex-col divide-y divide-line">
          {rest.map((item, index) => (
            <li key={`${item.media_type}-${item.id}`} className="flex-1">
              <RankedRow item={item} rank={index + 2} />
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function RankedRow({ item, rank }: { item: TrendingItem; rank: number }) {
  const poster = item.poster_path ? getImageUrl(item.poster_path, "poster", "w185") : null;
  const year = yearOf(item);

  return (
    <Link
      href={hrefOf(item)}
      className="group -mx-2 flex h-full items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-surface-2 sm:gap-4"
    >
      <span
        aria-hidden="true"
        className="w-7 shrink-0 text-center font-serif text-[1.75rem] leading-none tabular-nums text-ink-muted transition-colors group-hover:text-violet"
      >
        {rank}
      </span>
      <span className="relative aspect-[2/3] w-11 shrink-0 overflow-hidden rounded-sm border border-line bg-surface-2">
        {poster ? (
          <Image src={poster} alt="" fill sizes="44px" className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Film className="size-4 text-ink-muted/50" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="sr-only">Number {rank}: </span>
        <span className="block truncate font-medium text-ink">{titleOf(item)}</span>
        <span className="mt-0.5 block truncate text-ui text-ink-muted">{describe(item)}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5 text-right tabular-nums">
        {item.vote_average > 0 && (
          <span className="inline-flex items-center gap-1 text-ui font-medium text-ink">
            <Star className="size-3 text-violet" weight="fill" aria-hidden="true" />
            <span className="sr-only">Rated </span>
            {formatVoteAverage(item.vote_average)}
          </span>
        )}
        {year && <span className="text-ui text-ink-muted">{year}</span>}
      </span>
    </Link>
  );
}
