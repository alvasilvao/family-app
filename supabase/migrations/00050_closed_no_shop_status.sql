-- Allow plans to be closed without adding ingredients to the shopping list
ALTER TABLE meal_plans DROP CONSTRAINT meal_plans_status_check;
ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_status_check CHECK (status IN ('open', 'closed', 'closed_no_shop'));
