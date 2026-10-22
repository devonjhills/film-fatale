# Film Fatale

Film Fatale is a private movie and TV discovery app with personal watch,
rating, and episode history. It runs as a full-stack Next.js application on
Cloudflare Workers.

## Architecture

- Next.js 15 and React 19
- Cloudflare Workers via the OpenNext adapter
- Sign in with Google for a single owner
- Cloudflare D1 for viewing and episode history
- Server-side TMDB proxy so the API key never reaches the browser

Browsing is public. The library and every write need the owner to sign in with
Google, and the callback only accepts the verified email in `ALLOWED_EMAIL`.
After that, requests are checked against a signed session cookie, with no
database query or outside request.

## Local development

Requirements: Node.js 20+, npm, and a TMDB API key.

```bash
npm install
cp .env.local.example .env.local
npx wrangler d1 migrations apply film-fatale --local
npm run dev
```

Add `TMDB_API_KEY` and your development email to `.env.local`. Local development
uses the stable `APP_OWNER_ID` identity without signing in; set
`DEV_AUTH_DISABLED=true` to see the signed-out site.

## Commands

```bash
npm run dev                 # Next.js development server with local D1
npm run build               # Standard production/type check
npm run build:cloudflare    # Build the Cloudflare Worker bundle
npm run preview:cloudflare  # Preview in the Workers runtime
npm run deploy:cloudflare   # Build and deploy
npm run cf-typegen          # Regenerate Cloudflare binding types
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `TMDB_API_KEY` | Server-only TMDB API key |
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `ALLOWED_EMAIL` | The only Google account allowed to sign in |
| `AUTH_SECRET` | 32+ random characters that sign session cookies |
| `APP_OWNER_ID` | Stable database owner key; keep it unchanged |

The D1 binding is named `DB` in `wrangler.jsonc`. Do not commit secrets; use
Wrangler secrets for production values.

## Deployment

See [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) for the external Cloudflare steps,
database setup, Google sign-in, and deployment verification.

The production Worker is connected to the GitHub `main` branch through
Cloudflare Workers Builds. A successful build from `main` automatically updates
the live deployment. The default `workers.dev` hostname and branch preview URLs
are disabled; only the Access-protected custom domains serve the app.

## Self-hosting

Other users can clone the repository and create their own Worker, D1 database,
TMDB key, and Access policy. Each deployment has its own private data.

## License

This project is available under the [MIT License](LICENSE).
