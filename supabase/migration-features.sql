-- ============================================================
-- ProgramLab feature migration
-- Adds: client detail fields + per-exercise week progressions.
-- Purely additive (ADD COLUMN IF NOT EXISTS) — no drops, no warnings.
-- Run in Supabase dashboard → SQL Editor → New query.
-- ============================================================

-- Client detail panel fields
alter table public.clients add column if not exists email      text;
alter table public.clients add column if not exists phone      text;
alter table public.clients add column if not exists start_date date;
alter table public.clients add column if not exists notes      text;

-- Week-by-week progressions: a JSON object keyed by week number, e.g.
--   { "2": {"sets":"3","reps":"6"}, "4": {"load":"80% 1RM"} }
-- Empty {} means the exercise uses its base values for every week.
alter table public.exercises add column if not exists progressions jsonb not null default '{}'::jsonb;
