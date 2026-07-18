import { NextRequest, NextResponse } from "next/server";

const ACCESS_ASSERTION_HEADER = "cf-access-jwt-assertion";

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const accessConfigured =
    process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN &&
    process.env.CLOUDFLARE_ACCESS_AUD &&
    process.env.CLOUDFLARE_ACCESS_ALLOWED_EMAIL;

  if (!accessConfigured) {
    return NextResponse.json(
      { error: "Cloudflare Access is not configured" },
      { status: 503 },
    );
  }

  if (!request.headers.get(ACCESS_ASSERTION_HEADER)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|manifest.webmanifest).*)",
  ],
};
