-- Support cooked values being either boolean true or ISO timestamp strings.
-- When a timestamp is stored, use it for last_used_date instead of the plan start_date.
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
      case
        when jsonb_typeof(entry.value) = 'string'
          then (entry.value #>> '{}')::date
        else mp.start_date
      end as used_date
    from public.meal_plans mp,
         jsonb_each(mp.cooked) as entry
    where entry.value != 'false'::jsonb
  ),
  stats as (
    select
      u.recipe_id,
      count(*)::int as total_count,
      max(u.used_date) as last_used_date
    from usage u
    group by u.recipe_id
  ),
  ratings as (
    select
      rr.recipe_id,
      avg(rr.rating)::numeric as avg_rating
    from public.recipe_ratings rr
    group by rr.recipe_id
  ),
  all_recipes as (
    select
      r.id as recipe_id,
      coalesce(s.total_count, 0) as total_count,
      s.last_used_date,
      case when s.last_used_date is not null then
        greatest(round((ref_date - s.last_used_date)::numeric / 7.0)::int, 0)
      else null end as weeks_since_last,
      rt.avg_rating
    from public.recipes r
    left join stats s on s.recipe_id = r.id
    left join ratings rt on rt.recipe_id = r.id
  )
  select
    ar.recipe_id,
    ar.total_count,
    ar.last_used_date,
    ar.weeks_since_last,
    round(
      (ln(ar.total_count + 1) * 5)::numeric
      + least(coalesce(ar.weeks_since_last, 8), 8)
      + (coalesce(ar.avg_rating, 3) - 3) * 1.5
    , 1) as score
  from all_recipes ar
  order by score desc, ar.recipe_id;
$$;
