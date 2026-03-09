-- Standalone grocery shopping list (shared across all authenticated users)
create table grocery_items (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  added_by   uuid not null references auth.users(id),
  bought_at  timestamptz,
  created_at timestamptz not null default now()
);

alter table grocery_items enable row level security;

-- All authenticated users can see all items
create policy "grocery_items_select" on grocery_items
  for select to authenticated using (true);

-- Authenticated users can insert with their own uid
create policy "grocery_items_insert" on grocery_items
  for insert to authenticated with check (added_by = auth.uid());

-- Anyone authenticated can mark items as bought (update bought_at)
create policy "grocery_items_update" on grocery_items
  for update to authenticated using (true);

-- Only the person who added can delete
create policy "grocery_items_delete" on grocery_items
  for delete to authenticated using (added_by = auth.uid());
