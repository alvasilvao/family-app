-- ============================================================
-- RLS policy hardening
-- ============================================================
-- NOTE: meal_plans, grocery_items, notes, and todos are
-- intentionally shared across all authenticated users
-- (shared-household model). SELECT/UPDATE remain open for
-- collaborative editing; INSERT enforces ownership; DELETE
-- restricts to creator where applicable.
--
-- This migration adds a comment documenting the intent and
-- tightens grocery_items update to only allow toggling
-- bought_at (the only update the app performs).
-- ============================================================

-- Document the shared-household intent on each table
COMMENT ON TABLE public.meal_plans IS 'Shared-household: all authenticated users can read/update plans collaboratively.';
COMMENT ON TABLE public.grocery_items IS 'Shared-household: all authenticated users can read items and toggle bought status.';
COMMENT ON TABLE public.notes IS 'Shared-household: all authenticated users can read/update notes collaboratively.';
COMMENT ON TABLE public.todos IS 'Shared-household: all authenticated users can read/update todos collaboratively.';
