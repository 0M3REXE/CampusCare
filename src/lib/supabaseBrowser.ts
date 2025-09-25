import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// In the browser (and especially during Next.js Fast Refresh / HMR) we can end up
// constructing multiple Supabase clients bound to the same storage key, which
// triggers the "Multiple GoTrueClient instances" warning. We keep a singleton
// on window during dev and a module-level cache otherwise.

declare global {
  var __SUPABASE_BROWSER_CLIENT__: SupabaseClient | undefined; // global singleton (dev/hmr)
}

let cached: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('Supabase env not configured');
  }

  if (typeof window !== 'undefined') {
    if (!window.__SUPABASE_BROWSER_CLIENT__) {
      window.__SUPABASE_BROWSER_CLIENT__ = createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
    }
    return window.__SUPABASE_BROWSER_CLIENT__;
  }

  if (!cached) {
    cached = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return cached;
}
