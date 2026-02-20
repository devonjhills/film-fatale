import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { TVShowProgress, SeasonProgress, EpisodeProgress } from "@/lib/types";
import { headers } from "next/headers";
import { sql } from "@/lib/db";

// In-memory storage for development
const episodeProgressData = new Map<string, EpisodeProgress[]>();

async function getTVShowDetails(tmdbId: number) {
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_MOVIE_API_KEY}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch TV show details");
  }

  return response.json();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tmdb_id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tmdb_id: tmdbIdParam } = await params;
    const tmdb_id = parseInt(tmdbIdParam);

    // Get TV show details from TMDB
    const tvShowDetails = await getTVShowDetails(tmdb_id);

    // Production: Use Postgres
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    let userEpisodes: EpisodeProgress[] = [];

    if (dbUrl) {
      const { rows } = await sql`
        SELECT * FROM episode_progress 
        WHERE user_id = ${session.user.id} AND tmdb_id = ${tmdb_id}
        ORDER BY season_number ASC, episode_number ASC
      `;
      userEpisodes = rows as EpisodeProgress[];
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
