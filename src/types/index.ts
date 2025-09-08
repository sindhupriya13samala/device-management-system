export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'modem' | 'cable';
  status: 'available' | 'in_use' | 'maintenance' | 'decommissioned';
  serial_number: string;
  model: string;
  location_id?: string;
  location?: Location;
  purchase_date: string;
  warranty_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  device_count?: number;
  created_at: string;
  updated_at: string;
}

export interface UtilizationLog {
  id: string;
  device_id: string;
  device?: Device;
  hours_used: number;
  log_date: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'maintenance' | 'low_stock' | 'end_of_life' | 'system' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  device_id?: string;
  device?: Device;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export interface DashboardStats {
  total_devices: number;
  available_devices: number;
  in_use_devices: number;
  maintenance_devices: number;
  decommissioned_devices: number;
  active_alerts: number;
  locations: number;
}

export interface DeviceTypeStats {
  type: string;
  count: number;
}

export interface MonthlyUsage {
  month: string;
  usage_hours: number;
}