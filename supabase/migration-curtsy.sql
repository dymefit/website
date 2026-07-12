-- ============================================================
-- Curtsy lunges: library entries + golf placements (weeks 3-6).
-- Inserts only — safe to re-run.
-- ============================================================

-- Library (Lunge / Single-Leg — hotel-swap ready)
insert into public.exercise_library (category, pattern, equipment, name) values
  ('LOWER BODY', 'Lunge / Single-Leg', 'Bodyweight', 'Curtsy Lunge'),
  ('LOWER BODY', 'Lunge / Single-Leg', 'Dumbbell',   'DB Curtsy Lunge'),
  ('LOWER BODY', 'Lunge / Single-Leg', 'Barbell',    'Landmine Curtsy Lunge')
on conflict (category, pattern, equipment, name) do nothing;

-- Golf Power Day B: compound set with Skater Bounds, weeks 3-6
insert into exercises (id, day_id, name, pattern, equipment, alt, sets, reps, load, rest, notes, position, progressions) values ('e92907a1-18dc-5519-ba3f-179b53a6b20f', '5c6a0d24-d0cd-5652-9a1f-d753da902c75', 'DB Curtsy Lunge', 'Lunge / Single-Leg', 'Dumbbells', 'Leg Press', '3', '5/side', 'RPE 7', '2:00', 'Weeks 3-6. Compound set: perform right after Skater Bounds (bound → curtsy, same side focus). Glute med + adductor control for the frontal plane.', 5, '{"1": {"notes": "Skip \u2014 starts week 3"}, "2": {"notes": "Skip \u2014 starts week 3"}, "5": {"reps": "6/side"}}'::jsonb) on conflict (id) do nothing;

-- Golf Strength Day C: adductor-bias superset option, weeks 3-6
insert into exercises (id, day_id, name, pattern, equipment, alt, sets, reps, load, rest, notes, position, progressions) values ('751ac331-b8c6-50d4-9c83-213c2f9fbafc', '816b45e8-72e7-5bb5-a042-41ac5fd12711', 'DB Curtsy Lunge', 'Lunge / Single-Leg', 'Dumbbells', 'Leg Press', '3', '8/side', 'RPE 7', '1:30', 'Weeks 3-6. Superset with a strong adductor movement (e.g., Copenhagen plank or adductor machine). Cross-body stability for the swing.', 7, '{"1": {"notes": "Skip \u2014 starts week 3"}, "2": {"notes": "Skip \u2014 starts week 3"}, "5": {"reps": "6/side", "load": "RPE 7.5"}}'::jsonb) on conflict (id) do nothing;
