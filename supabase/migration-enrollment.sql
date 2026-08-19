-- ============================================================
-- Enrollment Agreement, Waiver & Medical History (e-signed).
-- One row per signed enrollment. Clients insert/read their own
-- (matched by login email); the coach reads everything.
-- ============================================================

create table if not exists public.enrollment_forms (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid,
  email         text not null,
  full_name     text not null,
  date_of_birth date,
  is_minor      boolean not null default false,
  guardian_name text,
  guardian_relationship text,
  participant   jsonb not null default '{}'::jsonb,  -- contact, emergency contact, physician
  medical       jsonb not null default '{}'::jsonb,  -- Exhibit A answers
  acknowledgments jsonb not null default '{}'::jsonb,
  signature_name text not null,
  guardian_signature_name text,
  doc_version   text not null,
  doc_hash      text,
  ip_address    text,
  user_agent    text,
  signed_at     timestamptz not null default now()
);

create index if not exists enrollment_forms_email_idx on public.enrollment_forms (lower(email));

alter table public.enrollment_forms enable row level security;

drop policy if exists enrollment_coach_all   on public.enrollment_forms;
drop policy if exists enrollment_self_insert on public.enrollment_forms;
drop policy if exists enrollment_self_read   on public.enrollment_forms;

-- Coach: full access (is_coach() defined in migration-clients-auth.sql)
create policy enrollment_coach_all on public.enrollment_forms
  for all using (is_coach()) with check (is_coach());

-- Client: may sign (insert) only as themselves, and read only their own.
create policy enrollment_self_insert on public.enrollment_forms
  for insert to authenticated
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy enrollment_self_read on public.enrollment_forms
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- No update/delete policies for clients: a signed record is immutable to them.
