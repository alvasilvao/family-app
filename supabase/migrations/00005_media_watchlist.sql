-- Media watchlist: track movies and TV shows
create table media_watchlist (
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

  -- prevent duplicate entries per user
  unique(user_id, tmdb_id, media_type)
);

-- Index for fast user queries
create index idx_media_watchlist_user on media_watchlist(user_id);

-- RLS: shared household model (same as notes/todos)
alter table media_watchlist enable row level security;

create policy "Authenticated users can view all media" on media_watchlist
  for select to authenticated using (true);

create policy "Authenticated users can insert media" on media_watchlist
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Authenticated users can update media" on media_watchlist
  for update to authenticated using (true);

create policy "Creator can delete media" on media_watchlist
  for delete to authenticated using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_media_watchlist_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger media_watchlist_updated_at
  before update on media_watchlist
  for each row execute function update_media_watchlist_updated_at();
