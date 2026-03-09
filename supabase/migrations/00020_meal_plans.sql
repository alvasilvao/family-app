-- ============================================================
-- Restructure: weekly_plans → meal_plans (date-based, closeable)
-- ============================================================

-- New meal_plans table
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  basket jsonb not null default '{}',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_meal_plans_start_date on public.meal_plans(start_date desc);
create index idx_meal_plans_status on public.meal_plans(status);

alter table public.meal_plans enable row level security;

create policy "meal_plans_select" on public.meal_plans
  for select to authenticated using (true);
create policy "meal_plans_insert" on public.meal_plans
  for insert to authenticated with check (true);
create policy "meal_plans_update" on public.meal_plans
  for update to authenticated using (true);
create policy "meal_plans_delete" on public.meal_plans
  for delete to authenticated using (true);

-- Add source_plan_id to grocery_items
alter table public.grocery_items
  add column if not exists source_plan_id uuid references public.meal_plans(id) on delete set null;

-- Migrate existing weekly_plans → meal_plans as closed plans
insert into public.meal_plans (name, start_date, end_date, basket, status, created_at)
select
  'Week ' || split_part(week_key, '-W', 2) || ', ' || split_part(week_key, '-W', 1),
  week_key_to_monday(week_key),
  week_key_to_monday(week_key) + interval '6 days',
  basket,
  'closed',
  coalesce(
    (select min(r.created_at) from public.recipes r where r.id::text in (select jsonb_object_keys(basket))),
    now()
  )
from public.weekly_plans
where basket != '{}'::jsonb;

-- Updated get_ranked_recipes: reads from meal_plans, takes ref_date
create or replace function get_ranked_recipes(ref_date date default current_date)
returns table (
  recipe_id uuid,
  total_count int,
  last_used_date date,
  weeks_since_last int,
  score numeric
)
language sql stable
as $$
  with usage as (
    select
      (entry.key)::uuid as recipe_id,
      mp.start_date
    from public.meal_plans mp,
         jsonb_each(mp.basket) as entry
    where (entry.value)::int > 0
  ),
  stats as (
    select
      u.recipe_id,
      count(*)::int as total_count,
      max(u.start_date) as last_used_date
    from usage u
    group by u.recipe_id
  ),
  all_recipes as (
    select
      r.id as recipe_id,
      coalesce(s.total_count, 0) as total_count,
      s.last_used_date,
      case when s.last_used_date is not null then
        greatest(round((ref_date - s.last_used_date)::numeric / 7.0)::int, 0)
      else null end as weeks_since_last
    from public.recipes r
    left join stats s on s.recipe_id = r.id
  )
  select
    ar.recipe_id,
    ar.total_count,
    ar.last_used_date,
    ar.weeks_since_last,
    round(
      (ln(ar.total_count + 1) * 5)::numeric
      + least(coalesce(ar.weeks_since_last, 8), 8)
    , 1) as score
  from all_recipes ar
  order by score desc, ar.recipe_id;
$$;

-- Drop old objects
drop policy if exists "plans_select" on public.weekly_plans;
drop policy if exists "plans_insert" on public.weekly_plans;
drop policy if exists "plans_update" on public.weekly_plans;
drop table if exists public.weekly_plans;
drop function if exists week_key_to_monday(text);
