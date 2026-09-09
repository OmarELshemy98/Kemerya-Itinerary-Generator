-- Standalone migration: website-faithful tour fields
-- (also included in 00000000000005). Safe to run on its own in SQL Editor.
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS duration_label TEXT;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS overview JSONB;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS overview_html TEXT;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS meeting_point TEXT;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS meeting_point_html TEXT;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS meeting_point_images JSONB;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS trip_notes JSONB;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS gallery_images JSONB;
ALTER TABLE public.cached_tours ADD COLUMN IF NOT EXISTS source_url TEXT;
