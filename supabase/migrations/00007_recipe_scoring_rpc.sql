-- RPC function that scores recipes based on how often they've been cooked
-- and how recently, then returns them sorted by score descending.
--
-- score = ln(total_count + 1) * 5 + least(weeks_since_last, 8)
--   - Frequently cooked recipes (favorites) get a high base score
--   - Recipes not cooked recently get a recency boost (up to +8)
--   - Never-cooked recipes get a recency boost of 8

-- Helper: convert ISO week key (e.g. '2026-W10') to its Monday date
create or replace function week_key_to_monday(wk text)
returns date
language sql immutable
as $$
  select (
    make_date(split_part(wk, '-W', 1)::int, 1, 4)
    - ((extract(isodow from make_date(split_part(wk, '-W', 1)::int, 1, 4))::int - 1) || ' days')::interval
    + ((split_part(wk, '-W', 2)::int - 1) * 7 || ' days')::interval
  )::date;
$$;

create or replace function get_ranked_recipes(current_week_key text)
returns table (
  recipe_id uuid,
  total_count int,
  last_week_key text,
  weeks_since_last int,
  score numeric
)
language sql stable
as $$
  with usage as (
    -- Explode each basket JSONB into (recipe_id, week_key) rows,
    -- filtering out entries with servings <= 0
    select
      (entry.key)::uuid as recipe_id,
      wp.week_key
    from public.weekly_plans wp,
         jsonb_each(wp.basket) as entry
    where (entry.value)::int > 0
  ),
  stats as (
    select
      u.recipe_id,
      count(*)::int as total_count,
      max(u.week_key) as last_week_key
    from usage u
    group by u.recipe_id
  ),
  all_recipes as (
    select
      r.id as recipe_id,
      coalesce(s.total_count, 0) as total_count,
      s.last_week_key,
      case when s.last_week_key is not null and current_week_key != '' then
        round(
          extract(epoch from (
            week_key_to_monday(current_week_key) - week_key_to_monday(s.last_week_key)
          )) / 604800.0
        )::int
      else null end as weeks_since_last
    from public.recipes r
    left join stats s on s.recipe_id = r.id
  )
  select
    ar.recipe_id,
    ar.total_count,
    ar.last_week_key,
    ar.weeks_since_last,
    round(
      ln(ar.total_count + 1) * 5
      + least(coalesce(ar.weeks_since_last, 8), 8)
    , 1) as score
  from all_recipes ar
  order by score desc, ar.recipe_id;
$$;
