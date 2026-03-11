# Family App

## Database Migrations

Migrations live in `supabase/migrations/` and are applied to the remote Supabase instance with:

```bash
npx supabase db push
```

This will prompt to confirm which pending migrations to apply. Answer `Y` to proceed.

## Tech Stack

- **Frontend**: Nuxt 3 (Vue 3) with TypeScript
- **Backend**: Nitro server routes (`server/api/`)
- **Database**: Supabase (PostgreSQL) with RLS
- **Deployment**: Cloudflare Pages
