-- ============================================================
-- Beta access codes: single-use codes for beta clients (free
-- enrollment during launch). Codes are stored HASHED; validation
-- and redemption happen through a security-definer RPC so the
-- table needs no anonymous policies. Coach reads everything.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.beta_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  label text not null,
  max_uses int not null default 1,
  uses int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.beta_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_label text not null,
  name text,
  email text,
  package text,
  redeemed_at timestamptz not null default now()
);

alter table public.beta_codes enable row level security;
alter table public.beta_redemptions enable row level security;
drop policy if exists beta_codes_coach on public.beta_codes;
drop policy if exists beta_red_coach on public.beta_redemptions;
create policy beta_codes_coach on public.beta_codes
  for all using (is_coach()) with check (is_coach());
create policy beta_red_coach on public.beta_redemptions
  for all using (is_coach()) with check (is_coach());

-- Validate + redeem in one atomic call. SECURITY DEFINER: runs with
-- owner privileges so anon needs no table access at all.
create or replace function public.redeem_beta_code(p_code text, p_name text, p_email text, p_package text)
returns jsonb language plpgsql security definer set search_path = public as $fn$
declare v_row beta_codes;
begin
  select * into v_row from beta_codes
   where code_hash = encode(digest(lower(trim(p_code)), 'sha256'), 'hex')
     and active and uses < max_uses
   for update;
  if not found then
    return jsonb_build_object('valid', false);
  end if;
  update beta_codes set uses = uses + 1 where id = v_row.id;
  insert into beta_redemptions (code_label, name, email, package)
    values (v_row.label, left(p_name, 120), left(p_email, 160), left(p_package, 80));
  return jsonb_build_object('valid', true, 'label', v_row.label);
end $fn$;

revoke all on function public.redeem_beta_code(text, text, text, text) from public;
grant execute on function public.redeem_beta_code(text, text, text, text) to anon, authenticated;

insert into public.beta_codes (code_hash, label, max_uses) values
  ('0e7ad310d576909422fabcf413aabc93c532c8114ebd34c3ab6ec980d5a6d8b7', 'BETA-01', 1),
  ('b827a8a1806580427782f7d164d857530c24ead0da6c8555708c6a4199f038e7', 'BETA-02', 1),
  ('9fe5b0ddc82d4f0be2088b676309a9d960bdce697521f740055ac89cbb28c7ab', 'BETA-03', 1),
  ('1972b67b117f447454d7a184f96dae7eeccb3058a39e5332b1d6cb4191fa5e7a', 'BETA-04', 1),
  ('fa13e8ceded0549643b8cd92cd2b023b0c12a0dd64f270e5ed02f2f80f8cc6ff', 'BETA-05', 1),
  ('ab0748878887ed1c6ed17d8e09e067c0b878d3fdeaddde842a8f7f6670fb3424', 'BETA-06', 1),
  ('7d49ef110e333055588f07ae37cdb567f0ade330d326ba36834d3612f8e2361e', 'BETA-07', 1),
  ('6bba8ba9ba0537fa51ad903f456f15807793e00af0e3bda39d0932203226d567', 'BETA-08', 1),
  ('28fb8c1c23771cfa4fdaacf8035a8e6e30770c7eeb826f65690c4ec5cccb9ca5', 'BETA-09', 1),
  ('d888d65e7e7c10f14bdcca6d02f20cc8103a793356f892b1d00479c77be6b04b', 'BETA-10', 1),
  ('233595c71aa9abb41205bf9570170ae8eb2c58856063ce4991865ca52832f4bf', 'BETA-11', 1),
  ('f1cab155993b35289334c1380bb0004243a5d6253bb2da43ef137435d57a923f', 'BETA-12', 1),
  ('ce6e52d251ef0e6d4f3ae9d3ad4e3935fd3f3676e94caca80b2930a606066d1c', 'TEST', 25)
on conflict (code_hash) do nothing;
