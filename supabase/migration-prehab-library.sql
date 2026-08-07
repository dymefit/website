-- ============================================================
-- Exercise Library: PREHAB / MOBILITY category.
-- Seeds the injury-prevention + developmental-position drills so
-- they appear in the coach's picker and enrich hotel-SWAP pools.
-- Stability groups reuse existing swap patterns (Anti-Rotation,
-- Anti-Extension, etc.); mobility groups are organizational.
-- Re-runnable (on conflict do nothing).
-- ============================================================

insert into public.exercise_library (category, pattern, equipment, name) values
  -- Core control (anti-extension)
  ('PREHAB / MOBILITY', 'Anti-Extension', 'Bodyweight', 'Dead Bug'),
  ('PREHAB / MOBILITY', 'Anti-Extension', 'Band', 'Dead Bug — Band Overhead'),
  ('PREHAB / MOBILITY', 'Anti-Extension', 'Bodyweight', 'Bird Dog'),
  ('PREHAB / MOBILITY', 'Anti-Extension', 'Band', 'Bird Dog — Band Row'),
  ('PREHAB / MOBILITY', 'Anti-Extension', 'Bodyweight', 'Plank with Reach'),
  ('PREHAB / MOBILITY', 'Anti-Extension', 'Band', 'Tall Kneel Band Fallout'),
  ('PREHAB / MOBILITY', 'Anti-Extension', 'Band', 'Supine Band Pullover'),

  -- Rotational stability (anti-rotation)
  ('PREHAB / MOBILITY', 'Anti-Rotation', 'Band', 'Pallof Press (any base)'),
  ('PREHAB / MOBILITY', 'Anti-Rotation', 'Machine / Cable', 'Cable Pallof Press (any base)'),
  ('PREHAB / MOBILITY', 'Anti-Rotation', 'Machine / Cable', 'Chop & Lift (any base)'),
  ('PREHAB / MOBILITY', 'Anti-Rotation', 'Band', 'Band Chop (any base)'),
  ('PREHAB / MOBILITY', 'Anti-Rotation', 'Bodyweight', 'Bear Hold with Shoulder Taps'),
  ('PREHAB / MOBILITY', 'Anti-Rotation', 'Bodyweight', 'Plank Shoulder Taps'),

  -- Lateral pillar & carries
  ('PREHAB / MOBILITY', 'Anti-Lateral / Carry', 'Bodyweight', 'Side Plank from Knees'),
  ('PREHAB / MOBILITY', 'Anti-Lateral / Carry', 'Bodyweight', 'Copenhagen Side Plank'),
  ('PREHAB / MOBILITY', 'Anti-Lateral / Carry', 'Kettlebell', 'Suitcase Carry'),
  ('PREHAB / MOBILITY', 'Anti-Lateral / Carry', 'Dumbbell', 'Carry with March'),

  -- Hip activation (glute med/max)
  ('PREHAB / MOBILITY', 'Posterior / Glute', 'Band', 'Clamshell'),
  ('PREHAB / MOBILITY', 'Posterior / Glute', 'Band', 'Glute Bridge — Band at Knees'),
  ('PREHAB / MOBILITY', 'Posterior / Glute', 'Bodyweight', 'Single-Leg Glute Bridge'),
  ('PREHAB / MOBILITY', 'Posterior / Glute', 'Band', 'Sidelying Hip Abduction'),
  ('PREHAB / MOBILITY', 'Posterior / Glute', 'Band', 'Lateral Band Walk'),
  ('PREHAB / MOBILITY', 'Posterior / Glute', 'Band', 'Resisted March'),
  ('PREHAB / MOBILITY', 'Posterior / Glute', 'Bodyweight', 'Quadruped Hip Circles'),
  ('PREHAB / MOBILITY', 'Posterior / Glute', 'Bodyweight', 'Split-Stance Bridge'),

  -- Cuff & scapular health
  ('PREHAB / MOBILITY', 'Rear Delt / Upper Back', 'Band', 'Band External Rotation'),
  ('PREHAB / MOBILITY', 'Rear Delt / Upper Back', 'Band', 'Band Internal Rotation'),
  ('PREHAB / MOBILITY', 'Rear Delt / Upper Back', 'Dumbbell', 'Sidelying External Rotation'),
  ('PREHAB / MOBILITY', 'Rear Delt / Upper Back', 'Bodyweight', 'Prone Y-T-W Raise'),
  ('PREHAB / MOBILITY', 'Rear Delt / Upper Back', 'Band', 'Scapular Retractions'),
  ('PREHAB / MOBILITY', 'Rear Delt / Upper Back', 'Bodyweight', 'Wall Slides'),
  ('PREHAB / MOBILITY', 'Rear Delt / Upper Back', 'Bodyweight', 'Serratus Wall Press'),
  ('PREHAB / MOBILITY', 'Rear Delt / Upper Back', 'Bodyweight', 'Push-Up Plus'),

  -- Mobility — spine & thoracic
  ('PREHAB / MOBILITY', 'Mobility — Spine & Thoracic', 'Bodyweight', 'Cat-Camel'),
  ('PREHAB / MOBILITY', 'Mobility — Spine & Thoracic', 'Bodyweight', 'Thoracic Open Books'),
  ('PREHAB / MOBILITY', 'Mobility — Spine & Thoracic', 'Bodyweight', 'Quadruped Thoracic Rotation'),
  ('PREHAB / MOBILITY', 'Mobility — Spine & Thoracic', 'Bodyweight', 'Tall Kneel Thoracic Windmill'),
  ('PREHAB / MOBILITY', 'Mobility — Spine & Thoracic', 'Bodyweight', 'Standing Thoracic Rotation + Reach'),
  ('PREHAB / MOBILITY', 'Mobility — Spine & Thoracic', 'Bodyweight', 'Pelvic Tilt to Segmental Bridge'),
  ('PREHAB / MOBILITY', 'Mobility — Spine & Thoracic', 'Bodyweight', '90/90 Breathing Reset'),

  -- Mobility — hip & groin
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Bodyweight', '90/90 Hip Switches'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Bodyweight', 'Hip Flexor Stretch (any base)'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Bodyweight', 'Tall Kneel Couch Stretch'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Bodyweight', 'World''s Greatest Stretch'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Bodyweight', 'Split Stance Adductor Rock'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Bodyweight', 'Sidelying Quad & Hip Flexor Stretch'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Band', 'Band Hamstring Floss'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Bodyweight', 'Standing Hinge Hamstring Stretch'),
  ('PREHAB / MOBILITY', 'Mobility — Hip & Groin', 'Bodyweight', 'Child''s Pose Lat Stretch'),

  -- Mobility — ankle & foot
  ('PREHAB / MOBILITY', 'Mobility — Ankle & Foot', 'Bodyweight', 'Knee-to-Wall Ankle Rock'),
  ('PREHAB / MOBILITY', 'Mobility — Ankle & Foot', 'Bodyweight', 'Toe Yoga'),
  ('PREHAB / MOBILITY', 'Mobility — Ankle & Foot', 'Bodyweight', 'Tibialis Raises'),
  ('PREHAB / MOBILITY', 'Mobility — Ankle & Foot', 'Band', 'Band Inversion + Eversion'),

  -- Balance & proprioception
  ('PREHAB / MOBILITY', 'Balance / Proprioception', 'Bodyweight', 'Single-Leg Balance'),
  ('PREHAB / MOBILITY', 'Balance / Proprioception', 'Bodyweight', 'Single-Leg Balance + Reaches'),
  ('PREHAB / MOBILITY', 'Balance / Proprioception', 'Band', 'Single-Leg Balance + Band Reach'),
  ('PREHAB / MOBILITY', 'Balance / Proprioception', 'Bodyweight', 'Heel-to-Toe Walk')
on conflict (category, pattern, equipment, name) do nothing;
