-- Favorite ingredients: reusable shopping list items
CREATE TABLE favorite_ingredients (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  category   text,
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorite_ingredients
  ADD CONSTRAINT favorite_ingredients_user_name_unique UNIQUE (user_id, name);

ALTER TABLE favorite_ingredients ENABLE ROW LEVEL SECURITY;

-- Household sharing: all authenticated users can read
CREATE POLICY "favorite_ingredients_select"
  ON favorite_ingredients FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "favorite_ingredients_insert"
  ON favorite_ingredients FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorite_ingredients_delete"
  ON favorite_ingredients FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
