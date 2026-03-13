-- ============================================================
-- Squashed schema: all tables, indexes, RLS, functions, storage
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
  emoji text not null default '',
  color text not null default '#7ba7a7',
  is_built_in boolean not null default false,
  user_id uuid,
  created_at timestamptz default now(),
  source_url text not null default '',
  instructions text not null default '',
  image_path text
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,
  per_serving float not null,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  calories float,
  unique(recipe_id, name, unit)
);

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  basket jsonb not null default '{}',
  bought_ingredients jsonb not null default '{}',
  cooked jsonb not null default '{}',
  status text not null default 'open' check (status in ('open', 'closed', 'closed_no_shop', 'cooked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  added_by uuid not null references auth.users(id),
  bought_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.grocery_items is 'Shared-household: all authenticated users can read items and toggle bought status.';

create table if not exists public.recipe_ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(recipe_id, user_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text not null default '',
  created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

comment on table public.notes is 'Shared-household: all authenticated users can read/update notes collaboratively.';

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  due_date date,
  completed_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.todos is 'Shared-household: all authenticated users can read/update todos collaboratively.';

create table if not exists public.media_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  overview text default '',
  poster_path text default '',
  release_date text default '',
  status text not null default 'want_to_watch' check (status in ('watched', 'want_to_watch')),
  rating smallint check (rating is null or (rating >= 1 and rating <= 5)),
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, tmdb_id, media_type)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

create table if not exists public.favorite_ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  user_id uuid not null references auth.users(id),
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- -------------------------------------------------------
-- Indexes
-- -------------------------------------------------------

create index if not exists idx_recipes_user_id on public.recipes(user_id);
create index if not exists idx_recipes_built_in on public.recipes(is_built_in);
create index if not exists idx_ingredients_recipe_id on public.ingredients(recipe_id);
create index if not exists idx_meal_plans_start_date on public.meal_plans(start_date desc);
create index if not exists idx_meal_plans_status on public.meal_plans(status);
create index if not exists idx_recipe_ratings_recipe_id on public.recipe_ratings(recipe_id);
create index if not exists idx_recipe_ratings_user_id on public.recipe_ratings(user_id);
create index if not exists idx_media_watchlist_user on public.media_watchlist(user_id);

-- -------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------

alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.meal_plans enable row level security;
alter table public.grocery_items enable row level security;
alter table public.recipe_ratings enable row level security;
alter table public.notes enable row level security;
alter table public.todos enable row level security;
alter table public.media_watchlist enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.favorite_ingredients enable row level security;

-- recipes
create policy "recipes_select" on public.recipes
  for select to authenticated using (true);
create policy "recipes_insert" on public.recipes
  for insert to authenticated with check (user_id = auth.uid());
create policy "recipes_update" on public.recipes
  for update to authenticated using (is_built_in = false and user_id = auth.uid());
create policy "recipes_delete" on public.recipes
  for delete to authenticated using (is_built_in = false and user_id = auth.uid());

-- ingredients
create policy "ingredients_select" on public.ingredients
  for select to authenticated using (true);
create policy "ingredients_insert" on public.ingredients
  for insert to authenticated with check (
    recipe_id in (select id from public.recipes where user_id = auth.uid())
  );
create policy "ingredients_update" on public.ingredients
  for update to authenticated using (
    recipe_id in (select id from public.recipes where user_id = auth.uid())
  );
create policy "ingredients_delete" on public.ingredients
  for delete to authenticated using (
    recipe_id in (select id from public.recipes where user_id = auth.uid())
  );

-- meal_plans
create policy "meal_plans_select" on public.meal_plans
  for select to authenticated using (true);
create policy "meal_plans_insert" on public.meal_plans
  for insert to authenticated with check (true);
create policy "meal_plans_update" on public.meal_plans
  for update to authenticated using (true);
create policy "meal_plans_delete" on public.meal_plans
  for delete to authenticated using (true);

-- grocery_items
create policy "grocery_items_select" on public.grocery_items
  for select to authenticated using (true);
create policy "grocery_items_insert" on public.grocery_items
  for insert to authenticated with check (added_by = auth.uid());
create policy "grocery_items_update" on public.grocery_items
  for update to authenticated using (true);
create policy "grocery_items_delete" on public.grocery_items
  for delete to authenticated using (added_by = auth.uid());

-- recipe_ratings
create policy "recipe_ratings_select" on public.recipe_ratings
  for select to authenticated using (true);
create policy "recipe_ratings_insert" on public.recipe_ratings
  for insert to authenticated with check (user_id = auth.uid());
create policy "recipe_ratings_update" on public.recipe_ratings
  for update to authenticated using (user_id = auth.uid());
create policy "recipe_ratings_delete" on public.recipe_ratings
  for delete to authenticated using (user_id = auth.uid());

-- notes
create policy "Authenticated users can read all notes" on public.notes
  for select to authenticated using (true);
create policy "Authenticated users can insert notes" on public.notes
  for insert to authenticated with check (created_by = auth.uid());
create policy "Authenticated users can update any note" on public.notes
  for update to authenticated using (true);
create policy "Only creator can delete notes" on public.notes
  for delete to authenticated using (created_by = auth.uid());

-- todos
create policy "Authenticated users can read all todos" on public.todos
  for select to authenticated using (true);
create policy "Authenticated users can insert todos" on public.todos
  for insert to authenticated with check (created_by = auth.uid());
create policy "Authenticated users can update any todo" on public.todos
  for update to authenticated using (true);
create policy "Only creator can delete todos" on public.todos
  for delete to authenticated using (created_by = auth.uid());

-- media_watchlist
create policy "Authenticated users can view all media" on public.media_watchlist
  for select to authenticated using (true);
create policy "Authenticated users can insert media" on public.media_watchlist
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Authenticated users can update media" on public.media_watchlist
  for update to authenticated using (true);
create policy "Creator can delete media" on public.media_watchlist
  for delete to authenticated using (auth.uid() = user_id);

-- push_subscriptions
create policy "Users can manage own subscriptions" on public.push_subscriptions
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- favorite_ingredients
create policy "favorite_ingredients_select" on public.favorite_ingredients
  for select to authenticated using (true);
create policy "favorite_ingredients_insert" on public.favorite_ingredients
  for insert to authenticated with check (auth.uid() = user_id);
create policy "favorite_ingredients_update" on public.favorite_ingredients
  for update to authenticated using (auth.uid() = user_id);
create policy "favorite_ingredients_delete" on public.favorite_ingredients
  for delete to authenticated using (auth.uid() = user_id);

-- -------------------------------------------------------
-- Triggers
-- -------------------------------------------------------

create or replace function public.update_media_watchlist_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger media_watchlist_updated_at
  before update on public.media_watchlist
  for each row execute function public.update_media_watchlist_updated_at();

-- -------------------------------------------------------
-- Storage: recipe images
-- -------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Anyone can read recipe images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-images');

CREATE POLICY "Users can upload own recipe images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own recipe images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own recipe images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- -------------------------------------------------------
-- Functions
-- -------------------------------------------------------

create or replace function public.get_ranked_recipes(ref_date date default current_date)
returns table (
  recipe_id uuid,
  total_count int,
  last_used_date date,
  weeks_since_last int,
  score numeric
)
language sql stable
as $$
  with usage as (
    select
      (entry.key)::uuid as recipe_id,
      case
        when jsonb_typeof(entry.value) = 'string'
          then (entry.value #>> '{}')::date
        else mp.start_date
      end as used_date
    from public.meal_plans mp,
         jsonb_each(mp.cooked) as entry
    where entry.value != 'false'::jsonb
  ),
  stats as (
    select
      u.recipe_id,
      count(*)::int as total_count,
      max(u.used_date) as last_used_date
    from usage u
    group by u.recipe_id
  ),
  ratings as (
    select
      rr.recipe_id,
      avg(rr.rating)::numeric as avg_rating
    from public.recipe_ratings rr
    group by rr.recipe_id
  ),
  all_recipes as (
    select
      r.id as recipe_id,
      coalesce(s.total_count, 0) as total_count,
      s.last_used_date,
      case when s.last_used_date is not null then
        greatest(round((ref_date - s.last_used_date)::numeric / 7.0)::int, 0)
      else null end as weeks_since_last,
      rt.avg_rating
    from public.recipes r
    left join stats s on s.recipe_id = r.id
    left join ratings rt on rt.recipe_id = r.id
  )
  select
    ar.recipe_id,
    ar.total_count,
    ar.last_used_date,
    ar.weeks_since_last,
    round(
      (ln(ar.total_count + 1) * 5)::numeric
      + least(coalesce(ar.weeks_since_last, 8), 8)
      + (coalesce(ar.avg_rating, 3) - 3) * 1.5
    , 1) as score
  from all_recipes ar
  order by score desc, ar.recipe_id;
$$;

create or replace function public.get_recipe_ratings(p_user_id uuid)
returns table (
  recipe_id uuid,
  avg_rating numeric,
  rating_count int,
  user_rating smallint
)
language sql stable
as $$
  select
    rr.recipe_id,
    avg(rr.rating)::numeric as avg_rating,
    count(*)::int as rating_count,
    max(case when rr.user_id = p_user_id then rr.rating end)::smallint as user_rating
  from public.recipe_ratings rr
  group by rr.recipe_id;
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
