import { NextRequest, NextResponse } from "next/server";
import { OAUTH_COOKIE, cookieOptions, googleConfig, signToken } from "@/lib/auth";

const OAUTH_MAX_AGE = 600;

function randomToken(bytes = 32) {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return base64url(values);
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Start Google sign-in: remember state, nonce and PKCE verifier, then hand off to Google. */
export async function GET(request: NextRequest) {
  const config = googleConfig();
  if (!config) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  const state = randomToken();
  const nonce = randomToken();
  const verifier = randomToken(48);
  const challenge = base64url(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))),
  );

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: `${request.nextUrl.origin}/api/auth/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  response.cookies.set(
    OAUTH_COOKIE,
    await signToken({ typ: "oauth", state, nonce, verifier }, OAUTH_MAX_AGE),
    cookieOptions(OAUTH_MAX_AGE),
  );
  return response;
}
