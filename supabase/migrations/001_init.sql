-- Cadence — initial schema
-- Run this in the Supabase SQL editor after creating a new project.

create extension if not exists "pgcrypto";

-- User preferences (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  timezone text default 'UTC',
  work_hours_start time default '09:00',
  work_hours_end time default '18:00',
  quiet_hours_start time default '22:00',
  quiet_hours_end time default '07:00',
  plan_time time default '07:30',
  shutdown_time time default '21:00',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories: Personal / Business by default
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#2F6FED',
  is_default boolean default false,
  created_at timestamptz default now()
);
create index if not exists categories_user_idx on public.categories(user_id);

-- Calendar account (Apple via CalDAV) — one per user in MVP.
create table if not exists public.calendar_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  provider text not null default 'apple',
  display_name text not null,
  username text not null,
  password_ciphertext text not null,  -- encrypted (AES-GCM) app-specific password
  caldav_url text not null default 'https://caldav.icloud.com',
  sync_token text,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists calendar_accounts_user_idx on public.calendar_accounts(user_id);

-- Calendar events (cached from Apple + events Cadence writes back)
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.calendar_accounts(id) on delete cascade,
  external_uid text not null,
  calendar_name text,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean default false,
  source text not null default 'apple',   -- 'apple' | 'cadence'
  linked_task_id uuid,
  etag text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint calendar_events_account_uid_unique unique (account_id, external_uid)
);
create index if not exists calendar_events_user_range_idx on public.calendar_events(user_id, starts_at, ends_at);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  priority int not null default 3 check (priority between 1 and 3),
  status text not null default 'INBOX' check (status in ('INBOX','SCHEDULED','DONE','SKIPPED')),
  energy text check (energy in ('DEEP','LIGHT','ADMIN')),
  category_id uuid references public.categories(id) on delete set null,
  estimated_minutes int not null default 30,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  due_date date,
  must_do_today boolean default false,
  completed_at timestamptz,
  rolled_from_date date,
  external_event_id uuid references public.calendar_events(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists tasks_user_status_idx on public.tasks(user_id, status);
create index if not exists tasks_user_scheduled_idx on public.tasks(user_id, scheduled_start);

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.calendar_accounts enable row level security;
alter table public.calendar_events enable row level security;
alter table public.tasks enable row level security;

create policy "own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "own categories" on public.categories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own calendar accounts" on public.calendar_accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own calendar events" on public.calendar_events for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tasks" on public.tasks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile + default categories on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
    on conflict (id) do nothing;
  insert into public.categories (user_id, name, color, is_default) values
    (new.id, 'Personal', '#6AA479', true),
    (new.id, 'Business', '#2F6FED', true)
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Touch updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

drop trigger if exists events_touch on public.calendar_events;
create trigger events_touch before update on public.calendar_events
  for each row execute function public.touch_updated_at();
