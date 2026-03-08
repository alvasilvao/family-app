-- Allow users to update their own non-built-in recipes
create policy "recipes_update" on public.recipes for update to authenticated
  using (is_built_in = false and user_id = auth.uid());

-- Allow users to update ingredients of their own recipes
create policy "ingredients_update" on public.ingredients for update to authenticated
  using (recipe_id in (select id from public.recipes where user_id = auth.uid()));

