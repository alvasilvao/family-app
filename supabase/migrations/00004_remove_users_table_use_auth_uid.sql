-- Drop all existing RLS policies
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "recipes_select" on public.recipes;
drop policy if exists "recipes_insert" on public.recipes;
drop policy if exists "recipes_delete" on public.recipes;
drop policy if exists "ingredients_select" on public.ingredients;
drop policy if exists "ingredients_insert" on public.ingredients;
drop policy if exists "ingredients_delete" on public.ingredients;
drop policy if exists "plans_select_own" on public.weekly_plans;
drop policy if exists "plans_insert_own" on public.weekly_plans;
drop policy if exists "plans_update_own" on public.weekly_plans;

-- Drop FK constraints referencing users table
alter table public.recipes drop constraint if exists recipes_user_id_fkey;
alter table public.weekly_plans drop constraint if exists weekly_plans_user_id_fkey;

-- Change user_id columns to reference auth.uid() directly (uuid, no FK to public table)
-- recipes.user_id is already uuid, just needs to store auth.uid() now
-- weekly_plans.user_id same

-- Drop users table
drop table if exists public.users;

-- ============================================================
-- New RLS policies — all require auth.uid() IS NOT NULL
-- ============================================================

-- Recipes: authenticated users can read built-in + own
create policy "recipes_select" on public.recipes for select to authenticated using (
  is_built_in = true or user_id = auth.uid()
);
create policy "recipes_insert" on public.recipes for insert to authenticated with check (
  user_id = auth.uid()
);
create policy "recipes_delete" on public.recipes for delete to authenticated using (
  is_built_in = false and user_id = auth.uid()
);

-- Ingredients: authenticated users can read if recipe is built-in or own
create policy "ingredients_select" on public.ingredients for select to authenticated using (
  recipe_id in (select id from public.recipes where is_built_in = true or user_id = auth.uid())
);
create policy "ingredients_insert" on public.ingredients for insert to authenticated with check (
  recipe_id in (select id from public.recipes where user_id = auth.uid())
);
create policy "ingredients_delete" on public.ingredients for delete to authenticated using (
  recipe_id in (select id from public.recipes where user_id = auth.uid())
);

-- Weekly plans: authenticated users can only access own
create policy "plans_select_own" on public.weekly_plans for select to authenticated using (
  user_id = auth.uid()
);
create policy "plans_insert_own" on public.weekly_plans for insert to authenticated with check (
  user_id = auth.uid()
);
create policy "plans_update_own" on public.weekly_plans for update to authenticated using (
  user_id = auth.uid()
);
