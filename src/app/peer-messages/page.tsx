"use client";
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { usePeerConversations, usePeerMessages, useSendPeerMessage, useMarkConversationRead } from '@/lib/peer/hooks';

export default function PeerMessagesPage() {
  const supabase = getSupabaseBrowserClient();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newPeerId, setNewPeerId] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(res => {
      setAccessToken(res.data.session?.access_token || null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setAccessToken(sess?.access_token || null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [supabase]);

  const { conversations, refresh } = usePeerConversations(accessToken);
  const { messages, loadMore, done } = usePeerMessages(accessToken, activeId);
  const { send, sending } = useSendPeerMessage(accessToken, activeId);
  const { markRead } = useMarkConversationRead(accessToken, activeId);

  // Mark read when active changes & messages present
  useEffect(() => {
    if (activeId) { markRead(); }
  }, [activeId, markRead]);

  const startConversation = async () => {
    if (!accessToken || !newPeerId) return;
    const res = await fetch('/api/v1/peer/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ peerUserId: newPeerId })
    });
    if (res.ok) {
      await refresh();
      const data = await res.json();
      setActiveId(data.conversation.id);
      setNewPeerId('');
    }
  };

  const onSend = async () => {
    if (!draft.trim()) return;
    await send(draft.trim());
    setDraft('');
    markRead();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      <aside className="w-72 shrink-0 border-r border-black/10 dark:border-white/10 flex flex-col">
        <div className="p-3 border-b border-black/10 dark:border-white/10">
          <h2 className="font-semibold text-sm">Conversations</h2>
        </div>
        <div className="p-3 space-y-2 overflow-y-auto flex-1">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${activeId===c.id ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium truncate">{c.peer.display_name || 'Unknown'}</span>
                {c.unread > 0 && <span className="ml-2 inline-block min-w-[1.25rem] text-center rounded-full bg-rose-600 text-white text-[10px] px-[6px] py-[2px]">{c.unread}</span>}
              </div>
              <div className="text-xs opacity-70 truncate">{c.last_message_preview || 'No messages yet'}</div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-black/10 dark:border-white/10 space-y-2">
          <input
            value={newPeerId}
            onChange={e=>setNewPeerId(e.target.value)}
            placeholder="Peer user_id"
            className="w-full text-xs rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1 outline-none"
          />
          <button onClick={startConversation} disabled={!newPeerId} className="w-full text-xs rounded bg-blue-600 text-white py-1 disabled:opacity-50">Start</button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        {activeId ? (
          <>
            <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-tight">{conversations.find(c=>c.id===activeId)?.peer.display_name || 'Conversation'}</span>
                <span className="mt-1 text-[11px] leading-snug text-foreground/70 max-w-[60ch]">
                  {(conversations.find(c=>c.id===activeId)?.peer.interests || [])?.length
                    ? (conversations.find(c=>c.id===activeId)?.peer.interests as string[]).join(', ')
                    : 'No interests listed'}
                </span>
              </div>
              <button onClick={()=>markRead()} className="text-xs text-blue-600 whitespace-nowrap h-6 self-start">Mark read</button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-3 p-4">
              {messages.map(m => (
                <div key={m.id} className="max-w-[70%] rounded-lg px-3 py-2 text-sm bg-black/5 dark:bg-white/10 self-start">
                  <div className="text-[10px] opacity-60 mb-0.5">{m.sender}</div>
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div className="text-[10px] opacity-40 mt-1">{new Date(m.created_at).toLocaleTimeString()}</div>
                </div>
              ))}
              {!done && (
                <button onClick={loadMore} className="text-xs opacity-70 hover:opacity-100 self-center my-2">Load older…</button>
              )}
            </div>
            <div className="border-t border-black/10 dark:border-white/10 p-3 flex gap-2">
              <textarea
                value={draft}
                onChange={e=>setDraft(e.target.value)}
                placeholder="Type a message"
                className="flex-1 resize-none rounded border border-black/20 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
                rows={2}
              />
              <button onClick={onSend} disabled={!draft.trim() || sending} className="rounded bg-blue-600 text-white px-4 text-sm disabled:opacity-50 h-fit">Send</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm opacity-60">Select or start a conversation</div>
        )}
      </main>
    </div>
  );
}
