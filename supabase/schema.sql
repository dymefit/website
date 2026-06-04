-- ============================================================
-- ProgramLab schema — NO-LOGIN / shared workspace
-- One shared dataset, accessed with the public (anon) key.
-- Run in Supabase dashboard → SQL Editor → New query.
-- Safe to re-run, and safe to run over the older auth-based schema
-- (it removes the coach_id column and the per-user policies).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tables (created only if missing) ----------
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  goal        text,
  email       text,
  phone       text,
  start_date  date,
  notes       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.programs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  name        text not null,
  weeks       int  not null default 4,
  week_notes  jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.days (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs(id) on delete cascade,
  label       text not null,
  focus       text,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.exercises (
  id          uuid primary key default gen_random_uuid(),
  day_id      uuid not null references public.days(id) on delete cascade,
  name        text not null,
  sets        text, reps text, load text, rest text, notes text,
  progressions jsonb not null default '{}'::jsonb,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  day_id      uuid references public.days(id) on delete set null,
  date        date not null,
  note        text,
  created_at  timestamptz not null default now()
);

-- ---------- Migrate away from the old auth-based design ----------
-- Drop coach_id if a previous (logged-in) schema created it.
alter table public.clients   drop column if exists coach_id;
alter table public.programs  drop column if exists coach_id;
alter table public.days      drop column if exists coach_id;
alter table public.exercises drop column if exists coach_id;
alter table public.sessions  drop column if exists coach_id;

-- Feature columns (additive — safe on existing installs).
alter table public.clients   add column if not exists email      text;
alter table public.clients   add column if not exists phone      text;
alter table public.clients   add column if not exists start_date date;
alter table public.clients   add column if not exists notes      text;
alter table public.exercises add column if not exists progressions jsonb not null default '{}'::jsonb;
alter table public.programs   add column if not exists week_notes   jsonb not null default '{}'::jsonb;

-- ---------- Indexes ----------
create index if not exists idx_programs_client on public.programs(client_id);
create index if not exists idx_days_program    on public.days(program_id);
create index if not exists idx_exercises_day   on public.exercises(day_id);
create index if not exists idx_sessions_client on public.sessions(client_id);
create index if not exists idx_sessions_date   on public.sessions(date);

-- ---------- RLS: enable, but allow shared (anon) access ----------
-- NOTE: this intentionally makes the data PUBLIC to anyone with the
-- site URL — that is the "no login, shared workspace" choice.
alter table public.clients   enable row level security;
alter table public.programs  enable row level security;
alter table public.days      enable row level security;
alter table public.exercises enable row level security;
alter table public.sessions  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['clients','programs','days','exercises','sessions']
  loop
    -- remove old per-user policy if present
    execute format('drop policy if exists %I_owner on public.%I;', t, t);
    -- shared policy: anyone (anon or authenticated) can read/write
    execute format('drop policy if exists %I_public on public.%I;', t, t);
    execute format(
      'create policy %I_public on public.%I
         for all
         to anon, authenticated
         using (true)
         with check (true);', t, t);
  end loop;
end $$;
