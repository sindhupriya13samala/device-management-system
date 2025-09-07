/*
  # Devices Schema

  1. New Tables
    - `devices`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text, enum: router/switch/modem/cable)
      - `status` (text, enum: available/in_use/maintenance/decommissioned)
      - `serial_number` (text, unique)
      - `model` (text)
      - `location_id` (uuid, foreign key to locations)
      - `purchase_date` (date)
      - `warranty_expiry` (date, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `devices` table
    - Add policies for authenticated users based on roles
*/

CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('router', 'switch', 'modem', 'cable')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'decommissioned')),
  serial_number text UNIQUE NOT NULL,
  model text NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  purchase_date date NOT NULL,
  warranty_expiry date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read devices
CREATE POLICY "Authenticated users can read devices"
  ON devices
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins and managers can insert devices
CREATE POLICY "Admins and managers can insert devices"
  ON devices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins, managers, and technicians can update devices (status changes)
CREATE POLICY "Authenticated users can update devices"
  ON devices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'technician')
    )
  );

-- Admins and managers can delete devices
CREATE POLICY "Admins and managers can delete devices"
  ON devices
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Trigger for devices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_devices_updated_at'
  ) THEN
    CREATE TRIGGER update_devices_updated_at
      BEFORE UPDATE ON devices
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;