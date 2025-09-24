"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';

type Peer = {
  user_id: string;
  display_name: string | null;
  interests: string[] | null;
  visibility?: string | null;
};

export default function PeersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [peers, setPeers] = useState<Peer[]>([]);

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      // Fetch peers and myProfile from server API with bearer token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch('/api/v1/peers', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 403) { router.replace('/onboarding'); return; }
      if (res.ok) {
        const json = await res.json();
        const others = json.peers as Peer[];
        const myProfile: Peer = json.myProfile as Peer;
        const combined = myProfile?.visibility === 'public' ? [myProfile, ...others] : others;
        setPeers(combined);
      }
      setLoading(false);
    };
    run();
  }, [router]);

  const becomePeer = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login'); return; }
    const ok = window.confirm('Do you want to become a peer and be visible to others?');
    if (!ok) return;
    // Set visibility to 'public' to opt-in
    const { error } = await supabase
      .from('profiles')
      .update({ visibility: 'public', updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (!error) {
      // Refresh from server API to keep logic consistent
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch('/api/v1/peers', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (res.ok) {
        const json = await res.json();
        const others = json.peers as Peer[];
        const myProfile: Peer = json.myProfile as Peer;
        const combined = myProfile?.visibility === 'public' ? [myProfile, ...others] : others;
        setPeers(combined);
      }
    }
  };

  if (loading) return <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Peers</h1>
        <p className="mt-2 text-foreground/70">Find peer support and student communities.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {peers.map((p) => (
          <div key={p.user_id} className="rounded-2xl border border-black/10 dark:border-white/10 p-5 bg-background/60">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600" />
              <div>
                <div className="font-medium">{p.display_name ?? 'Student'}</div>
                <div className="text-sm text-foreground/60">{(p.interests ?? []).slice(0,2).join(', ') || 'Peer'}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(p.interests ?? []).slice(0,3).map((t) => (
                <span key={t} className="text-xs rounded-full border border-black/10 dark:border-white/10 px-2 py-1 text-foreground/70">{t}</span>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Link href={`/peers/${p.user_id}`} className="text-sm rounded-full border px-3 py-1.5 border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]">
                Connect
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Floating action button to become a peer */}
      <button
        onClick={becomePeer}
        className="fixed bottom-6 right-6 rounded-full bg-blue-600 text-white size-12 shadow-lg hover:bg-blue-700 grid place-items-center text-2xl"
        aria-label="Become a peer"
        title="Become a peer"
      >
        +
      </button>
    </div>
  );
}
