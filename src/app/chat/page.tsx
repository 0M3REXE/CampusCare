"use client";
import { useEffect, useRef, useState } from 'react';

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const create = async () => {
      const res = await fetch('/api/v1/chat/sessions', { method: 'POST' });
      const json = await res.json();
      setSessionId(json?.data?.id);
    };
    create();
  }, []);

  const send = async () => {
    if (!input.trim() || !sessionId) return;
    const content = input.trim();
    setMessages((m) => [...m, { role: 'user', text: content }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/chat/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content, privacyMode: 'private', language: 'en' }),
      });
      const json = await res.json();
      const reply = json?.data?.reply ?? 'No reply';
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Error sending message.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">CampusCare Chat (Private Mode)</h1>
      {!sessionId && <p>Creating session…</p>}
      <div className="border rounded p-3 min-h-64 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={m.role === 'user' ? 'bg-blue-600 text-white px-2 py-1 rounded' : 'bg-gray-200 px-2 py-1 rounded'}>
              {m.text}
            </span>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Assistant is typing…</div>}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message"
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-50" onClick={send} disabled={!sessionId || loading}>
          Send
        </button>
      </div>
    </div>
  );
}
