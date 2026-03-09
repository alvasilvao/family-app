-- Make all recipes and ingredients visible to any authenticated user.
-- Previously only built-in recipes and the user's own recipes were readable.
-- Write/delete policies remain scoped to the owning user.

-- Recipes: open SELECT to all authenticated users
drop policy if exists "recipes_select" on public.recipes;
create policy "recipes_select" on public.recipes
  for select to authenticated
  using (true);

-- Ingredients: open SELECT to all authenticated users
drop policy if exists "ingredients_select" on public.ingredients;
create policy "ingredients_select" on public.ingredients
  for select to authenticated
  using (true);
