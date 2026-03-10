-- Server-side ratings aggregation function
-- Replaces fetching all rows and aggregating in JS

create or replace function get_recipe_ratings(p_user_id uuid)
returns table (
  recipe_id uuid,
  avg_rating numeric,
  rating_count int,
  user_rating smallint
)
language sql stable
as $$
  select
    rr.recipe_id,
    avg(rr.rating)::numeric as avg_rating,
    count(*)::int as rating_count,
    max(case when rr.user_id = p_user_id then rr.rating end)::smallint as user_rating
  from public.recipe_ratings rr
  group by rr.recipe_id;
$$;
