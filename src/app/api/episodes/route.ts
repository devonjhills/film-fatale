import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/access-auth";
import { EpisodeProgress } from "@/lib/types";
import { hasDatabase, sql } from "@/lib/db";

// In-memory storage for development
const episodeProgressData = new Map<string, EpisodeProgress[]>();

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function parsePositiveInteger(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

// Batch update function
async function handleBatchUpdate(
  session: { user: { id: string } },
  tmdb_id: number,
  episodes: {
    season_number: number;
    episode_number: number;
    watched: boolean;
  }[],
) {
  const now = new Date().toISOString();
  if (hasDatabase()) {
    try {
      // D1 Free permits 50 queries per Worker invocation. Ten rows per SQL
      // statement stays below its 100-bound-parameter limit and makes even a
      // long season only a handful of database operations.
      for (let start = 0; start < episodes.length; start += 10) {
        const chunk = episodes.slice(start, start + 10);
        const params: (string | number | boolean | null)[] = [];
        const values = chunk.map((ep) => {
          const watchedAt = ep.watched ? now : null;
          const row = [
            `${session.user.id}-${tmdb_id}-${ep.season_number}-${ep.episode_number}`,
            session.user.id,
            tmdb_id,
            ep.season_number,
            ep.episode_number,
            ep.watched,
            watchedAt,
            now,
            now,
          ];
          const placeholders = row.map((value) => {
            params.push(value);
            return `$${params.length}`;
          });
          return `(${placeholders.join(", ")})`;
        });

        await sql.query(
          `INSERT INTO episode_progress (
            id, user_id, tmdb_id, season_number, episode_number, watched,
            watched_at, created_at, updated_at
          ) VALUES ${values.join(", ")}
          ON CONFLICT (user_id, tmdb_id, season_number, episode_number)
          DO UPDATE SET
            watched = excluded.watched,
            watched_at = excluded.watched_at,
            updated_at = excluded.updated_at`,
          params,
        );
      }

      return NextResponse.json({ success: true, updated: episodes.length });
    } catch (dbError) {
      console.error("Batch database error:", dbError);
      return NextResponse.json(
        { error: "Database update failed" },
        { status: 500 },
      );
    }
  } else {
    // Development: Use in-memory storage
    const userEpisodes = episodeProgressData.get(session.user.id) || [];

    episodes.forEach((epData) => {
      const existingIndex = userEpisodes.findIndex(
        (ep) =>
          ep.tmdb_id === tmdb_id &&
          ep.season_number === epData.season_number &&
          ep.episode_number === epData.episode_number,
      );

      const id = `${session.user.id}-${tmdb_id}-${epData.season_number}-${epData.episode_number}`;
      const episodeProgress = {
        id,
        user_id: session.user.id,
        tmdb_id,
        season_number: epData.season_number,
        episode_number: epData.episode_number,
        watched: epData.watched,
        watched_at: epData.watched ? now : null,
        created_at:
          existingIndex >= 0 ? userEpisodes[existingIndex].created_at : now,
        updated_at: now,
      };

      if (existingIndex >= 0) {
        userEpisodes[existingIndex] = episodeProgress;
      } else {
        userEpisodes.push(episodeProgress);
      }
    });

    episodeProgressData.set(session.user.id, userEpisodes);
    return NextResponse.json({ success: true, updated: episodes.length });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tmdbId = parsePositiveInteger(searchParams.get("tmdb_id"));
    const rawSeasonNumber = searchParams.get("season_number");
    const seasonNumber =
      rawSeasonNumber === null || !/^\d+$/.test(rawSeasonNumber)
        ? null
        : Number(rawSeasonNumber);

    if (
      tmdbId === null ||
      (rawSeasonNumber !== null && !isNonNegativeInteger(seasonNumber))
    ) {
      return NextResponse.json(
        { error: "Invalid tmdb_id or season_number" },
        { status: 400 },
      );
    }

    // Persistent storage: D1
    if (hasDatabase()) {
      let query = `
        SELECT * FROM episode_progress 
        WHERE user_id = $1 AND tmdb_id = $2
      `;
      const params: (string | number)[] = [session.user.id, tmdbId];

      if (seasonNumber !== null) {
        query += ` AND season_number = $3`;
        params.push(seasonNumber);
      }

      query += ` ORDER BY season_number ASC, episode_number ASC`;

      const { rows } = await sql.query(query, params);
      return NextResponse.json({ episodes: rows });
    }

    // Development: Use in-memory storage
    const userEpisodes = episodeProgressData.get(session.user.id) || [];
    let filteredEpisodes = userEpisodes.filter(
      (ep) => ep.tmdb_id === tmdbId,
    );

    if (seasonNumber !== null) {
      filteredEpisodes = filteredEpisodes.filter(
        (ep) => ep.season_number === seasonNumber,
      );
    }

    filteredEpisodes.sort((a, b) => {
      if (a.season_number === b.season_number) {
        return a.episode_number - b.episode_number;
      }
      return a.season_number - b.season_number;
    });

    return NextResponse.json({ episodes: filteredEpisodes });
  } catch (error) {
    console.error("Error fetching episode progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tmdb_id, season_number, episode_number, watched, episodes } = body;

    // Handle batch operations
    if (Array.isArray(episodes)) {
      const validBatch =
        isPositiveInteger(tmdb_id) &&
        episodes.length > 0 &&
        episodes.length <= 400 &&
        episodes.every(
          (episode) =>
            isNonNegativeInteger(episode?.season_number) &&
            isPositiveInteger(episode?.episode_number) &&
            typeof episode?.watched === "boolean",
        );
      if (!validBatch) {
        return NextResponse.json(
          { error: "Invalid episode batch" },
          { status: 400 },
        );
      }
      return await handleBatchUpdate(session, tmdb_id, episodes);
    }

    if (
      !isPositiveInteger(tmdb_id) ||
      !isNonNegativeInteger(season_number) ||
      !isPositiveInteger(episode_number) ||
      typeof watched !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const id = `${session.user.id}-${tmdb_id}-${season_number}-${episode_number}`;

    // Persistent storage: D1
    if (hasDatabase()) {
      try {
        // Upsert episode progress
        const watchedAt = watched ? now : null;

        await sql`
          INSERT INTO episode_progress (
            id, user_id, tmdb_id, season_number, episode_number, watched, watched_at, created_at, updated_at
          ) VALUES (
            ${id}, ${session.user.id}, ${tmdb_id}, ${season_number}, ${episode_number}, 
            ${watched}, ${watchedAt}, ${now}, ${now}
          ) ON CONFLICT (user_id, tmdb_id, season_number, episode_number) 
          DO UPDATE SET 
            watched = ${watched},
            watched_at = ${watchedAt},
            updated_at = ${now}
        `;

        const { rows } = await sql`
          SELECT * FROM episode_progress 
          WHERE user_id = ${session.user.id} 
          AND tmdb_id = ${tmdb_id}
          AND season_number = ${season_number}
          AND episode_number = ${episode_number}
        `;

        return NextResponse.json({ episode: rows[0] });
      } catch (dbError: unknown) {
        console.error("Database error:", dbError);
        throw dbError;
      }
    }

    // Development: Use in-memory storage
    const userEpisodes = episodeProgressData.get(session.user.id) || [];

    const existingIndex = userEpisodes.findIndex(
      (ep) =>
        ep.tmdb_id === tmdb_id &&
        ep.season_number === season_number &&
        ep.episode_number === episode_number,
    );

    const episodeProgress: EpisodeProgress = {
      id,
      user_id: session.user.id,
      tmdb_id,
      season_number,
      episode_number,
      watched,
      watched_at: watched ? now : null,
      created_at:
        existingIndex >= 0 ? userEpisodes[existingIndex].created_at : now,
      updated_at: now,
    };

    if (existingIndex >= 0) {
      userEpisodes[existingIndex] = episodeProgress;
    } else {
      userEpisodes.push(episodeProgress);
    }

    episodeProgressData.set(session.user.id, userEpisodes);

    return NextResponse.json({ episode: episodeProgress });
  } catch (error) {
    console.error("Error updating episode progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
