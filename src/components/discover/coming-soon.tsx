import Image from "next/image";
import Link from "@/components/ui/app-link";
import { Film } from "@/components/ui/icons";
import { Panel } from "@/components/ui/panel";
import { getImageUrl } from "@/lib/api";
import { GENRE_NAMES } from "@/lib/constants";
import type { Movie, TVShow } from "@/lib/types";

interface ComingSoonProps {
  movies: Movie[];
  shows: TVShow[];
}

interface Entry {
  key: string;
  href: string;
  title: string;
  date: string;
  posterPath: string | null;
  detail: string;
}

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const fullFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const weekdayFormat = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });

/** "Horror film", "Drama series"; just the kind when there's no genre. */
const kindPhrase = (genre: string | undefined, kind: "film" | "series") =>
  genre ? `${genre} ${kind}` : kind === "film" ? "Film" : "Series";

function firstGenre(media: "movie" | "tv", ids: number[]) {
  const names: Record<number, string> = GENRE_NAMES[media];
  return ids.map((id) => names[id]).find(Boolean);
}

/** Release dates ahead: films opening in US theaters and series premiering, side by side. */
export function ComingSoon({ movies, shows }: ComingSoonProps) {
  const columns = [
    {
      label: "In theaters",
      entries: movies.map<Entry>((movie) => ({
        key: `movie-${movie.id}`,
        href: `/movie/${movie.id}`,
        title: movie.title,
        date: movie.release_date,
        posterPath: movie.poster_path,
        detail: kindPhrase(firstGenre("movie", movie.genre_ids), "film"),
      })),
    },
    {
      label: "Series premieres",
      entries: shows.map<Entry>((show) => ({
        key: `tv-${show.id}`,
        href: `/tv/${show.id}`,
        title: show.name,
        date: show.first_air_date,
        posterPath: show.poster_path,
        detail: kindPhrase(firstGenre("tv", show.genre_ids), "series"),
      })),
    },
  ].filter((column) => column.entries.length > 0);

  if (!columns.length) return null;

  return (
    <Panel title="Coming soon" bodyClassName="grid gap-x-8 gap-y-6 p-4 sm:p-5 md:grid-cols-2">
      {columns.map((column) => (
        <section key={column.label} aria-label={column.label} className="min-w-0">
          <h3 className="text-ui font-semibold text-ink-muted">{column.label}</h3>
          <ol className="mt-2 divide-y divide-line">
            {column.entries.map((entry) => (
              <li key={entry.key}>
                <DatedRow entry={entry} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </Panel>
  );
}

function DatedRow({ entry }: { entry: Entry }) {
  const date = new Date(entry.date);
  const poster = entry.posterPath ? getImageUrl(entry.posterPath, "poster", "w185") : null;

  return (
    <Link
      href={entry.href}
      className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-surface-2 sm:gap-4"
    >
      {/* A tear-off calendar leaf: month over a large day number. */}
      <time
        dateTime={entry.date}
        className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-md border border-line bg-surface-2 transition-colors group-hover:border-violet/60"
      >
        <span aria-hidden="true" className="w-full bg-surface-3 py-0.5 text-center text-2xs font-semibold text-violet">
          {monthFormat.format(date)}
        </span>
        <span aria-hidden="true" className="pt-1 font-serif text-xl leading-none tabular-nums text-ink">
          {date.getUTCDate()}
        </span>
        <span aria-hidden="true" className="pb-1 text-2xs leading-4 text-ink-muted">
          {weekdayFormat.format(date)}
        </span>
        <span className="sr-only">{fullFormat.format(date)}</span>
      </time>
      <span className="relative aspect-[2/3] w-9 shrink-0 overflow-hidden rounded-sm border border-line bg-surface-2">
        {poster ? (
          <Image src={poster} alt="" fill sizes="36px" className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Film className="size-3.5 text-ink-muted/50" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{entry.title}</span>
        <span className="mt-0.5 block truncate text-ui text-ink-muted">{entry.detail}</span>
      </span>
    </Link>
  );
}
