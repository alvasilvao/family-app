create table if not exists public.recipe_ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(recipe_id, user_id)
);

create index idx_recipe_ratings_recipe_id on public.recipe_ratings(recipe_id);
create index idx_recipe_ratings_user_id on public.recipe_ratings(user_id);

alter table public.recipe_ratings enable row level security;

create policy "recipe_ratings_select" on public.recipe_ratings
  for select to authenticated using (true);

create policy "recipe_ratings_insert" on public.recipe_ratings
  for insert to authenticated with check (user_id = auth.uid());

create policy "recipe_ratings_update" on public.recipe_ratings
  for update to authenticated using (user_id = auth.uid());

create policy "recipe_ratings_delete" on public.recipe_ratings
  for delete to authenticated using (user_id = auth.uid());
