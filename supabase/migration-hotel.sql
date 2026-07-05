-- Hotel mode: client-saved checklist of equipment available at their hotel gym.
-- Purely additive — no drops, no warning. Safe to re-run.
alter table public.clients add column if not exists hotel_equipment jsonb not null default '[]'::jsonb;
