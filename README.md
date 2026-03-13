# Family App

A collaborative household app built with Nuxt 3 and Supabase. Manage recipes, plan meals, generate shopping lists, track media, and share notes and to-dos with your household.

## Features

- **Recipe Management** — Create, edit, and browse recipes with ingredients, instructions, tags, images, and star ratings. Built-in recipe scoring ranks recipes based on usage frequency and recency.
- **Meal Planning** — Create plans with date ranges, assign recipes, and track open/closed plans.
- **Shopping Lists** — Auto-generate grocery lists from meal plans or add items manually. Shared across all users.
- **Shared Notes & To-dos** — Collaborative notes and task lists visible to all authenticated users.
- **PWA** — Installable on mobile and desktop with offline support.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Nuxt 3 (Vue 3), TypeScript          |
| Backend    | Nitro server routes                  |
| Database   | Supabase (PostgreSQL) with RLS       |
| Hosting    | Cloudflare Pages                     |
| PWA        | @vite-pwa/nuxt with Workbox          |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for running migrations)

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com/) and create a new project. Once it's ready, grab the following from **Project Settings > API**:

- **Project URL** — e.g. `https://xyz.supabase.co`
- **Anon public key** — starts with `eyJ...`
- **Project ref** — the `xyz` part of your project URL (used to link the CLI)

### 2. Configure authentication

In the Supabase dashboard, go to **Authentication > URL Configuration** and set:

- **Site URL** — `http://localhost:3000` for development (update to your production URL when deploying)
- **Redirect URLs** — add your app URL (e.g. `http://localhost:3000`, and your production URL later)

The app uses **email/password** authentication, which is enabled by default in Supabase. No additional auth providers need to be configured.

You'll need to create user accounts from the Supabase dashboard (**Authentication > Users > Add user**) or enable sign-up in the login page. All authenticated users share the same plans, shopping lists, notes, and to-dos — this is designed for a household, not multi-tenant use.

### 3. Clone and install

```bash
git clone https://github.com/your-username/family-app.git
cd family-app
npm install
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_KEY=your-anon-public-key
```

### 5. Run database migrations

Link the CLI to your project, then push all migrations:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

This creates all tables, Row-Level Security policies, storage buckets (for recipe images), and database functions in a single step. Confirm with `Y` when prompted.

### 6. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
app/
├── pages/           # Route pages (index, recipes, plans, shopping, notes, todos, profile)
├── components/      # Reusable Vue components
├── composables/     # Business logic (useRecipes, usePlans, useShopping, etc.)
├── middleware/       # Auth middleware
├── utils/           # Helpers (image compression, date utilities)
└── assets/css/      # Global styles

server/
├── api/             # REST API endpoints organized by resource
└── utils/           # Server helpers (Supabase client, validation)

supabase/
└── migrations/      # SQL migration files (applied with `supabase db push`)
```

## API Overview

| Resource   | Endpoints                                                    |
|------------|--------------------------------------------------------------|
| Recipes    | CRUD, image upload/delete, ratings, scoring                  |
| Plans      | CRUD, close/reopen                                           |
| Shopping   | CRUD, bulk toggle, plan ingredient management                |
| Notes      | CRUD, archive/unarchive                                      |
| Todos      | CRUD, toggle completion                                      |
| Media      | TMDB search, watchlist CRUD                                  |
| Notifications | Subscribe/unsubscribe, send push notifications            |

All endpoints require authentication via Supabase Auth. Row-Level Security enforces access control at the database level.

## Deployment

The project is configured for [Cloudflare Pages](https://pages.cloudflare.com/).

### External accounts required

| Service | Purpose | Sign up |
|---------|---------|---------|
| **Supabase** | Database, auth, file storage | [supabase.com](https://supabase.com/) |
| **Cloudflare** | Hosting (Pages + Workers) | [cloudflare.com](https://www.cloudflare.com/) |
| **OpenAI** | Recipe import via LLM | [platform.openai.com](https://platform.openai.com/) |
| **TMDB** | Movie/TV show search | [themoviedb.org](https://www.themoviedb.org/settings/api) |

### Environment variables

All secrets must be set in the **Cloudflare Pages dashboard** under **Settings > Environment variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL (`https://xyz.supabase.co`) |
| `SUPABASE_KEY` | Yes | Supabase **anon** public key (safe to expose to the browser) |
| `NUXT_SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase **service role** key (server-side only, bypasses RLS) |
| `NUXT_OPENAI_API_KEY` | Yes | OpenAI API key for recipe import |
| `NUXT_TMDB_API_KEY` | Yes | TMDB API key for media search |
| `NUXT_CRON_SECRET` | Yes | Shared secret between the cron worker and the app |
| `NUXT_VAPID_PRIVATE_KEY` | For push notifications | VAPID private key for Web Push |
| `NUXT_VAPID_EMAIL` | For push notifications | Contact email for Web Push |
| `NUXT_PUBLIC_VAPID_PUBLIC_KEY` | For push notifications | VAPID public key — must be set as **plaintext** (not encrypted) |

Generate VAPID keys with:

```bash
npx web-push generate-vapid-keys
```

Then set the **public** key in `wrangler.toml` (`NUXT_PUBLIC_VAPID_PUBLIC_KEY`) and the **private** key as the `NUXT_VAPID_PRIVATE_KEY` environment variable.

### Option A: Connect via Git (recommended)

1. Go to **Cloudflare Dashboard > Pages > Create a project**
2. Connect your GitHub/GitLab repo
3. Set the build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add all the environment variables from the table above
5. Deploy

### Option B: Manual deploy

```bash
npm run build
npx wrangler pages deploy dist
```

### Deploy the cron worker

A separate Cloudflare Worker sends weekly push notifications (Saturday 13:00 CET). Before deploying it:

1. Deploy: `npm run deploy:cron`
2. Set the secrets:
   ```bash
   cd workers/cron
   echo "https://your-app.pages.dev" | npx wrangler secret put APP_URL
   npx wrangler secret put CRON_SECRET
   ```

### After deploying

1. Update Supabase **Authentication > URL Configuration**:
   - **Site URL** — your production URL (e.g. `https://your-app.pages.dev`)
   - **Redirect URLs** — add the same production URL
2. Create user accounts from Supabase **Authentication > Users > Add user** (all users share the same household data)

### Preview locally

```bash
npm run preview
```

## Database Migrations

Migrations live in `supabase/migrations/` and are applied sequentially. To add a new migration:

```bash
npx supabase migration new your_migration_name
# Edit the generated SQL file, then:
npx supabase db push
```

## License

This project is licensed under the [MIT License](LICENSE).
