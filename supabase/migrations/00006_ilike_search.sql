-- Replace full-text search with ILIKE for language-agnostic partial matching
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
  )
  select
    r.id, r.name, r.cook_time, r.emoji, r.color, r.description,
    r.source_url, r.image_path, r.tags, r.is_built_in, r.instructions, r.created_at
  from public.recipes r
  left join ingredient_names i on i.recipe_id = r.id
  where (
    r.name                                        ilike '%' || search_query || '%'
    or coalesce(r.description, '')                ilike '%' || search_query || '%'
    or coalesce(array_to_string(r.tags, ' '), '') ilike '%' || search_query || '%'
    or coalesce(i.names, '')                      ilike '%' || search_query || '%'
  )
  order by
    case when r.name ilike '%' || search_query || '%' then 0 else 1 end,
    r.name;
$$;
