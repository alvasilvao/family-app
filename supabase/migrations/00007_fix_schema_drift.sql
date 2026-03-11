-- Fix schema drift: align remote DB with migration-defined schema
--
-- 1. Reset emoji default from '🥘' back to '' (as defined in 00001)
alter table public.recipes alter column emoji set default '';

-- 2. Restore get_ranked_recipes to the migration-defined version
--    (remote had a stale rewrite using weekly_plans/week_key)
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
