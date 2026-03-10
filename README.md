# Food Planner

A collaborative meal planning app built with Nuxt 3 and Supabase. Manage recipes, plan meals, generate shopping lists, and share notes and to-dos with your household.

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
git clone https://github.com/your-username/food-app.git
cd food-app
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

All endpoints require authentication via Supabase Auth. Row-Level Security enforces access control at the database level.

## Deployment

The project is configured for [Cloudflare Pages](https://pages.cloudflare.com/).

### Option A: Connect via Git (recommended)

1. Go to **Cloudflare Dashboard > Pages > Create a project**
2. Connect your GitHub/GitLab repo
3. Set the build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add environment variables: `SUPABASE_URL` and `SUPABASE_KEY`
5. Deploy

### Option B: Manual deploy

```bash
npm run build
npx wrangler pages deploy dist
```

Make sure to set `SUPABASE_URL` and `SUPABASE_KEY` as environment variables in the Cloudflare Pages dashboard.

### After deploying

Update your Supabase **Authentication > URL Configuration** to include your production URL (e.g. `https://food-app.pages.dev`) in both the Site URL and Redirect URLs.

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
