-- Dynamic catalog sync migration
-- Adds columns needed for the merge/upsert sync strategy:
--   cached_tours.prices_table : per-person pricing tiers scraped from the website
--   cached_tours.is_manual    : flags tours created manually by admins (never overwritten by sync)
--   cached_sub_categories.image : sub-category image from the website
-- Run in Supabase Dashboard → SQL Editor.

ALTER TABLE public.cached_tours
  ADD COLUMN IF NOT EXISTS prices_table JSONB;

ALTER TABLE public.cached_tours
  ADD COLUMN IF NOT EXISTS is_manual BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.cached_sub_categories
  ADD COLUMN IF NOT EXISTS image TEXT;

-- Index to quickly find website-scraped vs manual tours
CREATE INDEX IF NOT EXISTS idx_cached_tours_is_manual ON public.cached_tours(is_manual);

-- Mark existing admin-created tours (ids not produced by the scraper) as manual
UPDATE public.cached_tours
SET is_manual = TRUE
WHERE id NOT LIKE 'tour-web-%'
  AND (is_manual IS DISTINCT FROM TRUE);