"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { usePeerMessages, useSendPeerMessage, useMarkConversationRead } from '@/lib/peer/hooks';

interface PeerProfile { user_id: string; display_name: string; interests?: string[]; visibility: string }

export default function PeerChatPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const peerId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [peerProfile, setPeerProfile] = useState<PeerProfile | null>(null);
  const [meId, setMeId] = useState<string | null>(null);

  const { messages, loadMore, done, setMessages } = usePeerMessages(accessToken, conversationId);
  const { send, sending } = useSendPeerMessage(accessToken, conversationId);
  const { markRead } = useMarkConversationRead(accessToken, conversationId);

  const sortedMessages = useMemo(() => {
    // Deduplicate by id then sort ascending by created_at
    const map = new Map<string, typeof messages[number]>();
    for (const m of messages) {
      // Keep the earliest created_at version if duplicates occur
      if (!map.has(m.id)) map.set(m.id, m);
    }
    return Array.from(map.values()).sort((a,b)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let unsub: (()=>void) | null = null;
    supabase.auth.getSession().then(res => {
      setAccessToken(res.data.session?.access_token || null);
      setMeId(res.data.session?.user?.id || null);
    });
    const { data } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setAccessToken(sess?.access_token || null);
      setMeId(sess?.user?.id || null);
    });
    unsub = () => data.subscription.unsubscribe();
    return () => { if (unsub) unsub(); };
  }, []);

  // Bootstrap: ensure session + profile + conversation
  useEffect(() => {
    const init = async () => {
      if (!accessToken || !meId) return;
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      const { data: existing } = await supabase.from('profiles').select('user_id').eq('user_id', user.id).maybeSingle();
      if (!existing) { router.replace('/onboarding'); return; }

      // Fetch peer profile (including interests)
      const { data: peerProf } = await supabase.from('profiles').select('user_id, display_name, interests, visibility').eq('user_id', peerId).maybeSingle();
      if (peerProf) setPeerProfile({ ...peerProf, interests: peerProf.interests || [] });

      // Create or retrieve conversation
      const res = await fetch('/api/v1/peer/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ peerUserId: peerId })
      });
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversation.id);
      }
      setLoading(false);
    };
    init();
  }, [accessToken, meId, peerId, router]);

  // Mark read when conversationId changes OR a new non-self message arrives (simple heuristic)
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
  useEffect(() => {
    if (!conversationId) return;
    // Find newest message not from me
    const newest = [...messages].find(m => m.sender !== meId); // messages are ascending after sorting outside; raw may be mixed
    if (newest && newest.id !== lastSeenMessageId) {
      setLastSeenMessageId(newest.id);
      markRead();
    }
  }, [conversationId, messages, meId, lastSeenMessageId, markRead]);

  const doSend = async () => {
    if (!input.trim() || sending || !conversationId) return;
    const result = await send(input.trim());
    if (result) {
      setMessages(prev => prev.some(m => m.id === result.id) ? prev : [result, ...prev]);
    }
    setInput('');
    markRead();
  };

  if (loading) return <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{peerProfile?.display_name ? `Chat with ${peerProfile.display_name}` : 'Chat'}</h1>
        <p className="mt-1 text-sm text-foreground/70">
          {peerProfile?.interests?.length ? peerProfile.interests.join(', ') : 'No interests listed'}
        </p>
      </div>
      <div className="flex flex-col h-[60vh] rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-background/60">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedMessages.length === 0 && (
            <div className="h-full grid place-items-center text-foreground/60 text-sm">No messages yet</div>
          )}
          {sortedMessages.map(m => {
            const mine = m.sender === meId;
            return (
              <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? 'ml-auto bg-blue-600 text-white' : 'bg-black/5 dark:bg-white/10'}`}>
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className="mt-1 text-[10px] opacity-60">{new Date(m.created_at).toLocaleTimeString()}</div>
              </div>
            );
          })}
          {!done && sortedMessages.length > 0 && (
            <button onClick={loadMore} className="text-xs opacity-70 hover:opacity-100 block mx-auto mt-6">Load older…</button>
          )}
        </div>
        <div className="border-t border-black/10 dark:border-white/10 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-background px-3 py-2 outline-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } }}
          />
          <button onClick={doSend} disabled={!input.trim() || sending} className="rounded-lg bg-blue-600 text-white px-4 py-2 disabled:opacity-50 hover:bg-blue-700">Send</button>
        </div>
      </div>
    </div>
  );
}
