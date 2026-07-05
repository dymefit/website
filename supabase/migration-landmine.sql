-- Add landmine exercises to the library, filed per section.
-- Purely additive — no drops, no warning. Safe to re-run.
insert into public.exercise_library (category, pattern, equipment, name) values
  ('LOWER BODY',        'Squat (knee)',        'Barbell', 'Landmine Front Squat'),
  ('LOWER BODY',        'Hinge (hip)',         'Barbell', 'Landmine Single-Leg RDL'),
  ('LOWER BODY',        'Lunge / Single-Leg',  'Barbell', 'Landmine Split Squat'),
  ('LOWER BODY',        'Lunge / Single-Leg',  'Barbell', 'Landmine Alternating Lunge'),
  ('UPPER BODY — PUSH', 'Vertical Push',       'Barbell', 'Landmine Split-Stance SA Push Press'),
  ('UPPER BODY — PULL', 'Horizontal Pull',     'Barbell', 'Landmine Bent-Over Row'),
  ('CORE & ROTATION',   'Rotation / Power',    'Barbell', 'Landmine Tall-Kneeling Arc Rotation'),
  ('CORE & ROTATION',   'Rotation / Power',    'Barbell', 'Landmine Half-Kneeling Arc Rotation')
on conflict (category, pattern, equipment, name) do nothing;
