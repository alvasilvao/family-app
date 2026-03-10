-- Shared notes (table may already exist from a partial previous run)
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text not null default '',
  created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table notes enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'notes' and policyname = 'Authenticated users can read all notes') then
    create policy "Authenticated users can read all notes" on notes for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'notes' and policyname = 'Authenticated users can insert notes') then
    create policy "Authenticated users can insert notes" on notes for insert to authenticated with check (created_by = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'notes' and policyname = 'Authenticated users can update any note') then
    create policy "Authenticated users can update any note" on notes for update to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'notes' and policyname = 'Only creator can delete notes') then
    create policy "Only creator can delete notes" on notes for delete to authenticated using (created_by = auth.uid());
  end if;
end $$;

-- Shared to-dos
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  due_date date,
  completed_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table todos enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'todos' and policyname = 'Authenticated users can read all todos') then
    create policy "Authenticated users can read all todos" on todos for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'todos' and policyname = 'Authenticated users can insert todos') then
    create policy "Authenticated users can insert todos" on todos for insert to authenticated with check (created_by = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'todos' and policyname = 'Authenticated users can update any todo') then
    create policy "Authenticated users can update any todo" on todos for update to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'todos' and policyname = 'Only creator can delete todos') then
    create policy "Only creator can delete todos" on todos for delete to authenticated using (created_by = auth.uid());
  end if;
end $$;
