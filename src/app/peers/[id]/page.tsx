"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';

type Message = { id: string; sender: 'me' | 'peer'; content: string; created_at: string };

export default function PeerChatPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const peerId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      const { data: existing } = await supabase.from('profiles').select('user_id').eq('user_id', user.id).maybeSingle();
      if (!existing) { router.replace('/onboarding'); return; }
      // TODO: fetch conversation/messages between user.id and peerId
      setLoading(false);
    };
    run();
  }, [router, peerId]);

  const send = async () => {
    if (!input.trim()) return;
    const m: Message = { id: Math.random().toString(36).slice(2), sender: 'me', content: input.trim(), created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, m]);
    setInput('');
    // TODO: POST to messages API
  };

  if (loading) return <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <div className="mt-4 h-[60vh] rounded-xl border border-black/10 dark:border-white/10 p-4 overflow-y-auto bg-background/60">
        {messages.length === 0 && (
          <div className="h-full grid place-items-center text-foreground/60 text-sm">No messages yet</div>
        )}
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.sender === 'me' ? 'ml-auto bg-blue-600 text-white' : 'bg-black/5 dark:bg-white/10'}`}>
              {m.content}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-background px-3 py-2 outline-none"
        />
        <button onClick={send} className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Send</button>
      </div>
    </div>
  );
}
