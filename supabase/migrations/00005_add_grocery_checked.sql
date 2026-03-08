alter table public.weekly_plans
  add column if not exists grocery_checked jsonb not null default '{}';
