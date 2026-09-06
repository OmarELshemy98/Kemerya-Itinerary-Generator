-- Create itineraries table to store booking/itinerary history
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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

-- Add phone_number to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number TEXT;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON itineraries(created_at DESC);

-- Enable RLS
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- Policies for itineraries
-- Users can view their own itineraries
CREATE POLICY "Users can view own itineraries"
  ON itineraries FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all itineraries
CREATE POLICY "Admins can view all itineraries"
  ON itineraries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Users can insert their own itineraries
CREATE POLICY "Users can insert own itineraries"
  ON itineraries FOR INSERT
  WITH CHECK (user_id = auth.uid());