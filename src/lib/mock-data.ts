import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

export const MOCK_ADMIN_USER: User = {
  id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  email: 'admin@telecom.demo',
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_SUPABASE_USER: SupabaseUser = {
  id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};
