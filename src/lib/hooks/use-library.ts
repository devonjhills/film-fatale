"use client";

import useSWR from "swr";
import type {
  ShowProgress,
  ViewingHistoryItem,
  WatchStatus,
  WatchedEpisode,
} from "@/lib/types";

const LIBRARY_KEY = "/api/viewing-history";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json() as Promise<T>;
}

export type LibraryMeta = Pick<
  ViewingHistoryItem,
  "tmdb_id" | "media_type" | "title" | "poster_path" | "overview" | "release_date" | "vote_average"
>;

export function saveLibraryItem(
  item: LibraryMeta,
  changes: { status: WatchStatus; rating?: number | null; notes?: string | null },
) {
  return request<{ item: ViewingHistoryItem }>(LIBRARY_KEY, {
    method: "POST",
    body: JSON.stringify({
      tmdb_id: item.tmdb_id,
      media_type: item.media_type,
      title: item.title,
      poster_path: item.poster_path,
      overview: item.overview || "",
      release_date: item.release_date || "",
      vote_average: item.vote_average || 0,
      ...changes,
    }),
  });
}

export function removeLibraryItem(item: Pick<ViewingHistoryItem, "tmdb_id" | "media_type">) {
  return request(`${LIBRARY_KEY}?tmdb_id=${item.tmdb_id}&media_type=${item.media_type}`, {
    method: "DELETE",
  });
}

export type EpisodeState = { episodes: WatchedEpisode[]; progress: ShowProgress };

/**
 * Mark an episode (and every aired one before it) watched, or unmark it.
 * Leave out episode_number to act on a whole season.
 */
export function setEpisodeWatched(
  show: LibraryMeta,
  target: { season_number: number; episode_number?: number },
  watched: boolean,
) {
  return request<EpisodeState>("/api/episodes", {
    method: "POST",
    body: JSON.stringify({
      tmdb_id: show.tmdb_id,
      ...target,
      watched,
      show: {
        title: show.title,
        poster_path: show.poster_path,
        overview: show.overview,
        release_date: show.release_date,
        vote_average: show.vote_average,
      },
    }),
  });
}

export function useLibrary(enabled: boolean) {
  const { data, error, isLoading, mutate } = useSWR<{ items: ViewingHistoryItem[] }>(
    enabled ? LIBRARY_KEY : null,
    (url: string) => request(url),
    { revalidateOnFocus: true, keepPreviousData: true },
  );
  return { items: data?.items, error, isLoading, mutate };
}

export function useEpisodeState(tmdbId: number, enabled: boolean) {
  return useSWR<EpisodeState>(
    enabled ? `/api/episodes?tmdb_id=${tmdbId}` : null,
    (url: string) => request(url),
    { revalidateOnFocus: false },
  );
}

export const libraryItemKey = (item: Pick<LibraryMeta, "tmdb_id" | "media_type">) =>
  `${LIBRARY_KEY}?tmdb_id=${item.tmdb_id}&media_type=${item.media_type}`;

/**
 * One title's library row, or null when it isn't in the library. Pass the
 * row you already have (from the library list) to skip the request.
 */
export function useLibraryItem(
  meta: Pick<LibraryMeta, "tmdb_id" | "media_type">,
  enabled: boolean,
  initial?: ViewingHistoryItem,
) {
  const { data, isLoading, mutate } = useSWR<{ items: ViewingHistoryItem[] }>(
    enabled ? libraryItemKey(meta) : null,
    (url: string) => request(url),
    {
      fallbackData: initial ? { items: [initial] } : undefined,
      revalidateOnMount: !initial,
      revalidateOnFocus: false,
    },
  );
  return { item: data ? (data.items[0] ?? null) : undefined, isLoading, mutate };
}
