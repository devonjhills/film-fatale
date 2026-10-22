import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";
import { cookies } from "next/headers";

/*
 * Owner-only sign-in with Google. Google's ID token is checked once, at
 * the callback, against the single allowed email; after that the app
 * trusts its own signed session cookie, which is verified locally with
 * no database query or outside request.
 */

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export type Session = {
  user: SessionUser;
};

const isProduction = process.env.NODE_ENV === "production";

// __Host- cookies must be Secure, which plain-http localhost can't always set.
export const SESSION_COOKIE = isProduction ? "__Host-ff_session" : "ff_session";
export const OAUTH_COOKIE = isProduction ? "__Host-ff_oauth" : "ff_oauth";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function secretKey(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export function allowedEmail(): string | null {
  return process.env.ALLOWED_EMAIL?.trim().toLowerCase() || null;
}

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret || !secretKey() || !allowedEmail()) return null;
  return { clientId, clientSecret };
}

function developmentSession(): Session | null {
  if (isProduction) return null;
  if (process.env.DEV_AUTH_DISABLED === "true") return null;

  const email = process.env.DEV_AUTH_EMAIL || "dev@localhost";
  const id = process.env.APP_OWNER_ID || "owner";

  return {
    user: {
      id,
      email,
      name: process.env.DEV_AUTH_NAME || email.split("@")[0],
    },
  };
}

/** Sign a short-lived or session token with the app's own secret. */
export async function signToken(claims: Record<string, unknown>, maxAge: number) {
  const key = secretKey();
  if (!key) throw new Error("AUTH_SECRET is missing or shorter than 32 characters");
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(key);
}

export async function verifyToken(token: string | undefined) {
  const key = secretKey();
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check Google's ID token and that it belongs to the allowed, verified
 * email. Returns the user to sign in, or null.
 */
export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string,
  nonce: string,
): Promise<SessionUser | null> {
  const allowed = allowedEmail();
  if (!allowed) return null;
  try {
    const { payload } = await jwtVerify(idToken, googleKeys, {
      issuer: GOOGLE_ISSUERS,
      audience: clientId,
    });
    if (payload.nonce !== nonce) return null;
    if (payload.email_verified !== true) return null;
    if (typeof payload.email !== "string" || payload.email.toLowerCase() !== allowed) {
      return null;
    }
    return {
      id: process.env.APP_OWNER_ID || "owner",
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : payload.email.split("@")[0],
    };
  } catch {
    return null;
  }
}

/**
 * The signed-in owner, from the session cookie. Production fails closed.
 * Local Next development uses an isolated identity so the app stays
 * testable without Google.
 */
export async function getSession(): Promise<Session | null> {
  const localSession = developmentSession();
  if (localSession) return localSession;

  const payload = await verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload || payload.typ !== "session") return null;

  // Re-check the email so changing ALLOWED_EMAIL signs out old sessions.
  const allowed = allowedEmail();
  if (typeof payload.email !== "string" || payload.email.toLowerCase() !== allowed) {
    return null;
  }

  return {
    user: {
      id: process.env.APP_OWNER_ID || "owner",
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : payload.email.split("@")[0],
    },
  };
}
