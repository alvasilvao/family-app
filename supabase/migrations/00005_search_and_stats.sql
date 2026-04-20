-- Combined scores + ratings in a single RPC call
create or replace function public.get_recipe_stats(p_user_id uuid, ref_date date default current_date)
returns table (
  recipe_id      uuid,
  total_count    int,
  last_used_date date,
  weeks_since_last int,
  score          numeric,
  avg_rating     numeric,
  rating_count   int,
  user_rating    smallint
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
  usage_stats as (
    select
      u.recipe_id,
      count(*)::int       as total_count,
      max(u.used_date)    as last_used_date
    from usage u
    group by u.recipe_id
  ),
  ratings_agg as (
    select
      rr.recipe_id,
      avg(rr.rating)::numeric                                              as avg_rating,
      count(*)::int                                                        as rating_count,
      max(case when rr.user_id = p_user_id then rr.rating end)::smallint  as user_rating
    from public.recipe_ratings rr
    group by rr.recipe_id
  )
  select
    r.id                                                    as recipe_id,
    coalesce(s.total_count, 0)                              as total_count,
    s.last_used_date,
    case when s.last_used_date is not null
      then greatest(round((ref_date - s.last_used_date)::numeric / 7.0)::int, 0)
    end                                                     as weeks_since_last,
    round(
      (ln(coalesce(s.total_count, 0) + 1) * 5)::numeric
      + least(coalesce(
          case when s.last_used_date is not null
            then greatest(round((ref_date - s.last_used_date)::numeric / 7.0)::int, 0)
          end, 8), 8)
      + (coalesce(ra.avg_rating, 3) - 3) * 1.5
    , 1)                                                    as score,
    ra.avg_rating,
    coalesce(ra.rating_count, 0)                            as rating_count,
    ra.user_rating
  from public.recipes r
  left join usage_stats  s  on s.recipe_id  = r.id
  left join ratings_agg  ra on ra.recipe_id = r.id;
$$;

-- Full-text search across name, description, tags, and ingredient names
create or replace function public.search_recipes(search_query text)
returns table (
  id           uuid,
  name         text,
  cook_time    text,
  emoji        text,
  color        text,
  description  text,
  source_url   text,
  image_path   text,
  tags         text[],
  is_built_in  boolean,
  instructions text,
  created_at   timestamptz
)
language sql stable
as $$
  with ingredient_names as (
    select recipe_id, string_agg(name, ' ') as names
    from public.ingredients
    group by recipe_id
  ),
  recipe_vectors as (
    select
      r.*,
      to_tsvector('english',
        r.name || ' ' ||
        coalesce(r.description, '') || ' ' ||
        coalesce(array_to_string(r.tags, ' '), '') || ' ' ||
        coalesce(i.names, '')
      ) as tsv
    from public.recipes r
    left join ingredient_names i on i.recipe_id = r.id
  )
  select
    rv.id, rv.name, rv.cook_time, rv.emoji, rv.color, rv.description,
    rv.source_url, rv.image_path, rv.tags, rv.is_built_in, rv.instructions, rv.created_at
  from recipe_vectors rv
  where rv.tsv @@ plainto_tsquery('english', search_query)
  order by ts_rank(rv.tsv, plainto_tsquery('english', search_query)) desc;
$$;
