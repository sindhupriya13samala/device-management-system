/*
  # Locations Schema

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `city` (text)
      - `country` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `locations` table
    - Add policies for authenticated users based on roles
*/

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'USA',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read locations
CREATE POLICY "Authenticated users can read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins and managers can insert locations
CREATE POLICY "Admins and managers can insert locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins and managers can update locations
CREATE POLICY "Admins and managers can update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins and managers can delete locations
CREATE POLICY "Admins and managers can delete locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for locations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_locations_updated_at'
  ) THEN
    CREATE TRIGGER update_locations_updated_at
      BEFORE UPDATE ON locations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;