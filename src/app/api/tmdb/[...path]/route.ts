import { NextRequest, NextResponse } from "next/server";

const TMDB_ORIGIN = "https://api.themoviedb.org/3";
const ALLOWED_QUERY_PARAMS = new Set([
  "append_to_response",
  "include_adult",
  "language",
  "page",
  "query",
  "region",
  "sort_by",
  "with_genres",
  "with_keywords",
]);

const ALLOWED_PATHS = [
  /^movie\/(?:now_playing|popular|top_rated)$/,
  /^movie\/\d+(?:\/watch\/providers)?$/,
  /^tv\/(?:on_the_air|popular|top_rated)$/,
  /^tv\/\d+(?:\/watch\/providers|\/season\/\d+)?$/,
  /^person\/\d+$/,
  /^search\/multi$/,
  /^discover\/(?:movie|tv)$/,
];

function cachePolicy(path: string): string {
  if (path === "search/multi") {
    return "public, s-maxage=600, stale-while-revalidate=3600";
  }
  if (/^(movie|tv|person)\/\d+/.test(path)) {
    return "public, s-maxage=86400, stale-while-revalidate=604800";
  }
  return "public, s-maxage=1800, stale-while-revalidate=21600";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB is not configured" },
      { status: 503 },
    );
  }

  const { path: segments } = await params;
  const path = segments.join("/");
  if (!ALLOWED_PATHS.some((pattern) => pattern.test(path))) {
    return NextResponse.json({ error: "Unsupported TMDB route" }, { status: 404 });
  }

  const upstream = new URL(`${TMDB_ORIGIN}/${path}`);
  upstream.searchParams.set("api_key", apiKey);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (ALLOWED_QUERY_PARAMS.has(key)) upstream.searchParams.set(key, value);
  });

  const response = await fetch(upstream, {
    headers: { Accept: "application/json" },
  });
  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
      "Cache-Control": "public, max-age=60",
      "Cloudflare-CDN-Cache-Control": cachePolicy(path),
    },
  });
}
