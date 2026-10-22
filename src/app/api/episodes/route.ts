import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import {
  airedSeasons,
  computeProgress,
  getShowInfo,
  listWatched,
  markWatchedThrough,
  touchShow,
  unmarkWatched,
  type ShowMeta,
} from "@/lib/library-server";

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function parseShowMeta(value: unknown): ShowMeta | null {
  if (!value || typeof value !== "object") return null;
  const meta = value as Record<string, unknown>;
  if (typeof meta.title !== "string" || !meta.title.trim() || meta.title.length > 500) {
    return null;
  }
  return {
    title: meta.title.trim(),
    poster_path: typeof meta.poster_path === "string" ? meta.poster_path : null,
    overview: typeof meta.overview === "string" ? meta.overview : "",
    release_date: typeof meta.release_date === "string" ? meta.release_date : "",
    vote_average: typeof meta.vote_average === "number" ? meta.vote_average : 0,
  };
}

async function showState(userId: string, tmdbId: number) {
  const [show, watched] = await Promise.all([
    getShowInfo(tmdbId),
    listWatched(userId, [tmdbId]),
  ]);
  const episodes = watched.get(tmdbId) || [];
  return { episodes, progress: computeProgress(show, episodes) };
}

/** Watched episodes and aired-episode progress for one show. */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasDatabase()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const raw = new URL(request.url).searchParams.get("tmdb_id");
    const tmdbId = raw && /^\d+$/.test(raw) ? Number(raw) : NaN;
    if (!isPositiveInteger(tmdbId)) {
      return NextResponse.json({ error: "Invalid tmdb_id" }, { status: 400 });
    }

    return NextResponse.json(await showState(session.user.id, tmdbId));
  } catch (error) {
    console.error("Error fetching episode progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Body: { tmdb_id, season_number, episode_number?, watched, show? }.
 * Watching an episode also marks every aired episode before it; leaving
 * out episode_number applies to the whole season. Unwatching removes only
 * the episode or season named. `show` lets a first watch add the show to
 * the library.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasDatabase()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const body = await request.json();
    const { tmdb_id, season_number, episode_number, watched } = body;

    if (
      !isPositiveInteger(tmdb_id) ||
      !isPositiveInteger(season_number) ||
      (episode_number !== undefined && !isPositiveInteger(episode_number)) ||
      typeof watched !== "boolean"
    ) {
      return NextResponse.json({ error: "Invalid episode" }, { status: 400 });
    }

    const userId = session.user.id;

    if (!watched) {
      await unmarkWatched(userId, tmdb_id, season_number, episode_number);
      return NextResponse.json(await showState(userId, tmdb_id));
    }

    const show = await getShowInfo(tmdb_id);
    const aired = airedSeasons(show).find(
      (season) => season.season_number === season_number,
    )?.aired;
    const through = episode_number ?? aired;
    if (!isNonNegativeInteger(aired) || !through || through > aired) {
      return NextResponse.json({ error: "Episode has not aired" }, { status: 400 });
    }

    await markWatchedThrough(userId, tmdb_id, show, {
      season_number,
      episode_number: through,
    });

    const meta = parseShowMeta(body.show);
    if (meta) {
      const last = show.last_episode_to_air;
      const finished =
        ["Ended", "Canceled"].includes(show.status) &&
        last?.season_number === season_number &&
        last.episode_number === through;
      await touchShow(userId, tmdb_id, meta, finished ? "completed" : "watching");
    }

    return NextResponse.json(await showState(userId, tmdb_id));
  } catch (error) {
    console.error("Error updating episode progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
