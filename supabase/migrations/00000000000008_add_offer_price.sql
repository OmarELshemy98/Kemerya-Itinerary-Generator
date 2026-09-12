-- ============================================================
-- 00000000000008_add_offer_price.sql
-- Adds the special-offer price to itineraries.
--   * offer_price NUMERIC → the discounted price (NULL/empty = no offer).
-- The original price stays in total_price; the offer price is the ACTIVE
-- price shown everywhere (old price is struck through).
-- Safe to run on a fresh OR existing Supabase project (idempotent).
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'itineraries' AND column_name = 'offer_price'
  ) THEN
    ALTER TABLE itineraries ADD COLUMN offer_price NUMERIC;
  END IF;
END $$;