-- ============================================================
-- Split the combined Sport holder: water stays under a renamed
-- swim holder; mountain programs move to a new ski holder.
-- Re-runnable (idempotent updates + on-conflict insert).
-- ============================================================

-- 1) Existing holder becomes the water-only holder
update clients set
  name = '🏊 Swim & Water Polo Templates',
  notes = 'Water polo / swim templates (block, in-season DUP, conjugate off-season) — duplicate to a real client, then adjust.'
where id = '439ad9b5-c69f-5118-881a-a55d1c3ee596';

-- 2) New mountain holder (crossed skis)
insert into clients (id, name, goal, notes) values
  ('0b8c03ff-e6ba-5970-99fc-dce314a636ae', '🎿 Mountain Templates', 'Program templates',
   'Ski/snowboard templates (block prep, in-season DUP, conjugate eccentric-power) — duplicate to a real client, then adjust.')
on conflict (id) do nothing;

-- 3) Move the three mountain programs
update programs set client_id = '0b8c03ff-e6ba-5970-99fc-dce314a636ae' where id = '84f9d89d-5420-54e5-8ff8-0ea7ae5cd19b';  -- Mountain Prep — Ski/Snowboard (12wk)
update programs set client_id = '0b8c03ff-e6ba-5970-99fc-dce314a636ae' where id = 'faf8934a-6158-5fea-a807-5e4777dcffab';  -- Mountain · In-Season DUP (8wk)
update programs set client_id = '0b8c03ff-e6ba-5970-99fc-dce314a636ae' where id = '47b13d89-73f4-5cd0-93a9-5b9b95234b9d';  -- Mountain · Conjugate Eccentric-Power (12wk)

-- 4) Verify
select c.name as holder, count(p.id) as programs
from clients c left join programs p on p.client_id = c.id
where c.id in ('439ad9b5-c69f-5118-881a-a55d1c3ee596', '0b8c03ff-e6ba-5970-99fc-dce314a636ae')
group by c.name order by c.name;
