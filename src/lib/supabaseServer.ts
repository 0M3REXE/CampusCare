import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export function getSupabaseServerClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('Supabase env not configured');
  }
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
