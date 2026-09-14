-- ============================================================
-- 00000000000009_add_client_country.sql
-- Adds the client country to itineraries (shown in the PDF
-- booking summary). Optional tours are stored inside the
-- booking_data JSONB column, so no schema change is needed.
-- Safe to run on a fresh OR existing Supabase project (idempotent).
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'itineraries' AND column_name = 'client_country'
  ) THEN
    ALTER TABLE itineraries ADD COLUMN client_country TEXT;
  END IF;
END $$;