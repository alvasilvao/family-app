-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.weekly_plans enable row level security;

-- Users: can read/update own row
create policy "users_select_own" on public.users for select using (supabase_id = auth.uid());
create policy "users_insert_own" on public.users for insert with check (supabase_id = auth.uid());
create policy "users_update_own" on public.users for update using (supabase_id = auth.uid());

-- Recipes: can read built-in + own; can insert/delete own
create policy "recipes_select" on public.recipes for select using (
  is_built_in = true or user_id in (select id from public.users where supabase_id = auth.uid())
);
create policy "recipes_insert" on public.recipes for insert with check (
  user_id in (select id from public.users where supabase_id = auth.uid())
);
create policy "recipes_delete" on public.recipes for delete using (
  is_built_in = false and user_id in (select id from public.users where supabase_id = auth.uid())
);

-- Ingredients: readable if recipe is readable; insertable if recipe is own
create policy "ingredients_select" on public.ingredients for select using (
  recipe_id in (
    select id from public.recipes where is_built_in = true
    union
    select id from public.recipes where user_id in (select id from public.users where supabase_id = auth.uid())
  )
);
create policy "ingredients_insert" on public.ingredients for insert with check (
  recipe_id in (select id from public.recipes where user_id in (select id from public.users where supabase_id = auth.uid()))
);
create policy "ingredients_delete" on public.ingredients for delete using (
  recipe_id in (select id from public.recipes where user_id in (select id from public.users where supabase_id = auth.uid()))
);

-- Weekly plans: own only
create policy "plans_select_own" on public.weekly_plans for select using (
  user_id in (select id from public.users where supabase_id = auth.uid())
);
create policy "plans_insert_own" on public.weekly_plans for insert with check (
  user_id in (select id from public.users where supabase_id = auth.uid())
);
create policy "plans_update_own" on public.weekly_plans for update using (
  user_id in (select id from public.users where supabase_id = auth.uid())
);
