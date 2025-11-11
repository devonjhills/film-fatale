# Google OAuth Setup Guide

## Issue
The current Google OAuth client ID has been deleted from Google Cloud Console, causing authentication to fail.

## Solution: Create New OAuth Credentials

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### 2. Create OAuth 2.0 Client ID

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Select **Application type**: "Web application"
3. **Name**: "FilmFatale Production"
4. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `https://www.filmfatale.app` (for production)

5. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://www.filmfatale.app/api/auth/callback/google` (for production)

6. Click **"CREATE"**

### 3. Copy Credentials

After creating, you'll get:
- **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123xyz`)

### 4. Update Local Environment Variables

Edit `.env.local` and replace:
```bash
GOOGLE_CLIENT_ID=your-new-client-id-here
GOOGLE_CLIENT_SECRET=your-new-client-secret-here
```

### 5. Update Vercel Environment Variables

1. Go to: https://vercel.com/devons-projects/film-fatale/settings/environment-variables
2. Update or add:
   - `GOOGLE_CLIENT_ID` = your new client ID
   - `GOOGLE_CLIENT_SECRET` = your new client secret
3. Select all environments (Production, Preview, Development)
4. Click **"Save"**

### 6. Redeploy

After updating Vercel environment variables, trigger a new deployment:
```bash
git commit --allow-empty -m "Trigger redeployment for OAuth fix"
git push
```

Or use the Vercel dashboard to redeploy.

## Testing

1. **Local**: Run `npm run dev` and test Google sign-in at http://localhost:3000/signin
2. **Production**: Test at https://www.filmfatale.app/signin

## Current Configuration

The app is already configured to use these environment variables. No code changes are needed - just update the environment variables with valid credentials.

### Auth Configuration (`src/lib/auth.ts`)
- ✅ Supports Google OAuth when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- ✅ Uses correct base URL: `https://www.filmfatale.app` in production
- ✅ Database: Connected to Postgres on Vercel

### Redirect Configuration (`vercel.json`)
- ✅ Auth routes properly configured
- ✅ Redirects `/auth/*` to `/api/auth/*`
