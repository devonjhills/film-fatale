import "server-only";

import { API_CONFIG } from "./constants";
import { fetchTMDBServer } from "./tmdb-server";
import type { CombinedCredits, Movie, MovieDetails, TVShowDetails } from "./types";

/**
 * "If you like this" shelves beyond TMDB's recommendations: the rest of a
 * movie's series, more from its director or a show's creator, and more with
 * its lead. Each costs one cached TMDB request, fetched in parallel.
 */

export interface RelatedItem {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface RelatedShelf {
  key: string;
  title: string;
  /** Person or collection the shelf is built around, for a "See all" link. */
  href?: string;
  items: RelatedItem[];
}

const SHELF_SIZE = 8;
const DAY = 86400;

// Talk shows and news are appearances, not roles.
const APPEARANCE_GENRES = new Set([10763, 10767]);
const SELF_ROLE = /\b(self|himself|herself|themselves)\b/i;
// Crew jobs that mean someone shaped the work, for a creator's other titles.
const AUTHOR_JOBS = new Set(["Creator", "Director", "Writer", "Screenplay", "Teleplay", "Novel"]);

type PersonCredit = (CombinedCredits["cast"][number] | CombinedCredits["crew"][number]) & {
  character?: string;
  order?: number;
  job?: string;
  episode_count?: number;
};

async function fetchOrNull<T>(path: string): Promise<T | null> {
  try {
    return await fetchTMDBServer<T>(path, {
      params: { language: API_CONFIG.language },
      next: { revalidate: DAY },
    });
  } catch {
    return null;
  }
}

const toItem = (credit: PersonCredit | (Movie & { media_type?: "movie" })): RelatedItem => ({
  id: credit.id,
  media_type: credit.media_type ?? "movie",
  title: credit.title,
  name: "name" in credit ? credit.name : undefined,
  poster_path: credit.poster_path,
  vote_average: credit.vote_average,
  release_date: credit.release_date,
  first_air_date: "first_air_date" in credit ? credit.first_air_date : undefined,
});

/** Best-known titles first; one entry per title; nothing already shown. */
function pick(credits: PersonCredit[], exclude: Set<string>, minimum = 2) {
  const seen = new Set(exclude);
  const items = credits
    .filter((credit) => credit.poster_path)
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .filter((credit) => {
      const key = `${credit.media_type}-${credit.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, SHELF_SIZE)
    .map(toItem);
  for (const item of items) exclude.add(`${item.media_type}-${item.id}`);
  return items.length >= minimum ? items : [];
}

/** Credits where the person had a real part: billed high, or a long TV run. */
const isMajorRole = (credit: PersonCredit) =>
  !SELF_ROLE.test(credit.character ?? "") &&
  !credit.genre_ids?.some((genre) => APPEARANCE_GENRES.has(genre)) &&
  (credit.media_type === "tv" ? (credit.episode_count ?? 0) >= 6 : (credit.order ?? 99) <= 4);

const personCredits = (person: { id: number } | undefined) =>
  person ? fetchOrNull<CombinedCredits>(`/person/${person.id}/combined_credits`) : null;

function starShelf(
  star: { id: number; name: string } | undefined,
  credits: CombinedCredits | null,
  exclude: Set<string>,
): RelatedShelf | null {
  if (!star || !credits) return null;
  const items = pick(credits.cast.filter(isMajorRole), exclude, 3);
  return items.length
    ? { key: "star", title: `More with ${star.name}`, href: `/person/${star.id}`, items }
    : null;
}

export async function fetchMovieRelated(movie: MovieDetails): Promise<RelatedShelf[]> {
  const exclude = new Set([`movie-${movie.id}`]);
  const director = movie.credits?.crew?.find((person) => person.job === "Director");
  const star = movie.credits?.cast?.[0];

  const [collection, directorCredits, starCredits] = await Promise.all([
    movie.belongs_to_collection
      ? fetchOrNull<{ name: string; parts: Movie[] }>(`/collection/${movie.belongs_to_collection.id}`)
      : null,
    personCredits(director),
    personCredits(star),
  ]);

  const shelves: (RelatedShelf | null)[] = [];

  if (collection?.parts?.length) {
    // In release order, so the series reads start to finish.
    const parts = collection.parts
      .filter((part) => part.id !== movie.id && part.poster_path)
      .sort((a, b) => (a.release_date || "9999").localeCompare(b.release_date || "9999"))
      .map((part) => toItem({ ...part, media_type: "movie" }));
    for (const part of parts) exclude.add(`movie-${part.id}`);
    shelves.push(parts.length ? { key: "collection", title: collection.name, items: parts } : null);
  }

  if (director && directorCredits) {
    const directed = directorCredits.crew.filter((credit) => credit.job === "Director");
    const items = pick(directed, exclude);
    shelves.push(
      items.length
        ? { key: "director", title: `More from ${director.name}`, href: `/person/${director.id}`, items }
        : null,
    );
  }

  // The star shelf comes last so it skips titles the others already show.
  shelves.push(starShelf(star, starCredits, exclude));
  return shelves.filter((shelf): shelf is RelatedShelf => shelf !== null);
}

export async function fetchTVRelated(show: TVShowDetails): Promise<RelatedShelf[]> {
  const exclude = new Set([`tv-${show.id}`]);
  const creator = show.created_by?.[0];
  const star = show.aggregate_credits?.cast?.[0] ?? show.credits?.cast?.[0];

  const [creatorCredits, starCredits] = await Promise.all([
    personCredits(creator),
    personCredits(star),
  ]);

  const shelves: (RelatedShelf | null)[] = [];
  if (creator && creatorCredits) {
    const authored = creatorCredits.crew.filter(
      (credit) => credit.job && AUTHOR_JOBS.has(credit.job),
    );
    const items = pick(authored, exclude);
    shelves.push(
      items.length
        ? { key: "creator", title: `More from ${creator.name}`, href: `/person/${creator.id}`, items }
        : null,
    );
  }
  shelves.push(starShelf(star, starCredits, exclude));
  return shelves.filter((shelf): shelf is RelatedShelf => shelf !== null);
}
