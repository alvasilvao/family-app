-- Allow half-star ratings (1, 1.5, 2, … 5)

-- Change column type from smallint to numeric(2,1) and update constraint
alter table public.recipe_ratings
  alter column rating type numeric(2,1) using rating::numeric(2,1);

alter table public.recipe_ratings
  drop constraint recipe_ratings_rating_check;

alter table public.recipe_ratings
  add constraint recipe_ratings_rating_check
    check (rating >= 1 and rating <= 5 and (rating * 2) = trunc(rating * 2));

-- Recreate function with updated return type
create or replace function public.get_recipe_ratings(p_user_id uuid)
returns table (
  recipe_id uuid,
  avg_rating numeric,
  rating_count int,
  user_rating numeric(2,1)
)
language sql stable
as $$
  select
    rr.recipe_id,
    avg(rr.rating)::numeric as avg_rating,
    count(*)::int as rating_count,
    max(case when rr.user_id = p_user_id then rr.rating end)::numeric(2,1) as user_rating
  from public.recipe_ratings rr
  group by rr.recipe_id;
$$;
