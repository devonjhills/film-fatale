import { NextRequest, NextResponse } from "next/server";
import {
  OAUTH_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  cookieOptions,
  googleConfig,
  signToken,
  verifyGoogleIdToken,
  verifyToken,
} from "@/lib/auth";

/**
 * Google sends you back here. Check the state, trade the code for an ID
 * token, and sign in only if it is the allowed, verified email.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;

  const finish = (target: string) => {
    const response = NextResponse.redirect(`${origin}${target}`);
    response.cookies.set(OAUTH_COOKIE, "", cookieOptions(0));
    return response;
  };

  const config = googleConfig();
  const code = searchParams.get("code");
  const oauth = await verifyToken(request.cookies.get(OAUTH_COOKIE)?.value);
  if (
    !config ||
    !code ||
    !oauth ||
    oauth.typ !== "oauth" ||
    typeof oauth.state !== "string" ||
    oauth.state !== searchParams.get("state") ||
    typeof oauth.nonce !== "string" ||
    typeof oauth.verifier !== "string"
  ) {
    return finish("/library?auth=failed");
  }

  let idToken: unknown;
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: `${origin}/api/auth/callback`,
        grant_type: "authorization_code",
        code_verifier: oauth.verifier,
      }),
    });
    if (!tokenResponse.ok) return finish("/library?auth=failed");
    ({ id_token: idToken } = (await tokenResponse.json()) as { id_token?: unknown });
  } catch (error) {
    console.error("Google token exchange failed:", error);
    return finish("/library?auth=failed");
  }

  const user =
    typeof idToken === "string"
      ? await verifyGoogleIdToken(idToken, config.clientId, oauth.nonce)
      : null;
  if (!user) return finish("/library?auth=denied");

  const response = finish("/library");
  response.cookies.set(
    SESSION_COOKIE,
    await signToken({ typ: "session", email: user.email, name: user.name }, SESSION_MAX_AGE),
    cookieOptions(SESSION_MAX_AGE),
  );
  return response;
}
