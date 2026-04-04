create table if not exists public.recipe_links (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null default '',
  note text not null default '',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_recipe_links_created_by on public.recipe_links(created_by);

alter table public.recipe_links enable row level security;

create policy "Authenticated users can read all recipe_links" on public.recipe_links
  for select to authenticated using (true);
create policy "Authenticated users can insert recipe_links" on public.recipe_links
  for insert to authenticated with check (created_by = auth.uid());
create policy "Only creator can delete recipe_links" on public.recipe_links
  for delete to authenticated using (created_by = auth.uid());
