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

## 4. Protect the whole hostname with Access

In the Cloudflare dashboard:

1. Go to **Zero Trust > Access controls > Applications**.
2. Add a **Self-hosted** application.
3. Add both `filmfatale.app` and `www.filmfatale.app`, with no path
   restriction.
4. Create an **Allow** policy whose Include selector is **Emails** and whose
   value is only your exact email address. Do not use Everyone, an email domain,
   or all valid emails.
5. Use the One-time PIN identity provider unless you prefer to connect Google.
6. Copy the application's **AUD tag** into the
   `CLOUDFLARE_ACCESS_AUD` Worker secret.
7. Set `CLOUDFLARE_ACCESS_TEAM_DOMAIN` to the team domain shown under Zero Trust
   settings, such as `your-team.cloudflareaccess.com`.
8. Redeploy after changing either secret.

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
2. The Access application covers both hostnames and uses the owner-only policy.
3. D1 data and authenticated writes have been verified.
4. TMDB browsing, ratings, watch history, and episode tracking run through the
   protected Worker.
