/*
  # Alerts Schema

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (text, enum)
      - `severity` (text, enum)
      - `status` (text, enum: active/resolved)
      - `device_id` (uuid, foreign key to devices, optional)
      - `resolved_at` (timestamp, optional)
      - `resolved_by` (uuid, foreign key to user_profiles, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `alerts` table
    - Add policies for authenticated users based on roles
*/

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('maintenance', 'low_stock', 'end_of_life', 'system', 'security')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  device_id uuid REFERENCES devices(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read alerts
CREATE POLICY "Authenticated users can read alerts"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins and managers can insert alerts
CREATE POLICY "Admins and managers can insert alerts"
  ON alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins and managers can update alerts
CREATE POLICY "Admins and managers can update alerts"
  ON alerts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins can delete alerts
CREATE POLICY "Admins can delete alerts"
  ON alerts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically set resolved_at when status changes to resolved
CREATE OR REPLACE FUNCTION handle_alert_resolution()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status = 'active' THEN
    NEW.resolved_at = now();
    NEW.resolved_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for alert resolution
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_alert_resolution_trigger'
  ) THEN
    CREATE TRIGGER handle_alert_resolution_trigger
      BEFORE UPDATE ON alerts
      FOR EACH ROW EXECUTE FUNCTION handle_alert_resolution();
  END IF;
END $$;

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);