import "server-only";

import { sql } from "@/lib/db";
import { fetchTMDBServer } from "@/lib/tmdb-server";
import type {
  EpisodeRef,
  ShowProgress,
  WatchStatus,
  WatchedEpisode,
} from "@/lib/types";

/*
 * Library storage on D1 Free (5M rows read, 100k rows written per day,
 * 50 queries per request). Every request here costs a fixed handful of
 * queries however long a show is: episode fills are one recursive INSERT,
 * and library reads fetch every show's episodes in one SELECT.
 */

export type ShowInfo = {
  status: string;
  seasons: { season_number: number; episode_count: number }[];
  last_episode_to_air: (EpisodeRef & { air_date: string }) | null;
  next_episode_to_air: (EpisodeRef & { air_date: string }) | null;
};

export type ShowMeta = {
  title: string;
  poster_path?: string | null;
  overview?: string;
  release_date?: string;
  vote_average?: number;
};

const ENDED_STATUSES = new Set(["Ended", "Canceled"]);
// D1 allows 100 bound parameters per statement.
const ID_CHUNK = 90;

export function getShowInfo(tmdbId: number) {
  // Six hours, so new episodes show up the day they air.
  return fetchTMDBServer<ShowInfo>(`/tv/${tmdbId}`, {
    next: { revalidate: 21600 },
  });
}

/** Episode and aired-episode counts per regular season, in order. */
export function airedSeasons(show: ShowInfo) {
  const last = show.last_episode_to_air;
  return show.seasons
    .filter((season) => season.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number)
    .map((season) => ({
      season_number: season.season_number,
      episode_count: season.episode_count,
      aired: !last
        ? 0
        : season.season_number < last.season_number
          ? season.episode_count
          : season.season_number === last.season_number
            ? last.episode_number
            : 0,
    }));
}

function isAfter(a: EpisodeRef, b: EpisodeRef) {
  return (
    a.season_number > b.season_number ||
    (a.season_number === b.season_number && a.episode_number > b.episode_number)
  );
}

export function computeProgress(
  show: ShowInfo,
  watched: WatchedEpisode[],
  completedAt?: string | null,
): ShowProgress {
  const seasons = airedSeasons(show);
  const watchedKeys = new Set(
    watched.map((ep) => `${ep.season_number}-${ep.episode_number}`),
  );

  let furthest: EpisodeRef | null = null;
  let lastUpdate = "";
  for (const ep of watched) {
    if (!furthest || isAfter(ep, furthest)) furthest = ep;
    if (ep.watched_at && ep.watched_at > lastUpdate) lastUpdate = ep.watched_at;
  }

  let airedTotal = 0;
  let watchedTotal = 0;
  let remaining = 0;
  let nextEpisode: EpisodeRef | null = null;
  const seasonProgress = seasons.map((season) => {
    let seasonWatched = 0;
    for (let episode = 1; episode <= season.aired; episode++) {
      const ref = { season_number: season.season_number, episode_number: episode };
      if (watchedKeys.has(`${season.season_number}-${episode}`)) seasonWatched++;
      if (!furthest || isAfter(ref, furthest)) {
        remaining++;
        nextEpisode ??= ref;
      }
    }
    airedTotal += season.aired;
    watchedTotal += seasonWatched;
    return { ...season, watched: seasonWatched };
  });

  const lastAired = show.last_episode_to_air;
  // A show marked watched before episodes were tracked has no rows; fall
  // back to comparing air dates with when it was marked.
  const since = lastUpdate || completedAt || "";
  const hasNew =
    !!lastAired &&
    !!since &&
    (watched.length === 0 || remaining > 0) &&
    lastAired.air_date > since.slice(0, 10);

  return {
    aired_episodes: airedTotal,
    watched_episodes: watchedTotal,
    remaining,
    has_new: hasNew,
    next_episode: nextEpisode,
    last_aired: lastAired
      ? {
          season_number: lastAired.season_number,
          episode_number: lastAired.episode_number,
        }
      : null,
    next_air_date: show.next_episode_to_air?.air_date ?? null,
    ended: ENDED_STATUSES.has(show.status),
    seasons: seasonProgress,
  };
}

/** Watched episodes for several shows in one query per 90 shows. */
export async function listWatched(userId: string, tmdbIds: number[]) {
  const byShow = new Map<number, WatchedEpisode[]>();
  for (let start = 0; start < tmdbIds.length; start += ID_CHUNK) {
    const ids = tmdbIds.slice(start, start + ID_CHUNK);
    const { rows } = await sql.query(
      `SELECT tmdb_id, season_number, episode_number, watched_at
       FROM episode_progress
       WHERE user_id = $1 AND watched = 1
       AND tmdb_id IN (${ids.map((_, i) => `$${i + 2}`).join(", ")})`,
      [userId, ...ids],
    );
    for (const row of rows) {
      const list = byShow.get(row.tmdb_id) || [];
      list.push({
        season_number: row.season_number,
        episode_number: row.episode_number,
        watched_at: row.watched_at,
      });
      byShow.set(row.tmdb_id, list);
    }
  }
  return byShow;
}

/**
 * Mark an episode watched along with every aired episode before it, so
 * catching up several episodes takes one tap. One statement for any length.
 */
export async function markWatchedThrough(
  userId: string,
  tmdbId: number,
  show: ShowInfo,
  through: EpisodeRef,
) {
  const spans = airedSeasons(show)
    .filter((season) => season.season_number <= through.season_number)
    .map((season) => [
      season.season_number,
      season.season_number === through.season_number
        ? through.episode_number
        : season.aired,
    ])
    .filter(([, last]) => last > 0);
  if (spans.length === 0) return;

  // Season and episode numbers are integers from TMDB and the validated
  // request; inlining them keeps long-running shows under the 100-parameter cap.
  const values = spans
    .map(([season, last]) => `(${Math.trunc(season)}, ${Math.trunc(last)})`)
    .join(", ");
  const now = new Date().toISOString();

  await sql.query(
    `WITH RECURSIVE
      span(season_number, last_episode) AS (VALUES ${values}),
      ep(season_number, episode_number, last_episode) AS (
        SELECT season_number, 1, last_episode FROM span
        UNION ALL
        SELECT season_number, episode_number + 1, last_episode
        FROM ep WHERE episode_number < last_episode
      )
    INSERT INTO episode_progress (
      id, user_id, tmdb_id, season_number, episode_number, watched,
      watched_at, created_at, updated_at
    )
    SELECT $1 || '-' || season_number || '-' || episode_number, $2, $3,
      season_number, episode_number, 1, $4, $4, $4
    FROM ep WHERE true
    ON CONFLICT (user_id, tmdb_id, season_number, episode_number)
    DO UPDATE SET watched = 1, watched_at = excluded.watched_at,
      updated_at = excluded.updated_at
    WHERE episode_progress.watched = 0`,
    [`${userId}-${tmdbId}`, userId, tmdbId, now],
  );
}

export async function unmarkWatched(
  userId: string,
  tmdbId: number,
  seasonNumber: number,
  episodeNumber?: number,
) {
  if (episodeNumber === undefined) {
    await sql`
      DELETE FROM episode_progress
      WHERE user_id = ${userId} AND tmdb_id = ${tmdbId}
      AND season_number = ${seasonNumber}
    `;
    return;
  }
  await sql`
    DELETE FROM episode_progress
    WHERE user_id = ${userId} AND tmdb_id = ${tmdbId}
    AND season_number = ${seasonNumber} AND episode_number = ${episodeNumber}
  `;
}

/**
 * Record that the show was just watched: add it to the library if needed
 * and set it to Watching, or Watched once an ended show is caught up.
 */
export async function touchShow(
  userId: string,
  tmdbId: number,
  meta: ShowMeta,
  status: Extract<WatchStatus, "watching" | "completed">,
) {
  const now = new Date().toISOString();
  const completedAt = status === "completed" ? now : null;
  await sql`
    INSERT INTO viewing_history (
      id, user_id, tmdb_id, media_type, title, poster_path, overview,
      release_date, vote_average, status, started_at, completed_at,
      last_watched_at, created_at, updated_at
    ) VALUES (
      ${`${userId}-${tmdbId}-tv`}, ${userId}, ${tmdbId}, 'tv', ${meta.title},
      ${meta.poster_path ?? null}, ${meta.overview ?? ""}, ${meta.release_date ?? ""},
      ${meta.vote_average ?? 0}, ${status}, ${now}, ${completedAt}, ${now}, ${now}, ${now}
    )
    ON CONFLICT (user_id, tmdb_id, media_type) DO UPDATE SET
      status = excluded.status,
      started_at = COALESCE(viewing_history.started_at, excluded.started_at),
      completed_at = COALESCE(excluded.completed_at, viewing_history.completed_at),
      last_watched_at = excluded.last_watched_at,
      updated_at = excluded.updated_at
  `;
}
