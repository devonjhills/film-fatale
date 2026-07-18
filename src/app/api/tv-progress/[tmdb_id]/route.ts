import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/access-auth";
import { TVShowProgress, SeasonProgress, EpisodeProgress } from "@/lib/types";
import { hasDatabase, sql } from "@/lib/db";
import { fetchTMDBServer } from "@/lib/tmdb-server";

// In-memory storage for development
const episodeProgressData = new Map<string, EpisodeProgress[]>();

async function getTVShowDetails(tmdbId: number) {
  return fetchTMDBServer<{ seasons: { season_number: number; episode_count: number }[] }>(
    `/tv/${tmdbId}`,
    { next: { revalidate: 86400 } },
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tmdb_id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tmdb_id: tmdbIdParam } = await params;
    const tmdb_id = /^\d+$/.test(tmdbIdParam) ? Number(tmdbIdParam) : NaN;

    if (!Number.isSafeInteger(tmdb_id) || tmdb_id <= 0) {
      return NextResponse.json({ error: "Invalid tmdb_id" }, { status: 400 });
    }

    // Get TV show details from TMDB
    const tvShowDetails = await getTVShowDetails(tmdb_id);

    // Persistent storage: D1
    let userEpisodes: EpisodeProgress[] = [];

    if (hasDatabase()) {
      const { rows } = await sql`
        SELECT * FROM episode_progress 
        WHERE user_id = ${session.user.id} AND tmdb_id = ${tmdb_id}
        ORDER BY season_number ASC, episode_number ASC
      `;
      userEpisodes = rows as unknown as EpisodeProgress[];
    } else {
      // Development: Use in-memory storage
      const allUserEpisodes = episodeProgressData.get(session.user.id) || [];
      userEpisodes = allUserEpisodes.filter((ep) => ep.tmdb_id === tmdb_id);
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

    const progress: TVShowProgress = {
      tmdb_id,
      total_seasons: seasons.length,
      total_episodes: totalEpisodes,
      watched_episodes: totalWatchedEpisodes,
      completion_percentage:
        totalEpisodes > 0 ? (totalWatchedEpisodes / totalEpisodes) * 100 : 0,
      seasons,
      next_episode: nextEpisode,
    };

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching TV show progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
