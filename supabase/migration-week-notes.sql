-- ============================================================
-- ProgramLab: per-week program notes
-- Additive (ADD COLUMN IF NOT EXISTS) — no drops, no warnings.
-- Run in Supabase dashboard → SQL Editor → New query.
-- ============================================================

-- A JSON object keyed by week number, e.g. { "1": "Intro week", "4": "Deload" }
alter table public.programs add column if not exists week_notes jsonb not null default '{}'::jsonb;
