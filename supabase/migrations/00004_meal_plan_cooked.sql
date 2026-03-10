-- Track which recipes in a meal plan have been cooked
alter table public.meal_plans
  add column if not exists cooked jsonb not null default '{}';
