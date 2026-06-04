-- ============================================================
-- ProgramLab: coach + client accounts, private data, workout logs
-- Transforms the open "shared workspace" DB into a secure two-role app:
--   • Coach (you) can read/write everything.
--   • Clients can read only THEIR program/sessions and write THEIR logs.
-- Run in Supabase dashboard → SQL Editor → New query.
-- (Contains DROP POLICY — the "potential issue" warning is expected & safe.)
-- ============================================================

-- >>> SET YOUR COACH EMAIL HERE (the email you'll log in with as coach) <<<
-- It must match VITE_COACH_EMAIL in the app config. Change in this one place.
create or replace function public.coach_email() returns text
  language sql immutable as $$ select 'unutoa31@gmail.com'::text $$;

-- ---------- Workout logs (per-set actuals a client records) ----------
create table if not exists public.workout_logs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id)   on delete cascade,
  session_id  uuid           references public.sessions(id) on delete set null,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  date        date not null,
  sets        jsonb not null default '[]'::jsonb,  -- [{ "weight": "185", "reps": "5", "rpe": "8" }]
  note        text,
  created_at  timestamptz not null default now(),
  unique (session_id, exercise_id)
);
create index if not exists idx_logs_client  on public.workout_logs(client_id);
create index if not exists idx_logs_session on public.workout_logs(session_id);

-- ---------- Helper functions (security definer to avoid RLS recursion) ----------
create or replace function public.jwt_email() returns text
  language sql stable as $$ select coalesce(auth.jwt()->>'email', '') $$;

create or replace function public.is_coach() returns boolean
  language sql stable as $$ select public.jwt_email() = public.coach_email() $$;

-- Does the current user own this client row (their email matches)?
create or replace function public.owns_client(cid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
    select exists (select 1 from clients c where c.id = cid and c.email = public.jwt_email())
  $$;

-- Client id that owns a given program / day (for nested ownership checks).
create or replace function public.program_client(pid uuid) returns uuid
  language sql stable security definer set search_path = public as $$
    select client_id from programs where id = pid
  $$;

create or replace function public.day_client(did uuid) returns uuid
  language sql stable security definer set search_path = public as $$
    select p.client_id from days d join programs p on p.id = d.program_id where d.id = did
  $$;

-- ---------- Enable RLS ----------
alter table public.clients      enable row level security;
alter table public.programs     enable row level security;
alter table public.days         enable row level security;
alter table public.exercises    enable row level security;
alter table public.sessions     enable row level security;
alter table public.workout_logs enable row level security;

-- ---------- Drop the old open/per-user policies ----------
do $$
declare t text;
begin
  foreach t in array array['clients','programs','days','exercises','sessions']
  loop
    execute format('drop policy if exists %I_public on public.%I;', t, t);
    execute format('drop policy if exists %I_owner  on public.%I;', t, t);
    execute format('drop policy if exists %I_coach  on public.%I;', t, t);
    execute format('drop policy if exists %I_client on public.%I;', t, t);
  end loop;
end $$;

-- ---------- Coach: full access to everything ----------
do $$
declare t text;
begin
  foreach t in array array['clients','programs','days','exercises','sessions','workout_logs']
  loop
    execute format(
      'create policy %I_coach on public.%I for all to authenticated
         using (public.is_coach()) with check (public.is_coach());', t, t);
  end loop;
end $$;

-- ---------- Client: read only their own program data ----------
create policy clients_client   on public.clients   for select to authenticated
  using (email = public.jwt_email());
create policy programs_client  on public.programs  for select to authenticated
  using (public.owns_client(client_id));
create policy days_client      on public.days      for select to authenticated
  using (public.owns_client(public.program_client(program_id)));
create policy exercises_client on public.exercises for select to authenticated
  using (public.owns_client(public.day_client(day_id)));
create policy sessions_client  on public.sessions  for select to authenticated
  using (public.owns_client(client_id));

-- ---------- Client: read & write their own workout logs ----------
create policy logs_client on public.workout_logs for all to authenticated
  using (public.owns_client(client_id))
  with check (public.owns_client(client_id));
