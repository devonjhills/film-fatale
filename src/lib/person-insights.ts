import type { CombinedCredits, PersonDetails } from "./types";

/**
 * Reads a person's combined credits to answer "where do I know them from?":
 * their best-known titles, a summary of their career, a decade-by-decade
 * timeline and the genres they work in most.
 */

export type Credit = CombinedCredits["cast"][number] & {
  /** Character(s) for actors; job(s) for everyone else. */
  role: string;
  episode_count?: number;
  /** For TV, when this person first appeared (not when the show began). */
  first_credit_air_date?: string;
  /** Playing themselves, archive footage, talk and award shows: not a role. */
  appearance?: boolean;
};

// Talk shows and news: appearances, not roles.
const APPEARANCE_GENRES = new Set([10763, 10767]);
const DOCUMENTARY = 99;
const SELF_ROLE = /\b(self|himself|herself|themselves)\b|\barchive footage\b/i;
const UNCREDITED = /\(uncredited\)/i;
// Documentaries are only roles when someone plays a character in them.
const DOCUMENTARY_APPEARANCE = /^$|\bnarrator\b|\bhost\b|\binterviewee\b/i;

// Movie and TV genre ids folded into one vocabulary, in sentence case.
const GENRE_LABELS: Record<number, string> = {
  28: "action & adventure",
  12: "action & adventure",
  10759: "action & adventure",
  878: "sci-fi & fantasy",
  14: "sci-fi & fantasy",
  10765: "sci-fi & fantasy",
  16: "animation",
  35: "comedy",
  80: "crime",
  99: "documentary",
  18: "drama",
  10751: "family",
  10762: "family",
  36: "history",
  27: "horror",
  10402: "music",
  9648: "mystery",
  10749: "romance",
  53: "thriller",
  10752: "war",
  10768: "war",
  37: "western",
  10764: "reality",
  10766: "soap",
};

// What someone in each department does, for the summary sentence.
const DEPARTMENT_VERBS: Record<string, string> = {
  Acting: "acted in",
  Directing: "directed",
  Writing: "written",
  Production: "produced",
  Editing: "edited",
  Camera: "shot",
  Sound: "scored",
};

const creditDate = (credit: Pick<Credit, "release_date" | "first_air_date" | "first_credit_air_date">) =>
  credit.first_credit_air_date || credit.release_date || credit.first_air_date;

export const creditYear = (credit: Pick<Credit, "release_date" | "first_air_date" | "first_credit_air_date">) => {
  const date = creditDate(credit);
  return date ? new Date(date).getUTCFullYear() : null;
};

export const creditLabel = (credit: Credit) => credit.title || credit.name || "Untitled";

const isAppearance = (credit: Credit, name: string) =>
  SELF_ROLE.test(credit.role) ||
  credit.role.trim() === name ||
  Boolean(credit.genre_ids?.some((genre) => APPEARANCE_GENRES.has(genre))) ||
  Boolean(credit.genre_ids?.includes(DOCUMENTARY) && DOCUMENTARY_APPEARANCE.test(credit.role.trim()));

const isReleased = (credit: Credit, now: number) => {
  const date = creditDate(credit);
  return date ? new Date(date).getTime() <= now : false;
};

/**
 * How much a credit says "this is where you know them from": lead roles and
 * long TV runs count fully, bit parts and guest spots barely.
 */
function billingWeight(credit: Credit, isActor: boolean) {
  if (!isActor) return 1;
  if (UNCREDITED.test(credit.role)) return 0.15;
  if (credit.media_type === "tv") {
    const episodes = credit.episode_count ?? 0;
    return episodes >= 10 ? 1 : episodes >= 3 ? 0.5 : 0.15;
  }
  if (credit.order === undefined) return 0.5;
  return credit.order <= 3 ? 1 : credit.order <= 10 ? 0.6 : 0.3;
}

/**
 * How much a credit says about someone's career: its billing, scaled by how
 * widely seen the title is, so a lead in an unseen short counts for little.
 */
const notability = (credit: Credit) => 1 + Math.log1p(credit.vote_count || 0);

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

const listJoin = (items: string[]) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export interface DecadeSummary {
  decade: number;
  movies: number;
  shows: number;
  top: Credit[];
}

export interface GenreShare {
  label: string;
  count: number;
  share: number;
}

export interface CareerInsights {
  isActor: boolean;
  /** Every credit, one row per title, newest first. */
  filmography: Credit[];
  knownFor: Credit[];
  summary: string | null;
  decades: DecadeSummary[];
  genres: GenreShare[];
  highestRated: Credit | null;
  longestRunning: Credit | null;
  next: Credit | null;
}

export function analyzeCareer(person: PersonDetails, now = Date.now()): CareerInsights {
  const department = person.known_for_department || "Acting";
  const isActor = department === "Acting";

  // Actors are listed by role; directors, writers etc. by their main job.
  const raw: Credit[] = isActor
    ? (person.combined_credits?.cast || []).map((credit) => ({ ...credit, role: credit.character }))
    : (person.combined_credits?.crew || [])
        .filter((credit) => credit.department === department)
        .map((credit) => ({ ...credit, character: "", role: credit.job }));

  // One row per title, with every role on it combined.
  const byTitle = new Map<string, Credit>();
  for (const credit of raw) {
    const key = `${credit.media_type}-${credit.id}`;
    const existing = byTitle.get(key);
    if (!existing) {
      byTitle.set(key, { ...credit });
    } else {
      if (credit.role && !existing.role.includes(credit.role)) {
        existing.role = existing.role ? `${existing.role}, ${credit.role}` : credit.role;
      }
      if (credit.order !== undefined && (existing.order === undefined || credit.order < existing.order)) {
        existing.order = credit.order;
      }
      existing.episode_count = Math.max(existing.episode_count ?? 0, credit.episode_count ?? 0) || undefined;
    }
  }
  const titles = [...byTitle.values()].map((credit) => ({
    ...credit,
    appearance: isAppearance(credit, person.name),
  }));

  // Newest first; undated titles are unconfirmed projects, so they go last.
  const filmography = [...titles].sort((a, b) => {
    const yearA = creditYear(a) ?? -Infinity;
    const yearB = creditYear(b) ?? -Infinity;
    return yearB - yearA || (b.popularity || 0) - (a.popularity || 0);
  });

  const work = titles.filter((credit) => !credit.appearance);
  const released = work.filter((credit) => isReleased(credit, now));
  const score = (credit: Credit) => ((credit.vote_count || 0) + 1) * billingWeight(credit, isActor);
  const byScore = (a: Credit, b: Credit) => score(b) - score(a);

  const knownFor = released
    .filter((credit) => credit.poster_path)
    .sort(byScore)
    .slice(0, 8);

  // Decades, oldest first, so the timeline reads as a career.
  const decadeMap = new Map<number, Credit[]>();
  for (const credit of released) {
    const year = creditYear(credit);
    if (year === null) continue;
    const decade = Math.floor(year / 10) * 10;
    decadeMap.set(decade, [...(decadeMap.get(decade) ?? []), credit]);
  }
  const decades = [...decadeMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([decade, credits]) => ({
      decade,
      movies: credits.filter((credit) => credit.media_type === "movie").length,
      shows: credits.filter((credit) => credit.media_type === "tv").length,
      top: credits
        .filter((credit) => credit.poster_path)
        .sort(byScore)
        .slice(0, 4),
    }));

  // Genres, counted once per title. Minor roles and little-seen titles count
  // less, so a career of lead dramas isn't outweighed by cameos in comedies.
  const genreWeights = new Map<string, number>();
  const genreCounts = new Map<string, number>();
  let weightedTitles = 0;
  for (const credit of released) {
    const labels = new Set(
      (credit.genre_ids ?? []).map((id) => GENRE_LABELS[id]).filter(Boolean),
    );
    if (!labels.size) continue;
    const weight = billingWeight(credit, isActor) * notability(credit);
    weightedTitles += weight;
    for (const label of labels) {
      genreWeights.set(label, (genreWeights.get(label) ?? 0) + weight);
      genreCounts.set(label, (genreCounts.get(label) ?? 0) + 1);
    }
  }
  const genres = [...genreWeights.entries()]
    .map(([label, weight]) => ({
      label,
      count: genreCounts.get(label) ?? 0,
      share: weightedTitles ? weight / weightedTitles : 0,
    }))
    .sort((a, b) => b.share - a.share)
    .slice(0, 6);

  const wellKnown = (minimum: number) => released.filter((credit) => (credit.vote_count || 0) >= minimum);
  const ratedPool = wellKnown(300).length ? wellKnown(300) : wellKnown(50);
  const highestRated =
    [...ratedPool].sort((a, b) => b.vote_average - a.vote_average)[0] ?? null;

  const longestRunning = isActor
    ? (work
        .filter((credit) => credit.media_type === "tv" && (credit.episode_count ?? 0) >= 10)
        .sort((a, b) => (b.episode_count ?? 0) - (a.episode_count ?? 0))[0] ?? null)
    : null;

  const next =
    work
      .filter((credit) => !isReleased(credit, now) && creditDate(credit))
      .sort((a, b) => (creditYear(a) ?? 0) - (creditYear(b) ?? 0) || score(b) - score(a))[0] ?? null;

  return {
    isActor,
    filmography,
    knownFor,
    summary: summarize(person, department, isActor, released, genres),
    decades,
    genres,
    highestRated,
    longestRunning,
    next,
  };
}

function summarize(
  person: PersonDetails,
  department: string,
  isActor: boolean,
  released: Credit[],
  genres: GenreShare[],
) {
  if (!released.length) return null;

  const movies = released.filter((credit) => credit.media_type === "movie").length;
  const shows = released.length - movies;
  const counts = listJoin(
    [movies && plural(movies, "movie"), shows && plural(shows, "TV show")].filter(Boolean) as string[],
  );
  const years = released.map(creditYear).filter((year): year is number => year !== null);
  const first = Math.min(...years);
  const last = Math.max(...years);
  const span = person.deathday ? `between ${first} and ${last}` : `since ${first}`;
  const verb = DEPARTMENT_VERBS[department] ?? "worked on";

  const sentences = [`${person.name} has ${verb} ${counts} ${span}.`];

  const leading = genres.filter((genre) => genre.share >= 0.2).slice(0, 2).map((genre) => genre.label);
  let style = "";
  if (isActor) {
    const voiced = released.filter((credit) => /\(voice\)/i.test(credit.role)).length;
    const billed = released.filter((credit) => credit.media_type === "movie" && credit.order !== undefined);
    // Weighted by notability: leads in films nobody saw don't make a lead actor.
    const total = billed.reduce((sum, credit) => sum + notability(credit), 0);
    const leads = billed
      .filter((credit) => (credit.order ?? 99) <= 2 && !UNCREDITED.test(credit.role))
      .reduce((sum, credit) => sum + notability(credit), 0);
    const leadShare = total ? leads / total : 0;
    style =
      voiced / released.length >= 0.4
        ? "often as a voice actor"
        : leadShare >= 0.5
          ? "usually in the lead"
          : leadShare >= 0.25
            ? "often in the lead"
            : billed.length >= 5
              ? "usually in supporting roles"
              : "";
  }
  if (leading.length && style) sentences.push(`Mostly ${listJoin(leading)}, ${style}.`);
  else if (leading.length) sentences.push(`Mostly ${listJoin(leading)}.`);
  else if (style) sentences.push(`${style[0].toUpperCase()}${style.slice(1)}.`);

  return sentences.join(" ");
}
