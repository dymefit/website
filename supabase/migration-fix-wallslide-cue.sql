-- Correct the Wall Slides + Lift-Off cue in the Golf Mobility template.
-- The lift-off variant is performed FACING the wall; the old note
-- described the back-to-wall version, which has no lift-off.
update exercises
   set notes = 'Face the wall, forearms slide up; at the top, lift arms off without shrugging — ribs stay down'
 where id = 'b07ed3ed-44b6-5c97-bb0f-8b02a3ea41ce';

select name, notes from exercises where id = 'b07ed3ed-44b6-5c97-bb0f-8b02a3ea41ce';
