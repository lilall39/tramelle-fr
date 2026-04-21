create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('lent', 'borrowed')),
  person_name text not null,
  item_name text not null,
  amount numeric,
  note text,
  created_at timestamptz not null default now(),
  reminder_at timestamptz,
  status text not null default 'open' check (status in ('open', 'returned')),
  returned_at timestamptz
);

create index if not exists loans_user_id_idx on public.loans (user_id);
create index if not exists loans_user_id_status_idx on public.loans (user_id, status);
create index if not exists loans_created_at_desc_idx on public.loans (created_at desc);

alter table public.profiles enable row level security;
alter table public.loans enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles
  for delete
  using (auth.uid() = id);

create policy "loans_select_own"
  on public.loans
  for select
  using (auth.uid() = user_id);

create policy "loans_insert_own"
  on public.loans
  for insert
  with check (auth.uid() = user_id);

create policy "loans_update_own"
  on public.loans
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "loans_delete_own"
  on public.loans
  for delete
  using (auth.uid() = user_id);
