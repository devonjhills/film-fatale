import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  ViewingHistoryItem,
  WatchStatus,
  TVShowProgress,
  SeasonProgress,
  EpisodeProgress,
} from "@/lib/types";
import { headers } from "next/headers";
import { sql } from "@/lib/db";

// In-memory storage for development
const viewingHistoryData = new Map<string, ViewingHistoryItem[]>();
const episodeProgressData = new Map<string, EpisodeProgress[]>();

// Helper function to get TV show details from TMDB
async function getTVShowDetails(tmdbId: number) {
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_MOVIE_API_KEY}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch TV show details");
  }

  return response.json();
}

// Helper function to calculate TV show progress
async function calculateTVProgress(
  userId: string,
  tmdbId: number,
): Promise<TVShowProgress | null> {
  try {
    // Get TV show details from TMDB
    const tvShowDetails = await getTVShowDetails(tmdbId);

    // Get user's episode progress
    let userEpisodes: EpisodeProgress[] = [];

    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (dbUrl) {
      const { rows } = await sql`
        SELECT * FROM episode_progress 
        WHERE user_id = ${userId} AND tmdb_id = ${tmdbId}
        ORDER BY season_number ASC, episode_number ASC
      `;
      userEpisodes = rows as EpisodeProgress[];
    } else {
      // Development: Use in-memory storage
      const allUserEpisodes = episodeProgressData.get(userId) || [];
      userEpisodes = allUserEpisodes.filter((ep) => ep.tmdb_id === tmdbId);
    }

    // Calculate progress for each season
    const seasons: SeasonProgress[] = [];
    let totalEpisodes = 0;
    let totalWatchedEpisodes = 0;

    for (const season of tvShowDetails.seasons) {
      if (season.season_number === 0) continue; // Skip specials

      const seasonEpisodes = userEpisodes.filter(
        (ep) => ep.season_number === season.season_number,
      );

      const watchedCount = seasonEpisodes.filter((ep) => ep.watched).length;
      const episodeCount = season.episode_count;

      seasons.push({
        season_number: season.season_number,
        total_episodes: episodeCount,
        watched_episodes: watchedCount,
        completion_percentage:
          episodeCount > 0 ? (watchedCount / episodeCount) * 100 : 0,
      });

      totalEpisodes += episodeCount;
      totalWatchedEpisodes += watchedCount;
    }

    // Find next episode to watch
    let nextEpisode:
      | { season_number: number; episode_number: number }
      | undefined;

    for (const season of seasons) {
      if (season.completion_percentage < 100) {
        // Find first unwatched episode in this season
        const seasonEpisodes = userEpisodes.filter(
          (ep) => ep.season_number === season.season_number,
        );

        for (let ep = 1; ep <= season.total_episodes; ep++) {
          const episodeProgress = seasonEpisodes.find(
            (progress) => progress.episode_number === ep,
          );

          if (!episodeProgress || !episodeProgress.watched) {
            nextEpisode = {
              season_number: season.season_number,
              episode_number: ep,
            };
            break;
          }
        }
        break;
      }
    }

    return {
      tmdb_id: tmdbId,
      total_seasons: seasons.length,
      total_episodes: totalEpisodes,
      watched_episodes: totalWatchedEpisodes,
      completion_percentage:
        totalEpisodes > 0 ? (totalWatchedEpisodes / totalEpisodes) * 100 : 0,
      seasons,
      next_episode: nextEpisode,
    };
  } catch (error) {
    console.error(`Error calculating TV progress for ${tmdbId}:`, error);
    return null;
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
      CREATE TABLE IF NOT EXISTS viewing_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tmdb_id INTEGER NOT NULL,
        media_type TEXT NOT NULL,
        title TEXT NOT NULL,
        poster_path TEXT,
        overview TEXT,
        release_date TEXT,
        vote_average REAL,
        status TEXT NOT NULL,
        watch_count INTEGER DEFAULT 1,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        last_watched_at TIMESTAMP,
        notes TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tmdb_id, media_type)
      );
    `;
  } catch (error) {
    console.error("Viewing history database initialization error:", error);
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
    const status = searchParams.get("status");
    const mediaType = searchParams.get("media_type");
    const tmdbId = searchParams.get("tmdb_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Production: Use Postgres
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (dbUrl) {
      await initDatabase();

      let query = `
        SELECT * FROM viewing_history 
        WHERE user_id = $1
      `;
      const params: (string | number)[] = [session.user.id];

      if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      if (mediaType) {
        query += ` AND media_type = $${params.length + 1}`;
        params.push(mediaType);
      }

      if (tmdbId) {
        query += ` AND tmdb_id = $${params.length + 1}`;
        params.push(parseInt(tmdbId));
      }

      query += ` ORDER BY last_watched_at DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const { rows } = await sql.query(query, params);

      // Add episode progress for TV shows
      const enrichedItems = await Promise.all(
        rows.map(async (item: ViewingHistoryItem) => {
          if (item.media_type === "tv") {
            const progress = await calculateTVProgress(
              session.user.id,
              item.tmdb_id,
            );
            return { ...item, episode_progress: progress };
          }
          return item;
        }),
      );

      // Get total count
      let countQuery = `
        SELECT COUNT(*) FROM viewing_history 
        WHERE user_id = $1
      `;
      const countParams: (string | number)[] = [session.user.id];

      if (status) {
        countQuery += ` AND status = $${countParams.length + 1}`;
        countParams.push(status);
      }

      if (mediaType) {
        countQuery += ` AND media_type = $${countParams.length + 1}`;
        countParams.push(mediaType);
      }

      if (tmdbId) {
        countQuery += ` AND tmdb_id = $${countParams.length + 1}`;
        countParams.push(parseInt(tmdbId));
      }

      const { rows: countRows } = await sql.query(countQuery, countParams);
      const total = parseInt(countRows[0].count);

      return NextResponse.json({
        items: enrichedItems,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    // Development: Use in-memory storage
    let userHistory = viewingHistoryData.get(session.user.id) || [];

    if (status) {
      userHistory = userHistory.filter((item) => item.status === status);
    }

    if (mediaType) {
      userHistory = userHistory.filter((item) => item.media_type === mediaType);
    }

    if (tmdbId) {
      userHistory = userHistory.filter(
        (item) => item.tmdb_id === parseInt(tmdbId),
      );
    }

    userHistory.sort((a, b) => {
      const aDate = new Date(a.last_watched_at || a.created_at).getTime();
      const bDate = new Date(b.last_watched_at || b.created_at).getTime();
      return bDate - aDate;
    });

    const total = userHistory.length;
    const paginatedItems = userHistory.slice(offset, offset + limit);

    // Add episode progress for TV shows
    const enrichedItems = await Promise.all(
      paginatedItems.map(async (item: ViewingHistoryItem) => {
        if (item.media_type === "tv") {
          const progress = await calculateTVProgress(
            session.user.id,
            item.tmdb_id,
          );
          return { ...item, episode_progress: progress };
        }
        return item;
      }),
    );

    return NextResponse.json({
      items: enrichedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching viewing history:", error);
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

    if (!tmdb_id || !media_type || !title || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["watching", "completed", "plan_to_watch"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = `${session.user.id}-${tmdb_id}-${media_type}`;

    // Production: Use Postgres
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (dbUrl) {
      await initDatabase();

      try {
        // Check if item already exists
        const { rows: existingRows } = await sql`
          SELECT * FROM viewing_history 
          WHERE user_id = ${session.user.id} 
          AND tmdb_id = ${tmdb_id} 
          AND media_type = ${media_type}
        `;

        if (existingRows.length > 0) {
          const existing = existingRows[0];
          const watchCount =
            status === "completed" && existing.status !== "completed"
              ? existing.watch_count + 1
              : existing.watch_count;

          const startedAt =
            existing.started_at || (status === "watching" ? now : null);
          const completedAt =
            status === "completed" ? now : existing.completed_at;
          const lastWatchedAt = ["watching", "completed"].includes(status)
            ? now
            : existing.last_watched_at;

          await sql`
            UPDATE viewing_history SET
              status = ${status},
              watch_count = ${watchCount},
              started_at = ${startedAt},
              completed_at = ${completedAt},
              last_watched_at = ${lastWatchedAt},
              rating = ${rating || existing.rating},
              notes = ${notes || existing.notes},
              updated_at = ${now}
            WHERE user_id = ${session.user.id} 
            AND tmdb_id = ${tmdb_id} 
            AND media_type = ${media_type}
          `;

          const { rows: updatedRows } = await sql`
            SELECT * FROM viewing_history 
            WHERE user_id = ${session.user.id} 
            AND tmdb_id = ${tmdb_id} 
            AND media_type = ${media_type}
          `;

          return NextResponse.json({ item: updatedRows[0] });
        }

        // Create new item
        const startedAt = status === "watching" ? now : null;
        const completedAt = status === "completed" ? now : null;
        const lastWatchedAt = ["watching", "completed"].includes(status)
          ? now
          : null;

        const viewingHistoryItem: ViewingHistoryItem = {
          id,
          user_id: session.user.id,
          tmdb_id,
          media_type,
          title,
          poster_path: poster_path || null,
          overview: overview || "",
          release_date: release_date || "",
          vote_average: vote_average || 0,
          status: status as WatchStatus,
          watch_count: 1,
          started_at: startedAt,
          completed_at: completedAt,
          last_watched_at: lastWatchedAt,
          rating: rating || null,
          notes: notes || null,
          created_at: now,
          updated_at: now,
        };

        await sql`
          INSERT INTO viewing_history (
            id, user_id, tmdb_id, media_type, title, poster_path, 
            overview, release_date, vote_average, status, watch_count,
            started_at, completed_at, last_watched_at, rating, notes,
            created_at, updated_at
          ) VALUES (
            ${viewingHistoryItem.id}, ${viewingHistoryItem.user_id}, ${viewingHistoryItem.tmdb_id}, 
            ${viewingHistoryItem.media_type}, ${viewingHistoryItem.title}, ${viewingHistoryItem.poster_path},
            ${viewingHistoryItem.overview}, ${viewingHistoryItem.release_date}, ${viewingHistoryItem.vote_average},
            ${viewingHistoryItem.status}, ${viewingHistoryItem.watch_count}, ${viewingHistoryItem.started_at},
            ${viewingHistoryItem.completed_at}, ${viewingHistoryItem.last_watched_at}, ${viewingHistoryItem.rating},
            ${viewingHistoryItem.notes}, ${viewingHistoryItem.created_at}, ${viewingHistoryItem.updated_at}
          )
        `;

        return NextResponse.json({ item: viewingHistoryItem }, { status: 201 });
      } catch (dbError: unknown) {
        console.error("Database error:", dbError);
        throw dbError;
      }
    }

    // Development: Use in-memory storage
    const userHistory = viewingHistoryData.get(session.user.id) || [];

    const existingIndex = userHistory.findIndex(
      (item) => item.tmdb_id === tmdb_id && item.media_type === media_type,
    );

    if (existingIndex >= 0) {
      const existing = userHistory[existingIndex];
      const watchCount =
        status === "completed" && existing.status !== "completed"
          ? existing.watch_count + 1
          : existing.watch_count;

      const startedAt =
        existing.started_at || (status === "watching" ? now : null);
      const completedAt = status === "completed" ? now : existing.completed_at;
      const lastWatchedAt = ["watching", "completed"].includes(status)
        ? now
        : existing.last_watched_at;

      userHistory[existingIndex] = {
        ...existing,
        status: status as WatchStatus,
        watch_count: watchCount,
        started_at: startedAt,
        completed_at: completedAt,
        last_watched_at: lastWatchedAt,
        rating: rating || existing.rating,
        notes: notes || existing.notes,
        updated_at: now,
      };

      viewingHistoryData.set(session.user.id, userHistory);
      return NextResponse.json({ item: userHistory[existingIndex] });
    }

    // Create new item
    const startedAt = status === "watching" ? now : null;
    const completedAt = status === "completed" ? now : null;
    const lastWatchedAt = ["watching", "completed"].includes(status)
      ? now
      : null;

    const viewingHistoryItem: ViewingHistoryItem = {
      id,
      user_id: session.user.id,
      tmdb_id,
      media_type,
      title,
      poster_path: poster_path || null,
      overview: overview || "",
      release_date: release_date || "",
      vote_average: vote_average || 0,
      status: status as WatchStatus,
      watch_count: 1,
      started_at: startedAt,
      completed_at: completedAt,
      last_watched_at: lastWatchedAt,
      rating: rating || null,
      notes: notes || null,
      created_at: now,
      updated_at: now,
    };

    userHistory.push(viewingHistoryItem);
    viewingHistoryData.set(session.user.id, userHistory);

    return NextResponse.json({ item: viewingHistoryItem }, { status: 201 });
  } catch (error) {
    console.error("Error adding to viewing history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tmdb_id = searchParams.get("tmdb_id");
    const media_type = searchParams.get("media_type");

    if (!tmdb_id || !media_type) {
      return NextResponse.json(
        { error: "Missing tmdb_id or media_type" },
        { status: 400 },
      );
    }

    // Production: Use Postgres
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (dbUrl) {
      await sql`
        DELETE FROM viewing_history 
        WHERE user_id = ${session.user.id} 
        AND tmdb_id = ${parseInt(tmdb_id)} 
        AND media_type = ${media_type}
      `;

      return NextResponse.json({ success: true });
    }

    // Development: Use in-memory storage
    const userHistory = viewingHistoryData.get(session.user.id) || [];
    const filteredHistory = userHistory.filter(
      (item) =>
        !(item.tmdb_id === parseInt(tmdb_id) && item.media_type === media_type),
    );

    viewingHistoryData.set(session.user.id, filteredHistory);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from viewing history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
