# Film Fatale

Film Fatale is a public movie and TV discovery app with a private, single-owner
library for watch, rating, and episode history. It runs as a full-stack Next.js
application on Cloudflare Workers.

## Architecture

- Next.js 16 and React 19
- Cloudflare Workers via the OpenNext adapter
- Cloudflare Access for single-owner authentication
- Cloudflare D1 for viewing and episode history
- Server-side TMDB proxy so the API key never reaches the browser

Only `/admin` is protected by Cloudflare Access. It acts as the owner login
gateway and redirects a verified owner to `/library`. The rest of the catalog
is public. Owner controls and private API routes validate the Access JWT again
and only accept the exact email configured in
`CLOUDFLARE_ACCESS_ALLOWED_EMAIL`.

## Local development

Requirements: Node.js 20+, npm, and a TMDB API key.

```bash
npm install
cp .env.local.example .env.local
npx wrangler d1 migrations apply film-fatale --local
npm run dev
```

Add `TMDB_API_KEY` and your development email to `.env.local`. Local development
uses the stable `APP_OWNER_ID` identity without requiring a Cloudflare login.
Set `DEV_AUTH_DISABLED=true` to preview the public, signed-out experience.

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
| `CLOUDFLARE_ACCESS_TEAM_DOMAIN` | Access team domain, such as `team.cloudflareaccess.com` |
| `CLOUDFLARE_ACCESS_AUD` | Audience tag for the Access application |
| `CLOUDFLARE_ACCESS_ALLOWED_EMAIL` | The only email the app accepts |
| `APP_OWNER_ID` | Stable database owner key; keep it unchanged |
| `DEV_AUTH_DISABLED` | Optional local-only switch for the signed-out experience |

The D1 binding is named `DB` in `wrangler.jsonc`. Do not commit secrets; use
Wrangler secrets for production values.

## Deployment

See [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) for the external Cloudflare steps,
database setup, Access configuration, and deployment verification.

The production Worker is connected to the GitHub `main` branch through
Cloudflare Workers Builds. A successful build from `main` automatically updates
the live deployment. The default `workers.dev` hostname and branch preview URLs
are disabled; only the custom domains serve the app.

## Self-hosting

Other users can clone the repository and create their own Worker, D1 database,
TMDB key, and Access policy. Each deployment has its own private data.

## License

This project is available under the [MIT License](LICENSE).
