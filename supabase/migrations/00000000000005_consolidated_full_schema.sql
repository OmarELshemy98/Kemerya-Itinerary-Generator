-- ============================================================================
-- Kemerya Itinerary Generator — CONSOLIDATED FULL SCHEMA (all-in-one)
-- Safe to run on a fresh Supabase project OR on an existing one.
-- Everything uses IF NOT EXISTS / DO-block guards so it is idempotent.
-- Run the whole script in Supabase Dashboard → SQL Editor in one go.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1) USER ROLE ENUM
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'operator', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2) PROFILES (mirrors auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'operator'::user_role,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- ============================================================================
-- 3) CACHE META
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cache_meta (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4) CACHED MAIN CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cached_main_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image TEXT,
  scraped_at TIMESTAMPTZ,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cached_main_cats_slug ON public.cached_main_categories(slug);

-- ============================================================================
-- 5) CACHED SUB CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cached_sub_categories (
  id TEXT PRIMARY KEY,
  main_category_id TEXT NOT NULL REFERENCES public.cached_main_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image TEXT,
  scraped_at TIMESTAMPTZ,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cached_sub_cats_main ON public.cached_sub_categories(main_category_id);
CREATE INDEX IF NOT EXISTS idx_cached_sub_cats_slug ON public.cached_sub_categories(slug);

-- ============================================================================
-- 6) CACHED TOURS (with dynamic-sync columns: prices_table, is_manual)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cached_tours (
  id TEXT PRIMARY KEY,
  sub_category_id TEXT REFERENCES public.cached_sub_categories(id) ON DELETE SET NULL,
  main_category_id TEXT REFERENCES public.cached_main_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT,
  duration_days INT,
  duration_nights INT,
  short_description TEXT,
  long_description TEXT,
  image TEXT,
  base_price_eur NUMERIC(12,2),
  base_price_usd NUMERIC(12,2),
  prices_table JSONB,
  highlights JSONB,
  inclusions JSONB,
  exclusions JSONB,
  itinerary JSONB,
  tags JSONB,
  is_popular BOOLEAN DEFAULT FALSE,
  is_manual BOOLEAN NOT NULL DEFAULT FALSE,
  has_details BOOLEAN DEFAULT FALSE,
  scraped_at TIMESTAMPTZ,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cached_tours_sub ON public.cached_tours(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_cached_tours_main ON public.cached_tours(main_category_id);
CREATE INDEX IF NOT EXISTS idx_cached_tours_is_manual ON public.cached_tours(is_manual);
CREATE INDEX IF NOT EXISTS idx_cached_tours_title ON public.cached_tours USING GIN (to_tsvector('english', title));

-- ============================================================================
-- 7) ITINERARIES (booking history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tour_id TEXT,
  tour_title TEXT,
  is_custom_tour BOOLEAN DEFAULT FALSE,
  custom_tour_title TEXT,
  custom_tour_description TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_whatsapp TEXT,
  travelers_adults INT DEFAULT 1,
  travelers_children INT DEFAULT 0,
  travelers_infants INT DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  price_per_person NUMERIC,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON public.itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON public.itineraries(created_at DESC);

-- ============================================================================
-- 8) AUDIT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- ============================================================================
-- 9) ROW LEVEL SECURITY
-- ============================================================================

-- --- itineraries ---
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own itineraries" ON public.itineraries;
CREATE POLICY "Users can view own itineraries"
  ON public.itineraries FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all itineraries" ON public.itineraries;
CREATE POLICY "Admins can view all itineraries"
  ON public.itineraries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can insert own itineraries" ON public.itineraries;
CREATE POLICY "Users can insert own itineraries"
  ON public.itineraries FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- --- audit_log ---
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_log;
CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_log;
CREATE POLICY "Users can view own audit logs"
  ON public.audit_log FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_log;
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 10) CACHED TABLES ACCESS POLICIES
-- The app reads cached_* with the publishable (anon/authenticated) key and
-- writes with the service-role key (which bypasses RLS). Allow read for all:
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cached_tours' AND policyname = 'Public read cached_tours'
  ) THEN
    CREATE POLICY "Public read cached_tours"
      ON public.cached_tours FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cached_main_categories' AND policyname = 'Public read cached_main_categories'
  ) THEN
    CREATE POLICY "Public read cached_main_categories"
      ON public.cached_main_categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cached_sub_categories' AND policyname = 'Public read cached_sub_categories'
  ) THEN
    CREATE POLICY "Public read cached_sub_categories"
      ON public.cached_sub_categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cache_meta' AND policyname = 'Public read cache_meta'
  ) THEN
    CREATE POLICY "Public read cache_meta"
      ON public.cache_meta FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================================================
-- 11) MARK EXISTING ADMIN-CREATED TOURS AS MANUAL (dynamic sync protection)
-- ============================================================================
UPDATE public.cached_tours
SET is_manual = TRUE
WHERE id NOT LIKE 'tour-web-%'
  AND (is_manual IS DISTINCT FROM TRUE);

-- ============================================================================
-- 12) WEBSITE-FAITHFUL FIELDS (overview / meeting point / trip notes / meta)
-- Mirrors the kemeryatours.com tour page sections:
--   #overview (#overview-text), #itinerary, #meeting_point (.td-about),
--   #included (.td-inc-box), #prices (.price-table), .travel-faq
-- Idempotent: safe to run multiple times.
-- ============================================================================
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
-- ============================================================================
-- DONE. Verification:
--   SELECT count(*) FROM public.cached_tours;
--   SELECT count(*) FROM public.cached_main_categories;
--   SELECT count(*) FROM public.cached_sub_categories;
-- ============================================================================
