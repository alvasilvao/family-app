-- ============================================================
-- Full schema: tables, indexes, RLS, seed data, and functions
-- (Squashed from migrations 00001–00010)
-- ============================================================

-- -------------------------------------------------------
-- Tables
-- -------------------------------------------------------

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cook_time text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  emoji text not null default '🥘',
  color text not null default '#7ba7a7',
  is_built_in boolean not null default false,
  user_id uuid,
  created_at timestamptz default now(),
  source_url text not null default '',
  instructions text not null default ''
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,
  per_serving float not null,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  unique(recipe_id, name, unit)
);

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  week_key text not null unique,
  basket jsonb not null default '{}',
  grocery_checked jsonb not null default '{}'
);

-- -------------------------------------------------------
-- Indexes
-- -------------------------------------------------------

create index if not exists idx_recipes_user_id on public.recipes(user_id);
create index if not exists idx_recipes_built_in on public.recipes(is_built_in);
create index if not exists idx_ingredients_recipe_id on public.ingredients(recipe_id);

-- -------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------

alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.weekly_plans enable row level security;

-- Recipes: any authenticated user can read all recipes
create policy "recipes_select" on public.recipes
  for select to authenticated using (true);

-- Recipes: users can only insert their own
create policy "recipes_insert" on public.recipes
  for insert to authenticated with check (user_id = auth.uid());

-- Recipes: users can only update their own non-built-in recipes
create policy "recipes_update" on public.recipes
  for update to authenticated using (is_built_in = false and user_id = auth.uid());

-- Recipes: users can only delete their own non-built-in recipes
create policy "recipes_delete" on public.recipes
  for delete to authenticated using (is_built_in = false and user_id = auth.uid());

-- Ingredients: any authenticated user can read all
create policy "ingredients_select" on public.ingredients
  for select to authenticated using (true);

-- Ingredients: users can only insert for their own recipes
create policy "ingredients_insert" on public.ingredients
  for insert to authenticated with check (
    recipe_id in (select id from public.recipes where user_id = auth.uid())
  );

-- Ingredients: users can only update for their own recipes
create policy "ingredients_update" on public.ingredients
  for update to authenticated using (
    recipe_id in (select id from public.recipes where user_id = auth.uid())
  );

-- Ingredients: users can only delete for their own recipes
create policy "ingredients_delete" on public.ingredients
  for delete to authenticated using (
    recipe_id in (select id from public.recipes where user_id = auth.uid())
  );

-- Weekly plans: any authenticated user can read/write all plans
create policy "plans_select" on public.weekly_plans
  for select to authenticated using (true);
create policy "plans_insert" on public.weekly_plans
  for insert to authenticated with check (true);
create policy "plans_update" on public.weekly_plans
  for update to authenticated using (true);

-- -------------------------------------------------------
-- Functions
-- -------------------------------------------------------

-- Helper: convert ISO week key (e.g. '2026-W10') to its Monday date
create or replace function week_key_to_monday(wk text)
returns date
language sql immutable
as $$
  select (
    make_date(split_part(wk, '-W', 1)::int, 1, 4)
    - ((extract(isodow from make_date(split_part(wk, '-W', 1)::int, 1, 4))::int - 1) || ' days')::interval
    + ((split_part(wk, '-W', 2)::int - 1) * 7 || ' days')::interval
  )::date;
$$;

create or replace function get_ranked_recipes(current_week_key text)
returns table (
  recipe_id uuid,
  total_count int,
  last_week_key text,
  weeks_since_last int,
  score numeric
)
language sql stable
as $$
  with usage as (
    select
      (entry.key)::uuid as recipe_id,
      wp.week_key
    from public.weekly_plans wp,
         jsonb_each(wp.basket) as entry
    where (entry.value)::int > 0
  ),
  stats as (
    select
      u.recipe_id,
      count(*)::int as total_count,
      max(u.week_key) as last_week_key
    from usage u
    group by u.recipe_id
  ),
  all_recipes as (
    select
      r.id as recipe_id,
      coalesce(s.total_count, 0) as total_count,
      s.last_week_key,
      case when s.last_week_key is not null and current_week_key != '' then
        round(
          (week_key_to_monday(current_week_key) - week_key_to_monday(s.last_week_key))::numeric / 7.0
        )::int
      else null end as weeks_since_last
    from public.recipes r
    left join stats s on s.recipe_id = r.id
  )
  select
    ar.recipe_id,
    ar.total_count,
    ar.last_week_key,
    ar.weeks_since_last,
    round(
      (ln(ar.total_count + 1) * 5)::numeric
      + least(coalesce(ar.weeks_since_last, 8), 8)
    , 1) as score
  from all_recipes ar
  order by score desc, ar.recipe_id;
$$;

-- -------------------------------------------------------
-- Seed data: built-in recipes
-- -------------------------------------------------------

insert into public.recipes (id, name, cook_time, description, tags, emoji, color, is_built_in)
values (
  'a1111111-1111-1111-1111-111111111111',
  'Creamy Chickpea Soup',
  '40 min',
  'Silky blended chickpea soup with crispy chickpea croutons, tahini, garlic, and a bright hit of lemon — served with pita chips.',
  '{"Vegetarian","Healthy","Comfort Food"}',
  '🫘',
  '#c9a84c',
  true
) on conflict do nothing;

insert into public.ingredients (name, unit, per_serving, recipe_id) values
  ('Chickpeas (canned, drained)', 'g',    192,   'a1111111-1111-1111-1111-111111111111'),
  ('Extra-virgin olive oil',      'tbsp', 0.8,   'a1111111-1111-1111-1111-111111111111'),
  ('Garlic cloves',               'pcs',  0.8,   'a1111111-1111-1111-1111-111111111111'),
  ('Cumin seeds',                 'tsp',  0.2,   'a1111111-1111-1111-1111-111111111111'),
  ('Crushed red pepper flakes',   'tsp',  0.1,   'a1111111-1111-1111-1111-111111111111'),
  ('Onion',                       'pcs',  0.2,   'a1111111-1111-1111-1111-111111111111'),
  ('Ground cumin',                'tsp',  0.2,   'a1111111-1111-1111-1111-111111111111'),
  ('Vegetable broth',             'ml',   166,   'a1111111-1111-1111-1111-111111111111'),
  ('Tahini',                      'tbsp', 1.1,   'a1111111-1111-1111-1111-111111111111'),
  ('Fresh cilantro',              'g',    3,     'a1111111-1111-1111-1111-111111111111'),
  ('Lemon',                       'pcs',  0.2,   'a1111111-1111-1111-1111-111111111111'),
  ('Pita chips',                  'g',    20,    'a1111111-1111-1111-1111-111111111111'),
  ('Smoked paprika',              'tsp',  0.1,   'a1111111-1111-1111-1111-111111111111'),
  ('Fine sea salt',               'tsp',  0.2,   'a1111111-1111-1111-1111-111111111111')
on conflict do nothing;

insert into public.recipes (id, name, cook_time, description, tags, emoji, color, is_built_in)
values (
  'b2222222-2222-2222-2222-222222222222',
  'Halloumi with Tomatoes & Beans',
  '25 min',
  'Broiled halloumi over a juicy tomato and cannellini bean pan sauce with garlic, honey, and lemon. Serve with crusty bread.',
  '{"Vegetarian","Healthy","Quick"}',
  '🧀',
  '#d4845a',
  true
) on conflict do nothing;

insert into public.ingredients (name, unit, per_serving, recipe_id) values
  ('Cherry tomatoes',       'g',      113,  'b2222222-2222-2222-2222-222222222222'),
  ('Halloumi',              'g',      57,   'b2222222-2222-2222-2222-222222222222'),
  ('Cannellini beans',      'g',      106,  'b2222222-2222-2222-2222-222222222222'),
  ('Olive oil',             'tbsp',   0.75, 'b2222222-2222-2222-2222-222222222222'),
  ('Garlic cloves',         'pcs',    0.5,  'b2222222-2222-2222-2222-222222222222'),
  ('Fresh parsley',         'tbsp',   0.25, 'b2222222-2222-2222-2222-222222222222'),
  ('Honey',                 'tsp',    0.25, 'b2222222-2222-2222-2222-222222222222'),
  ('Dried oregano',         'tsp',    0.13, 'b2222222-2222-2222-2222-222222222222'),
  ('Lemon',                 'pcs',    0.13, 'b2222222-2222-2222-2222-222222222222'),
  ('Crusty bread',          'slices', 2,    'b2222222-2222-2222-2222-222222222222'),
  ('Salt and black pepper', 'tsp',    0.25, 'b2222222-2222-2222-2222-222222222222')
on conflict do nothing;
