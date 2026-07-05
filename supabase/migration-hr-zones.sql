-- ============================================================
-- HR training zones: client-entered age + resting HR.
-- Adds two columns and lets a client update THEIR OWN row
-- (with check keeps the row tied to their email, so they can't
-- reassign it). Coach policy already covers full access.
-- Note: the "destructive" warning is just the drop-policy line — safe.
-- ============================================================

alter table public.clients add column if not exists age        int;
alter table public.clients add column if not exists resting_hr int;

drop policy if exists clients_self_update on public.clients;
create policy clients_self_update on public.clients
  for update to authenticated
  using (email = public.jwt_email())
  with check (email = public.jwt_email());
