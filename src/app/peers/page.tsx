"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import Loader from '@/components/ui/Loader';

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

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
    setConfirmLoading(true);
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
    setConfirmLoading(false);
    setConfirmOpen(false);
  };

  if (loading) return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <Loader label="Fetching peers" />
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Peers</h1>
          <p className="mt-2 text-foreground/70">Find peer support and student communities.</p>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="rounded-full bg-blue-600 text-white px-5 py-2 font-medium hover:bg-blue-700"
        >
          Become a peer
        </button>
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

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/60" onClick={() => !confirmLoading && setConfirmOpen(false)} />
          <div className="absolute inset-0 grid place-items-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-background p-6 shadow-xl">
              <h3 className="text-lg font-semibold">Become a peer</h3>
              <p className="mt-2 text-sm text-foreground/70">Do you want to become a peer and be visible to others in the directory?</p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="rounded-full border px-4 py-2 text-sm border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06] disabled:opacity-60"
                  onClick={() => setConfirmOpen(false)}
                  disabled={confirmLoading}
                >
                  Cancel
                </button>
                <button
                  className="rounded-full bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                  onClick={becomePeer}
                  disabled={confirmLoading}
                >
                  {confirmLoading ? 'Becoming…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
