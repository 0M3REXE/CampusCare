"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { usePeerMatches } from '@/lib/peer/matchHooks';
import { Skeleton, SkeletonText, SkeletonCard } from '@/components/ui/Skeleton';

// (No peer list shown by default; keep only matching workflow)

export default function PeersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isPeer, setIsPeer] = useState(false);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { matches, loading: matchLoading, error: matchError, fetchMatches } = usePeerMatches(accessToken);

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      // Hit peers endpoint ONLY to enforce onboarding + determine if user opted in (no list rendering)
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      setAccessToken(token ?? null);
      const res = await fetch('/api/v1/peers', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 403) { router.replace('/onboarding'); return; }
      if (res.ok) {
        try {
          const json = await res.json();
          // myProfile.visibility tells us
          if (json?.myProfile?.visibility === 'public') setIsPeer(true);
        } catch {}
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
    await supabase
      .from('profiles')
      .update({ visibility: 'public', updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    setIsPeer(true);
    // No need to refresh list; visibility change only matters for inclusion in others' matching.
    setConfirmLoading(false);
    setConfirmOpen(false);
  };

  if (loading) return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Skeleton variant="text" width="30%" className="h-9 mb-2" />
            <SkeletonText lines={1} />
          </div>
          <Skeleton variant="button" width="140px" />
        </div>

        {/* Info card skeleton */}
        <div className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6">
          <Skeleton variant="text" width="50%" className="h-6 mb-2" />
          <SkeletonText lines={2} />
        </div>

        {/* Match button skeleton */}
        <div className="mt-4 mb-10">
          <Skeleton variant="button" width="100px" />
        </div>

        {/* Match results skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Peers</h1>
          <p className="mt-2 text-foreground/70">Find peer support and student communities.</p>
        </div>
        {isPeer ? (
          <button
            disabled
            className="rounded-full bg-green-600 text-white px-5 py-2 font-medium cursor-default opacity-90"
          >
            You are a peer
          </button>
        ) : (
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-full bg-blue-600 text-white px-5 py-2 font-medium hover:bg-blue-700"
          >
            Become a peer
          </button>
        )}
      </div>

      {/* Informational Card (no button inside) */}
      <div className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-900/10 p-6">
        <h2 className="text-xl font-semibold">Find likeminded peers</h2>
        <p className="mt-1 text-sm text-foreground/70 max-w-prose">
          We’ll suggest peers who share interests or complement your strengths and weaknesses.
        </p>
      </div>

      {/* Match button below the card */}
      <div className="mt-4 mb-10 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        {matchError && <span className="text-sm text-red-600 dark:text-red-400">{matchError}</span>}
        <button
          disabled={!accessToken || matchLoading}
          onClick={fetchMatches}
          className="rounded-full bg-indigo-600 text-white px-6 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {matchLoading ? 'Matching…' : matches ? 'Refresh matches' : 'Match'}
        </button>
        {matches && !matchLoading && (
          <span className="text-xs text-foreground/60">{matches.length} suggestion{matches.length === 1 ? '' : 's'} found</span>
        )}
      </div>

      {/* Matches rendered below button */}
      {matches && (
        <div className="mb-12">
          {matches.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map(m => (
                <div key={m.user_id} className="rounded-2xl border border-black/10 dark:border-white/10 p-5 bg-background/70 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold leading-tight">{m.display_name}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {m.sharedInterests.slice(0,3).map(tag => (
                          <span key={tag} className="text-[10px] tracking-wide rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-foreground/70">{tag}</span>
                        ))}
                        {m.sharedInterests.length === 0 && <span className="text-xs italic text-foreground/50">No shared interests</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 border border-indigo-600/20">{m.score.toFixed(2)}</div>
                      {m.institution && <div className="mt-1 text-[10px] text-foreground/60">{m.institution}</div>}
                    </div>
                  </div>
                  {m.complements.length > 0 && (
                    <div className="mt-3 text-[11px] text-foreground/70">
                      <span className="font-medium">Complements:</span> {m.complements.slice(0,4).join(', ')}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={async () => {
                        if (!accessToken) return;
                        try {
                          await fetch('/api/v1/peer/conversations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                            body: JSON.stringify({ peerUserId: m.user_id })
                          });
                          // Navigate regardless; server will reuse existing conversation if present
                          window.location.href = `/peers/${m.user_id}`;
                        } catch {
                          window.location.href = `/peers/${m.user_id}`;
                        }
                      }}
                      className="text-xs rounded-full border px-3 py-1.5 border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !matchLoading && (
            <div className="text-sm text-foreground/60 italic">No strong matches yet. Try updating your profile interests & strengths.</div>
          )}
        </div>
      )}

      {/* No general peer list rendered by design */}

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
