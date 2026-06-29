-- ============================================================
-- ProgramLab: program type/level + exercise movement pattern
-- Additive (ADD COLUMN IF NOT EXISTS) — no drops, no warnings.
-- Run in Supabase dashboard → SQL Editor → New query.
-- ============================================================

alter table public.programs  add column if not exists type    text;  -- Strength, Hypertrophy, ...
alter table public.programs  add column if not exists level   text;  -- Beginner / Intermediate / Advanced
alter table public.exercises add column if not exists pattern text;  -- Squat, Hinge, Horizontal Push, ...
