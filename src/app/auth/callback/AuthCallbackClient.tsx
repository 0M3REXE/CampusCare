'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

export default function AuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      const code = params.get('code');
      if (code) {
        try { await supabase.auth.exchangeCodeForSession(code); } catch {}
      }
      const getToken = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) return null;
        return data.session?.access_token ?? null;
      };
      let token = await getToken();
      if (!token) { await new Promise(r => setTimeout(r, 200)); token = await getToken(); }
      if (!token) { if (!cancelled) setError('No active session. Try logging in again.'); return; }
      const { data } = await supabase.auth.getSession();
      const session = data.session!;
      try {
        await fetch('/api/v1/auth/provision', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } });
      } catch {}
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (!cancelled) router.replace(profile ? '/peers' : '/onboarding');
    };
    run();
    return () => { cancelled = true; };
  }, [router, params]);

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      {error ? (
        <>
          <div className="mb-4">
            <Skeleton variant="text" width="60%" className="mb-2 h-8" />
            <SkeletonText lines={2} />
          </div>
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
            <p className="text-rose-600 dark:text-rose-400 text-sm">{error}</p>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <Skeleton variant="text" width="40%" className="h-8 mb-2" />
            <SkeletonText lines={1} />
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div className="space-y-2">
            <Skeleton variant="button" width="100%" />
            <SkeletonText lines={2} />
          </div>
        </div>
      )}
    </div>
  );
}
