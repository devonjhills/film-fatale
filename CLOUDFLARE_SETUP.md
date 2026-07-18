# Cloudflare deployment checklist

The code-side migration is already configured. These steps require the
Cloudflare account owner because they create account resources, authenticate the
CLI, enter secrets, and change DNS.

## 1. Authenticate Wrangler and create D1 — complete

```bash
npx wrangler login
npx wrangler d1 create film-fatale
```

The production database ID is configured in the `DB` binding and the schema has
been applied:

```bash
npx wrangler d1 migrations apply film-fatale --remote
```

## 2. Add production secrets

Run each command and type the value only into Wrangler's hidden prompt:

```bash
npx wrangler secret put TMDB_API_KEY
npx wrangler secret put CLOUDFLARE_ACCESS_TEAM_DOMAIN
npx wrangler secret put CLOUDFLARE_ACCESS_AUD
npx wrangler secret put CLOUDFLARE_ACCESS_ALLOWED_EMAIL
npx wrangler secret put APP_OWNER_ID
```

Use `owner` for `APP_OWNER_ID` and never change it after importing data.

## 3. Deploy the Worker

```bash
npm run deploy:cloudflare
```

The default `*.workers.dev` hostname and branch preview URLs are disabled.
Production is served only from the custom domains declared in `wrangler.jsonc`.

## 4. Protect only the owner gateway with Access

In the Cloudflare dashboard:

1. Go to **Zero Trust > Access controls > Applications**.
2. Locate the existing Film Fatale **Self-hosted and private** application and
   select **Configure**.
3. In the application's public hostname list, remove the entries for
   `filmfatale.app` and `www.filmfatale.app` that have an empty **Path**.
4. Add two public hostnames with these values:
   - Domain: `filmfatale.app`; Path: `admin`
   - Domain: `filmfatale.app`; Subdomain: `www`; Path: `admin`
5. Do not add a wildcard: `/admin/*` does not cover the parent `/admin` path.
6. Under **Policies**, keep one **Allow** policy whose **Include** selector is
   **Emails** and whose value is only your exact email address. Remove policies
   that include **Everyone**, an email domain, or the One-time PIN login method.
7. Select the One-time PIN identity provider unless you prefer to connect
   Google.
8. Open **Additional settings > Cookie settings** and turn off
   **Cookie Path Attribute**. The
   `CF_Authorization` cookie must remain scoped to the hostname so the public
   `/api/me` endpoint and private data APIs receive it after `/admin` login.
9. Save the application.
10. Copy the application's **AUD tag** into the
   `CLOUDFLARE_ACCESS_AUD` Worker secret.
11. Set `CLOUDFLARE_ACCESS_TEAM_DOMAIN` to the team domain shown under Zero Trust
   settings, such as `your-team.cloudflareaccess.com`.
12. Redeploy after changing either secret. Editing the existing application
   normally preserves its AUD; creating a replacement application does not.

The `Owner` link in the site footer points to `/admin`. It is intentionally
discreet, but it is not the security boundary. Access and the app's JWT,
audience, issuer, and exact-email validation are the security boundary.

## 5. Verify the production data — complete

The migrated viewing and episode history is stored in D1 under the stable
`owner` identity. A private, git-ignored D1 export is retained locally as a
cutover backup.

Compare counts before cutover:

```bash
npx wrangler d1 execute film-fatale --remote --command "SELECT COUNT(*) AS count FROM viewing_history"
npx wrangler d1 execute film-fatale --remote --command "SELECT COUNT(*) AS count FROM episode_progress"
```

## 6. Production deployment

The production deployment is fully hosted on Cloudflare:

1. `filmfatale.app` and `www.filmfatale.app` are attached as Worker Custom
   Domains with valid TLS.
2. The Access application covers only `/admin` on both hostnames and uses the
   owner-only policy.
3. D1 data and authenticated writes have been verified.
4. TMDB browsing is public; ratings, watch history, and episode tracking remain
   owner-only.

Verify in a private browser window:

1. Open `https://filmfatale.app/` and browse without an Access prompt.
2. Open `https://filmfatale.app/admin` and complete the Access login.
3. Confirm the gateway redirects to `/library` and owner controls appear.
4. Sign out, then confirm `/api/me` returns `{"user":null}` and private data
   APIs still return `401`.
5. Attempt `/admin` with a different email and confirm Access denies it.
