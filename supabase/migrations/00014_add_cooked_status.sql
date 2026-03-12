-- Add 'cooked' as a valid meal plan status.
-- A plan transitions to 'cooked' automatically when every recipe in the basket
-- has been marked as cooked.

alter table meal_plans
  drop constraint meal_plans_status_check,
  add  constraint meal_plans_status_check
       check (status in ('open', 'closed', 'closed_no_shop', 'cooked'));
