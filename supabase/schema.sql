-- ============================================================
-- ProgramLab schema + row-level security
-- Run this in the Supabase dashboard → SQL Editor → New query.
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================

-- Every table carries coach_id, defaulting to the logged-in user's id.
-- RLS then restricts each row to its owning coach.

-- ---------- Tables ----------
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null,
  goal        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.programs (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id   uuid not null references public.clients(id) on delete cascade,
  name        text not null,
  weeks       int  not null default 4,
  created_at  timestamptz not null default now()
);

create table if not exists public.days (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  program_id  uuid not null references public.programs(id) on delete cascade,
  label       text not null,
  focus       text,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.exercises (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day_id      uuid not null references public.days(id) on delete cascade,
  name        text not null,
  sets        text,
  reps        text,
  load        text,
  rest        text,
  notes       text,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id   uuid not null references public.clients(id) on delete cascade,
  day_id      uuid references public.days(id) on delete set null,
  date        date not null,
  note        text,
  created_at  timestamptz not null default now()
);

-- ---------- Helpful indexes ----------
create index if not exists idx_programs_client  on public.programs(client_id);
create index if not exists idx_days_program     on public.days(program_id);
create index if not exists idx_exercises_day     on public.exercises(day_id);
create index if not exists idx_sessions_client   on public.sessions(client_id);
create index if not exists idx_sessions_date     on public.sessions(date);

-- ---------- Enable RLS ----------
alter table public.clients   enable row level security;
alter table public.programs  enable row level security;
alter table public.days      enable row level security;
alter table public.exercises enable row level security;
alter table public.sessions  enable row level security;

-- ---------- Policies (coach sees only their own rows) ----------
do $$
declare t text;
begin
  foreach t in array array['clients','programs','days','exercises','sessions']
  loop
    execute format('drop policy if exists %I_owner on public.%I;', t, t);
    execute format(
      'create policy %I_owner on public.%I
         for all
         using (coach_id = auth.uid())
         with check (coach_id = auth.uid());', t, t);
  end loop;
end $$;
