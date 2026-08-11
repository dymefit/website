-- ============================================================
-- Library additions from coach's curated reels:
--  · 6 kettlebell mobility/stability drills (Kettlebell column
--    of their movement-pattern groups — SWAP-eligible)
--  · 6 golf swing-prep drills under a new GOLF PREP category
-- Re-runnable (on conflict do nothing).
-- ============================================================

insert into public.exercise_library (category, pattern, equipment, name) values
  -- Kettlebell drills
  ('PREHAB / MOBILITY', 'Rear Delt / Upper Back', 'Kettlebell', 'KB Halo'),
  ('PREHAB / MOBILITY', 'Anti-Extension', 'Kettlebell', 'KB Dead Bug'),
  ('CORE & ROTATION', 'Anti-Lateral / Carry', 'Kettlebell', 'KB Windmill'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Kettlebell', 'KB Hip Shift'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Kettlebell', 'KB Goblet Squat Pry'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Kettlebell', 'KB 90/90 Hip Switch'),

  -- Golf swing-prep circuit
  ('GOLF PREP', 'Rear Delt / Upper Back', 'Bodyweight', 'Prone Shoulder Rotations'),
  ('GOLF PREP', 'Rear Delt / Upper Back', 'Dumbbell', 'Prone W-Raise'),
  ('GOLF PREP', 'Rotation / Power', 'Band', 'Band Backswing'),
  ('GOLF PREP', 'Mobility — Spine & Thoracic', 'Bodyweight', 'Golf Windmill'),
  ('GOLF PREP', 'Mobility — Spine & Thoracic', 'Bodyweight', 'Kneeling Spine Rotation'),
  ('GOLF PREP', 'Mobility — Spine & Thoracic', 'Bodyweight', 'Half-Kneel Wall Open Book')
on conflict (category, pattern, equipment, name) do nothing;
