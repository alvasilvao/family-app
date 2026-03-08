-- Users table (synced from Supabase Auth)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  supabase_id uuid unique not null,
  created_at timestamptz default now()
);

-- Recipes
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cook_time text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  emoji text not null default '🥘',
  color text not null default '#7ba7a7',
  is_built_in boolean not null default false,
  user_id uuid references public.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Ingredients (normalized, per recipe)
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,
  per_serving float not null,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  unique(recipe_id, name, unit)
);

-- Weekly plans (basket is JSON: { "recipe-uuid": servings })
create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  week_key text not null,
  basket jsonb not null default '{}',
  unique(user_id, week_key)
);

-- Indexes
create index if not exists idx_recipes_user_id on public.recipes(user_id);
create index if not exists idx_recipes_built_in on public.recipes(is_built_in);
create index if not exists idx_ingredients_recipe_id on public.ingredients(recipe_id);
create index if not exists idx_weekly_plans_user_week on public.weekly_plans(user_id, week_key);
