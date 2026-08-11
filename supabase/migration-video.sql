-- ============================================================
-- Exercise demo videos: optional per-exercise video link.
-- With a link: the app embeds/opens that exact clip.
-- Without one: the demo button opens a form-focused video search.
-- ============================================================

alter table exercises add column if not exists video_url text;
