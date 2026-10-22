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
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put ALLOWED_EMAIL
npx wrangler secret put AUTH_SECRET     # openssl rand -base64 32
npx wrangler secret put APP_OWNER_ID
```

Use `owner` for `APP_OWNER_ID` and never change it after importing data.

## 3. Deploy the Worker

```bash
npm run deploy:cloudflare
```

The default `*.workers.dev` hostname and branch preview URLs are disabled.
Production is served only from the custom domains declared in `wrangler.jsonc`.

## 4. Set up Google sign-in

1. In Google Cloud Console, go to **APIs & Services > OAuth consent screen**
   and create an **External** app. Add your email as a test user; the app can
   stay in Testing mode.
2. Under **Credentials**, create an **OAuth client ID** of type **Web
   application**.
3. Add both authorized redirect URIs:
   - `https://filmfatale.app/api/auth/callback`
   - `https://www.filmfatale.app/api/auth/callback`
4. Put the client ID and secret into the `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET` Worker secrets, and your exact address into
   `ALLOWED_EMAIL`.
5. Redeploy, then sign in from the footer's Owner link.

Cloudflare Access is no longer used. Delete the Access application for these
hostnames, or it will keep intercepting visitors before they reach the Worker,
and remove the old `CLOUDFLARE_ACCESS_*` secrets with `npx wrangler secret delete`.

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
2. Browsing is public; the library and all writes require the owner's Google
   sign-in.
3. D1 data and authenticated writes have been verified.
4. TMDB browsing, ratings, watch history, and episode tracking run through the
   Worker.
