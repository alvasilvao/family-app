-- Dynamic plan ingredients: compute shopping items from closed plans instead of inserting rows

-- Add bought_ingredients tracking to meal_plans
alter table public.meal_plans
  add column bought_ingredients jsonb not null default '{}';

-- Remove existing plan-sourced grocery items (now computed dynamically)
delete from public.grocery_items where source_plan_id is not null;

-- Drop the source_plan_id column
alter table public.grocery_items drop column if exists source_plan_id;
