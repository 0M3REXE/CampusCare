"use client";
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <h1 className="text-2xl font-semibold">Log in</h1>
  <p className="mt-2 text-foreground/70">We&#39;ll email you a magic link to sign in.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-background px-3 py-2 outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700"
          disabled={!email}
        >
          Send magic link
        </button>
      </form>
      {sent && (
        <div className="mt-4 text-sm text-green-600 dark:text-green-400">Check your inbox for the login link.</div>
      )}
      {error && (
        <div className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</div>
      )}
    </div>
  );
}
