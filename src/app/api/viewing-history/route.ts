import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/access-auth";
import type { ViewingHistoryItem, WatchStatus } from "@/lib/types";
import { hasDatabase, sql } from "@/lib/db";
import {
  airedSeasons,
  computeProgress,
  getShowInfo,
  listWatched,
  markWatchedThrough,
} from "@/lib/library-server";

const WATCH_STATUSES: WatchStatus[] = ["watching", "completed", "plan_to_watch"];
const MEDIA_TYPES = ["movie", "tv"] as const;
// Workers Free allows 50 outbound requests per invocation; leave headroom.
const MAX_TRACKED_SHOWS = 40;

function isWatchStatus(value: unknown): value is WatchStatus {
  return WATCH_STATUSES.includes(value as WatchStatus);
}

function isMediaType(value: unknown): value is "movie" | "tv" {
  return MEDIA_TYPES.includes(value as "movie" | "tv");
}

function parsePositiveInteger(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function noDatabase() {
  return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
}

/** Attach aired-episode progress to the shows being followed. */
async function withProgress(userId: string, items: ViewingHistoryItem[]) {
  const tracked = items
    .filter((item) => item.media_type === "tv" && item.status !== "plan_to_watch")
    .sort((a, b) => Number(b.status === "watching") - Number(a.status === "watching"))
    .slice(0, MAX_TRACKED_SHOWS);
  if (tracked.length === 0) return items;

  const [watched, shows] = await Promise.all([
    listWatched(
      userId,
      tracked.map((item) => item.tmdb_id),
    ),
    Promise.allSettled(tracked.map((item) => getShowInfo(item.tmdb_id))),
  ]);

  const progress = new Map(
    tracked.map((item, index) => {
      const show = shows[index];
      return [
        item.tmdb_id,
        show.status === "fulfilled"
          ? computeProgress(
              show.value,
              watched.get(item.tmdb_id) || [],
              item.completed_at,
            )
          : null,
      ];
    }),
  );

  return items.map((item) =>
    item.media_type === "tv" && progress.has(item.tmdb_id)
      ? { ...item, progress: progress.get(item.tmdb_id) }
      : item,
  );
}

/**
 * The whole library in one query; a personal library is small enough to
 * filter and sort on the client. `tmdb_id` + `media_type` returns one item.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasDatabase()) return noDatabase();

    const { searchParams } = new URL(request.url);
    const tmdbIdParam = searchParams.get("tmdb_id");
    const mediaType = searchParams.get("media_type");
    const userId = session.user.id;

    if (tmdbIdParam !== null) {
      const tmdbId = parsePositiveInteger(tmdbIdParam);
      if (tmdbId === null || !isMediaType(mediaType)) {
        return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
      }
      const { rows } = await sql`
        SELECT * FROM viewing_history
        WHERE user_id = ${userId} AND tmdb_id = ${tmdbId} AND media_type = ${mediaType}
      `;
      return NextResponse.json({ items: rows });
    }

    const { rows } = await sql`
      SELECT * FROM viewing_history
      WHERE user_id = ${userId}
      ORDER BY COALESCE(last_watched_at, created_at) DESC
    `;
    const items = await withProgress(userId, rows as ViewingHistoryItem[]);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching viewing history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasDatabase()) return noDatabase();

    const body = await request.json();
    const {
      tmdb_id,
      media_type,
      title,
      poster_path,
      overview,
      release_date,
      vote_average,
      status,
      rating,
      notes,
    } = body;

    if (
      !Number.isSafeInteger(tmdb_id) ||
      tmdb_id <= 0 ||
      !isMediaType(media_type) ||
      typeof title !== "string" ||
      title.trim().length === 0 ||
      title.length > 500 ||
      !isWatchStatus(status)
    ) {
      return NextResponse.json({ error: "Invalid required fields" }, { status: 400 });
    }

    if (
      (rating !== undefined &&
        rating !== null &&
        (!Number.isInteger(rating) || rating < 1 || rating > 10)) ||
      (notes !== undefined &&
        notes !== null &&
        (typeof notes !== "string" || notes.length > 5000)) ||
      (poster_path !== undefined &&
        poster_path !== null &&
        typeof poster_path !== "string") ||
      (overview !== undefined && typeof overview !== "string") ||
      (release_date !== undefined && typeof release_date !== "string") ||
      (vote_average !== undefined && typeof vote_average !== "number")
    ) {
      return NextResponse.json({ error: "Invalid optional fields" }, { status: 400 });
    }

    const userId = session.user.id;
    const now = new Date().toISOString();
    const watchedNow = status === "watching" || status === "completed";

    // One upsert. Rating and notes are only replaced when sent; the
    // completion date is kept unless the status moves to Watched again.
    await sql`
      INSERT INTO viewing_history (
        id, user_id, tmdb_id, media_type, title, poster_path, overview,
        release_date, vote_average, status, started_at, completed_at,
        last_watched_at, rating, notes, created_at, updated_at
      ) VALUES (
        ${`${userId}-${tmdb_id}-${media_type}`}, ${userId}, ${tmdb_id}, ${media_type},
        ${title.trim()}, ${poster_path ?? null}, ${overview ?? ""}, ${release_date ?? ""},
        ${vote_average ?? 0}, ${status}, ${status === "watching" ? now : null},
        ${status === "completed" ? now : null}, ${watchedNow ? now : null},
        ${rating ?? null}, ${notes ?? null}, ${now}, ${now}
      )
      ON CONFLICT (user_id, tmdb_id, media_type) DO UPDATE SET
        status = excluded.status,
        started_at = COALESCE(viewing_history.started_at, excluded.started_at),
        completed_at = CASE
          WHEN excluded.status = 'completed' AND viewing_history.status != 'completed'
          THEN excluded.completed_at ELSE viewing_history.completed_at END,
        last_watched_at = CASE
          WHEN excluded.status != viewing_history.status
          THEN COALESCE(excluded.last_watched_at, viewing_history.last_watched_at)
          ELSE viewing_history.last_watched_at END,
        rating = CASE WHEN ${rating !== undefined ? 1 : 0} = 1
          THEN excluded.rating ELSE viewing_history.rating END,
        notes = CASE WHEN ${notes !== undefined ? 1 : 0} = 1
          THEN excluded.notes ELSE viewing_history.notes END,
        updated_at = excluded.updated_at
    `;

    // Marking a show watched means every aired episode was seen.
    if (media_type === "tv" && status === "completed") {
      try {
        const show = await getShowInfo(tmdb_id);
        const seasons = airedSeasons(show).filter((season) => season.aired > 0);
        const last = seasons.at(-1);
        if (last) {
          await markWatchedThrough(userId, tmdb_id, show, {
            season_number: last.season_number,
            episode_number: last.aired,
          });
        }
      } catch (error) {
        console.error(`Could not fill episodes for ${tmdb_id}:`, error);
      }
    }

    const { rows } = await sql`
      SELECT * FROM viewing_history
      WHERE user_id = ${userId} AND tmdb_id = ${tmdb_id} AND media_type = ${media_type}
    `;
    return NextResponse.json({ item: rows[0] });
  } catch (error) {
    console.error("Error adding to viewing history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasDatabase()) return noDatabase();

    const { searchParams } = new URL(request.url);
    const tmdbId = parsePositiveInteger(searchParams.get("tmdb_id"));
    const mediaType = searchParams.get("media_type");

    if (tmdbId === null || !isMediaType(mediaType)) {
      return NextResponse.json({ error: "Invalid tmdb_id or media_type" }, { status: 400 });
    }

    const userId = session.user.id;
    await sql`
      DELETE FROM viewing_history
      WHERE user_id = ${userId} AND tmdb_id = ${tmdbId} AND media_type = ${mediaType}
    `;
    // Removing a show also clears its episode history.
    if (mediaType === "tv") {
      await sql`
        DELETE FROM episode_progress WHERE user_id = ${userId} AND tmdb_id = ${tmdbId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from viewing history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
