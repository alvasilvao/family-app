-- Re-apply ALL RLS policies to ensure they match the intended definitions.
-- Some policies were modified via the Supabase dashboard and drifted from the migrations.

-- == recipes ==
drop policy if exists "recipes_select" on public.recipes;
drop policy if exists "recipes_insert" on public.recipes;
drop policy if exists "recipes_update" on public.recipes;
drop policy if exists "recipes_delete" on public.recipes;

create policy "recipes_select" on public.recipes
  for select to authenticated using (true);
create policy "recipes_insert" on public.recipes
  for insert to authenticated with check (user_id = auth.uid());
create policy "recipes_update" on public.recipes
  for update to authenticated using (is_built_in = false and user_id = auth.uid());
create policy "recipes_delete" on public.recipes
  for delete to authenticated using (is_built_in = false and user_id = auth.uid());

-- == ingredients ==
drop policy if exists "ingredients_select" on public.ingredients;
drop policy if exists "ingredients_insert" on public.ingredients;
drop policy if exists "ingredients_update" on public.ingredients;
drop policy if exists "ingredients_delete" on public.ingredients;

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

-- == grocery_items ==
drop policy if exists "grocery_items_select" on public.grocery_items;
drop policy if exists "grocery_items_insert" on public.grocery_items;
drop policy if exists "grocery_items_update" on public.grocery_items;
drop policy if exists "grocery_items_delete" on public.grocery_items;

create policy "grocery_items_select" on public.grocery_items
  for select to authenticated using (true);
create policy "grocery_items_insert" on public.grocery_items
  for insert to authenticated with check (added_by = auth.uid());
create policy "grocery_items_update" on public.grocery_items
  for update to authenticated using (true);
create policy "grocery_items_delete" on public.grocery_items
  for delete to authenticated using (added_by = auth.uid());

-- == meal_plans ==
drop policy if exists "meal_plans_select" on public.meal_plans;
drop policy if exists "meal_plans_insert" on public.meal_plans;
drop policy if exists "meal_plans_update" on public.meal_plans;
drop policy if exists "meal_plans_delete" on public.meal_plans;

create policy "meal_plans_select" on public.meal_plans
  for select to authenticated using (true);
create policy "meal_plans_insert" on public.meal_plans
  for insert to authenticated with check (true);
create policy "meal_plans_update" on public.meal_plans
  for update to authenticated using (true);
create policy "meal_plans_delete" on public.meal_plans
  for delete to authenticated using (true);
