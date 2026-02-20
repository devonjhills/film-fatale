import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EpisodeProgress } from "@/lib/types";
import { headers } from "next/headers";
import { sql } from "@/lib/db";

// In-memory storage for development
const episodeProgressData = new Map<string, EpisodeProgress[]>();

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
  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (dbUrl) {
    await initDatabase();

    try {
      // Use individual SQL queries for safety - still much faster than HTTP requests
      for (const ep of episodes) {
        const id = `${session.user.id}-${tmdb_id}-${ep.season_number}-${ep.episode_number}`;
        const watchedAt = ep.watched ? now : null;

        await sql`
          INSERT INTO episode_progress (
            id, user_id, tmdb_id, season_number, episode_number, watched, watched_at, created_at, updated_at
          ) VALUES (
            ${id}, ${session.user.id}, ${tmdb_id}, ${ep.season_number}, ${ep.episode_number}, 
            ${ep.watched}, ${watchedAt}, ${now}, ${now}
          ) ON CONFLICT (user_id, tmdb_id, season_number, episode_number) 
          DO UPDATE SET 
            watched = ${ep.watched},
            watched_at = ${watchedAt},
            updated_at = ${now}
        `;
      }

      return NextResponse.json({ success: true, updated: episodes.length });
    } catch (dbError) {
      console.error("Batch database error:", dbError);
      return NextResponse.json(
        { error: "Database update failed", details: String(dbError) },
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

// Database initialization function
async function initDatabase() {
  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    return; // Skip if no database URL (development mode)
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS episode_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tmdb_id INTEGER NOT NULL,
        season_number INTEGER NOT NULL,
        episode_number INTEGER NOT NULL,
        watched BOOLEAN DEFAULT FALSE,
        watched_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tmdb_id, season_number, episode_number)
      );
    `;
  } catch (error) {
    console.error("Episode progress database initialization error:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tmdb_id = searchParams.get("tmdb_id");
    const season_number = searchParams.get("season_number");

    if (!tmdb_id) {
      return NextResponse.json({ error: "Missing tmdb_id" }, { status: 400 });
    }

    // Production: Use Postgres
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (dbUrl) {
      await initDatabase();

      let query = `
        SELECT * FROM episode_progress 
        WHERE user_id = $1 AND tmdb_id = $2
      `;
      const params: (string | number)[] = [session.user.id, parseInt(tmdb_id)];

      if (season_number) {
        query += ` AND season_number = $3`;
        params.push(parseInt(season_number));
      }

      query += ` ORDER BY season_number ASC, episode_number ASC`;

      const { rows } = await sql.query(query, params);
      return NextResponse.json({ episodes: rows });
    }

    // Development: Use in-memory storage
    const userEpisodes = episodeProgressData.get(session.user.id) || [];
    let filteredEpisodes = userEpisodes.filter(
      (ep) => ep.tmdb_id === parseInt(tmdb_id),
    );

    if (season_number) {
      filteredEpisodes = filteredEpisodes.filter(
        (ep) => ep.season_number === parseInt(season_number),
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tmdb_id, season_number, episode_number, watched, episodes } = body;

    // Handle batch operations
    if (episodes && Array.isArray(episodes)) {
      return await handleBatchUpdate(session, tmdb_id, episodes);
    }

    if (
      !tmdb_id ||
      season_number === undefined ||
      episode_number === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const id = `${session.user.id}-${tmdb_id}-${season_number}-${episode_number}`;

    // Production: Use Postgres
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (dbUrl) {
      await initDatabase();

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
