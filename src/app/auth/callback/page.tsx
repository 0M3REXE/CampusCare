"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      // 1) Exchange `code` for session if present (OAuth PKCE)
      const code = params.get('code');
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch {}
      }
      // 2) Ensure session is ready
      const getToken = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) return null;
        return data.session?.access_token ?? null;
      };
      let token = await getToken();
      if (!token) { await new Promise((r) => setTimeout(r, 200)); token = await getToken(); }
      if (!token) { setError('No active session. Try logging in again.'); return; }
      const { data } = await supabase.auth.getSession();
      const session = data.session!;
      // Provision user record in users_public
      try {
        await fetch('/api/v1/auth/provision', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } catch {}
      // Check profile presence
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      router.replace(profile ? '/peers' : '/onboarding');
    };
    run();
  }, [router, params]);

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <h1 className="text-2xl font-semibold">Signing you in…</h1>
      {error && <p className="mt-2 text-rose-600 dark:text-rose-400 text-sm">{error}</p>}
    </div>
  );
}
