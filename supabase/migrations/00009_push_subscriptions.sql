create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null,
  keys jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table push_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Users can manage own subscriptions' and tablename = 'push_subscriptions'
  ) then
    create policy "Users can manage own subscriptions"
      on push_subscriptions for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end
$$;
