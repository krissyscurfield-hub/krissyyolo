-- Cadence — recurring tasks
-- Templates that auto-generate tasks each matching day.

create table if not exists public.recurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  priority int not null default 3 check (priority between 1 and 3),
  category_id uuid references public.categories(id) on delete set null,
  estimated_minutes int not null default 30,
  scheduled_time text,                      -- 'HH:MM' or null (let scheduler pick)
  cadence text not null default 'daily',    -- 'daily' | 'weekdays' | 'weekends' | 'weekly'
  days_of_week int[] default null,          -- 0=Sun..6=Sat, used only when cadence='weekly'
  starts_on date default current_date,
  last_generated_on date,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists recurrences_user_idx on public.recurrences(user_id);
create index if not exists recurrences_active_idx on public.recurrences(user_id, active);

alter table public.recurrences enable row level security;

drop policy if exists "own recurrences" on public.recurrences;
create policy "own recurrences" on public.recurrences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists recurrences_touch on public.recurrences;
create trigger recurrences_touch before update on public.recurrences
  for each row execute function public.touch_updated_at();

-- Link generated tasks back to their template
alter table public.tasks
  add column if not exists recurrence_id uuid references public.recurrences(id) on delete set null;
create index if not exists tasks_recurrence_idx on public.tasks(recurrence_id);
