-- ============================================================
-- Landmine becomes first-class library equipment:
--  · reclassify the 8 existing landmine drills from Barbell -> Landmine
--  · add 4 landmine staples
-- Re-runnable.
-- ============================================================

update public.exercise_library
   set equipment = 'Landmine'
 where name ilike 'Landmine %' and equipment = 'Barbell';

insert into public.exercise_library (category, pattern, equipment, name) values
  ('LOWER BODY',        'Hinge (hip)',     'Landmine', 'Landmine RDL'),
  ('UPPER BODY — PUSH', 'Vertical Push',   'Landmine', 'Half-Kneeling Landmine Press'),
  ('UPPER BODY — PULL', 'Horizontal Pull', 'Landmine', 'Landmine Meadows Row'),
  ('CORE & ROTATION',   'Rotation / Power','Landmine', 'Standing Landmine Rotation')
on conflict (category, pattern, equipment, name) do nothing;

-- Verify
select equipment, count(*) from public.exercise_library
where name ilike '%landmine%' group by equipment;
