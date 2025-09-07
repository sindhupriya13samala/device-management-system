/*
  # Utilization Logs Schema

  1. New Tables
    - `utilization_logs`
      - `id` (uuid, primary key)
      - `device_id` (uuid, foreign key to devices)
      - `hours_used` (numeric)
      - `log_date` (date)
      - `notes` (text, optional)
      - `created_by` (uuid, foreign key to user_profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `utilization_logs` table
    - Add policies for authenticated users based on roles
*/

CREATE TABLE IF NOT EXISTS utilization_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  hours_used numeric(10,2) NOT NULL CHECK (hours_used >= 0),
  log_date date NOT NULL,
  notes text,
  created_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE utilization_logs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read utilization logs
CREATE POLICY "Authenticated users can read utilization logs"
  ON utilization_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can insert utilization logs
CREATE POLICY "Authenticated users can insert utilization logs"
  ON utilization_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
  );

-- Admins and managers can update utilization logs
CREATE POLICY "Admins and managers can update utilization logs"
  ON utilization_logs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins and managers can delete utilization logs
CREATE POLICY "Admins and managers can delete utilization logs"
  ON utilization_logs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_utilization_logs_device_date 
  ON utilization_logs(device_id, log_date);

CREATE INDEX IF NOT EXISTS idx_utilization_logs_created_by 
  ON utilization_logs(created_by);