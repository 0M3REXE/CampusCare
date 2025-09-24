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

export function getSupabaseAdminClient() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    throw new Error('Supabase admin env not configured');
  }
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false },
  });
}
