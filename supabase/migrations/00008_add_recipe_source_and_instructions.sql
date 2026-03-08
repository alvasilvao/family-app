-- Add source URL and preparation instructions to recipes
alter table public.recipes add column if not exists source_url text not null default '';
alter table public.recipes add column if not exists instructions text not null default '';
