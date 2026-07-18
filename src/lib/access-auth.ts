import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { headers } from "next/headers";

export type AccessUser = {
  id: string;
  email: string;
  name: string;
};

export type AccessSession = {
  user: AccessUser;
};

const ACCESS_ASSERTION_HEADER = "cf-access-jwt-assertion";
const jwksByTeamDomain = new Map<
  string,
  ReturnType<typeof createRemoteJWKSet>
>();

function developmentSession(): AccessSession | null {
  if (process.env.NODE_ENV === "production") return null;

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

function getTeamDomain(): string | null {
  const value = process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN?.trim();
  if (!value) return null;
  return value.startsWith("https://")
    ? value.replace(/\/$/, "")
    : `https://${value.replace(/\/$/, "")}`;
}

function userFromPayload(payload: JWTPayload): AccessUser | null {
  if (typeof payload.email !== "string") return null;

  const allowedEmail = process.env.CLOUDFLARE_ACCESS_ALLOWED_EMAIL
    ?.trim()
    .toLowerCase();
  if (!allowedEmail || payload.email.toLowerCase() !== allowedEmail) return null;

  return {
    id: process.env.APP_OWNER_ID || "owner",
    email: payload.email,
    name:
      typeof payload.name === "string"
        ? payload.name
        : payload.email.split("@")[0],
  };
}

/**
 * Validate the Cloudflare Access application token for the current request.
 * Production fails closed. Local Next development uses an isolated identity
 * so the app remains testable without Cloudflare.
 */
export async function getSession(): Promise<AccessSession | null> {
  const localSession = developmentSession();
  if (localSession) return localSession;

  const requestHeaders = await headers();
  const token = requestHeaders.get(ACCESS_ASSERTION_HEADER);
  const teamDomain = getTeamDomain();
  const audience = process.env.CLOUDFLARE_ACCESS_AUD;

  if (!token || !teamDomain || !audience) return null;

  try {
    let jwks = jwksByTeamDomain.get(teamDomain);
    if (!jwks) {
      jwks = createRemoteJWKSet(
        new URL(`${teamDomain}/cdn-cgi/access/certs`),
      );
      jwksByTeamDomain.set(teamDomain, jwks);
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer: teamDomain,
      audience,
    });
    const user = userFromPayload(payload);
    return user ? { user } : null;
  } catch {
    return null;
  }
}
