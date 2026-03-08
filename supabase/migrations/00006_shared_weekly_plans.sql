-- Make weekly_plans shared across all family members instead of per-user.

-- Drop existing per-user RLS policies
drop policy if exists "plans_select_own" on public.weekly_plans;
drop policy if exists "plans_insert_own" on public.weekly_plans;
drop policy if exists "plans_update_own" on public.weekly_plans;

-- Drop the per-user unique constraint and add a per-week one
alter table public.weekly_plans drop constraint if exists weekly_plans_user_id_week_key_key;
alter table public.weekly_plans add constraint weekly_plans_week_key_key unique (week_key);

-- Drop user_id column (no longer needed)
alter table public.weekly_plans drop column if exists user_id;

-- Drop old index
drop index if exists idx_weekly_plans_user_week;

-- New RLS policies: any authenticated user can read/write all plans
create policy "plans_select" on public.weekly_plans for select to authenticated using (true);
create policy "plans_insert" on public.weekly_plans for insert to authenticated with check (true);
create policy "plans_update" on public.weekly_plans for update to authenticated using (true);
