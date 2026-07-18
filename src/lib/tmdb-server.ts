import "server-only";

const TMDB_ORIGIN = "https://api.themoviedb.org/3";

type TMDBFetchOptions = {
  params?: Record<string, string | number | boolean | undefined>;
  next?: NextFetchRequestConfig;
};

export async function fetchTMDBServer<T>(
  path: string,
  options: TMDBFetchOptions = {},
): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not configured");

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${TMDB_ORIGIN}${normalizedPath}`);
  url.searchParams.set("api_key", apiKey);

  for (const [key, value] of Object.entries(options.params || {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { next: options.next });
  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
