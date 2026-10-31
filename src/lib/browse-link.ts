import { GENRE_NAMES } from "./constants";

/**
 * A link into the top rated list filtered to a title's main genre and
 * decade, e.g. "More sci-fi from the 1980s". Null when either is missing.
 */
export function similarListLink(
  media: "movie" | "tv",
  genres: { id: number }[] | undefined,
  date: string | undefined | null,
) {
  const names: Record<number, string> = GENRE_NAMES[media];
  const genre = genres?.find((candidate) => candidate.id in names);
  const year = date ? new Date(date).getUTCFullYear() : NaN;
  if (!genre || !Number.isFinite(year) || year < 1920) return null;
  const decade = Math.floor(year / 10) * 10;
  const base = media === "movie" ? "/movies/top-rated" : "/tv/top-rated";
  return {
    href: `${base}?genre=${genre.id}&decade=${decade}`,
    label: `More ${names[genre.id].toLowerCase()} from the ${decade}s`,
  };
}
