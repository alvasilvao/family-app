-- Seed built-in recipes (no user_id, visible to all)
-- Creamy Chickpea Soup
insert into public.recipes (id, name, cook_time, description, tags, emoji, color, is_built_in)
values (
  'a1111111-1111-1111-1111-111111111111',
  'Creamy Chickpea Soup',
  '40 min',
  'Silky blended chickpea soup with crispy chickpea croutons, tahini, garlic, and a bright hit of lemon — served with pita chips.',
  '{"Vegetarian","Healthy","Comfort Food"}',
  '🫘',
  '#c9a84c',
  true
) on conflict do nothing;

insert into public.ingredients (name, unit, per_serving, recipe_id) values
  ('Chickpeas (canned, drained)', 'g',    192,   'a1111111-1111-1111-1111-111111111111'),
  ('Extra-virgin olive oil',      'tbsp', 0.8,   'a1111111-1111-1111-1111-111111111111'),
  ('Garlic cloves',               'pcs',  0.8,   'a1111111-1111-1111-1111-111111111111'),
  ('Cumin seeds',                 'tsp',  0.2,   'a1111111-1111-1111-1111-111111111111'),
  ('Crushed red pepper flakes',   'tsp',  0.1,   'a1111111-1111-1111-1111-111111111111'),
  ('Onion',                       'pcs',  0.2,   'a1111111-1111-1111-1111-111111111111'),
  ('Ground cumin',                'tsp',  0.2,   'a1111111-1111-1111-1111-111111111111'),
  ('Vegetable broth',             'ml',   166,   'a1111111-1111-1111-1111-111111111111'),
  ('Tahini',                      'tbsp', 1.1,   'a1111111-1111-1111-1111-111111111111'),
  ('Fresh cilantro',              'g',    3,     'a1111111-1111-1111-1111-111111111111'),
  ('Lemon',                       'pcs',  0.2,   'a1111111-1111-1111-1111-111111111111'),
  ('Pita chips',                  'g',    20,    'a1111111-1111-1111-1111-111111111111'),
  ('Smoked paprika',              'tsp',  0.1,   'a1111111-1111-1111-1111-111111111111'),
  ('Fine sea salt',               'tsp',  0.2,   'a1111111-1111-1111-1111-111111111111')
on conflict do nothing;

-- Halloumi with Tomatoes & Beans
insert into public.recipes (id, name, cook_time, description, tags, emoji, color, is_built_in)
values (
  'b2222222-2222-2222-2222-222222222222',
  'Halloumi with Tomatoes & Beans',
  '25 min',
  'Broiled halloumi over a juicy tomato and cannellini bean pan sauce with garlic, honey, and lemon. Serve with crusty bread.',
  '{"Vegetarian","Healthy","Quick"}',
  '🧀',
  '#d4845a',
  true
) on conflict do nothing;

insert into public.ingredients (name, unit, per_serving, recipe_id) values
  ('Cherry tomatoes',       'g',      113,  'b2222222-2222-2222-2222-222222222222'),
  ('Halloumi',              'g',      57,   'b2222222-2222-2222-2222-222222222222'),
  ('Cannellini beans',      'g',      106,  'b2222222-2222-2222-2222-222222222222'),
  ('Olive oil',             'tbsp',   0.75, 'b2222222-2222-2222-2222-222222222222'),
  ('Garlic cloves',         'pcs',    0.5,  'b2222222-2222-2222-2222-222222222222'),
  ('Fresh parsley',         'tbsp',   0.25, 'b2222222-2222-2222-2222-222222222222'),
  ('Honey',                 'tsp',    0.25, 'b2222222-2222-2222-2222-222222222222'),
  ('Dried oregano',         'tsp',    0.13, 'b2222222-2222-2222-2222-222222222222'),
  ('Lemon',                 'pcs',    0.13, 'b2222222-2222-2222-2222-222222222222'),
  ('Crusty bread',          'slices', 2,    'b2222222-2222-2222-2222-222222222222'),
  ('Salt and black pepper', 'tsp',    0.25, 'b2222222-2222-2222-2222-222222222222')
on conflict do nothing;
