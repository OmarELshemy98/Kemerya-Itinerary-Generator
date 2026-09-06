-- Kemerya Itinerary Generator — Initial Schema Migration
-- Run this in Supabase Dashboard → SQL Editor
-- Timestamp: 00000000000000_init.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'operator', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table (source of truth for user metadata, mirrors auth.users via id FK)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'operator'::user_role,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Cache metadata table
CREATE TABLE IF NOT EXISTS public.cache_meta (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cached Main Categories
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

-- Cached Sub Categories
CREATE TABLE IF NOT EXISTS public.cached_sub_categories (
  id TEXT PRIMARY KEY,
  main_category_id TEXT NOT NULL REFERENCES public.cached_main_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  scraped_at TIMESTAMPTZ,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cached_sub_cats_main ON public.cached_sub_categories(main_category_id);
CREATE INDEX IF NOT EXISTS idx_cached_sub_cats_slug ON public.cached_sub_categories(slug);

-- Cached Tours
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
  highlights JSONB,
  inclusions JSONB,
  exclusions JSONB,
  itinerary JSONB,
  tags JSONB,
  is_popular BOOLEAN DEFAULT FALSE,
  has_details BOOLEAN DEFAULT FALSE,
  scraped_at TIMESTAMPTZ,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cached_tours_sub ON public.cached_tours(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_cached_tours_main ON public.cached_tours(main_category_id);
CREATE INDEX IF NOT EXISTS idx_cached_tours_title ON public.cached_tours USING GIN (to_tsvector('english', title));

-- RLS: For this module we assume RLS is disabled or policies allow anon access to profiles table.
-- If you enable RLS later, add policies here. Example:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
