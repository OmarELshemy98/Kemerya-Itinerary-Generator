-- ============================================================
-- 00000000000007_add_itinerary_status_columns.sql
-- Adds approval/status + detail-storage columns to the itineraries
-- table that the app already expects but that are missing from the DB:
--   * is_approved  BOOLEAN  → Hold (false) / Approved (true), defaults to Hold
--   * booking_data JSONB   → full booking snapshot (PDF re-generation)
--   * updated_at   TIMESTAMPTZ → tracks approval / edit timestamps
-- Safe to run on a fresh OR existing Supabase project (idempotent).
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'itineraries' AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE itineraries ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'itineraries' AND column_name = 'booking_data'
  ) THEN
    ALTER TABLE itineraries ADD COLUMN booking_data JSONB;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'itineraries' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE itineraries ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;