-- Drop stale get_ranked_recipes(text) overload that was created directly on remote
-- The correct version is get_ranked_recipes(date) from migration 00001
drop function if exists public.get_ranked_recipes(text);
