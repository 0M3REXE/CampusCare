"use client";
import { useEffect, useRef, useState } from 'react';
import useVapi from '@/lib/useVapi';

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const { isSessionActive, toggleCall, toggleMute, isMuted, conversation, volumeLevel, sendMessage, voiceError } = useVapi();
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
      // also forward to voice if active
      try { sendMessage('assistant', reply); } catch {}
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Error sending message.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Chat</h1>
          <p className="mt-2 text-foreground/70">Ask anything. We’ll guide you to the right support.</p>
        </div>
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-background/60 backdrop-blur shadow-sm">
          <div className="h-[460px] overflow-y-auto p-4 space-y-3">
            {!sessionId && <div className="text-sm text-foreground/60">Creating session…</div>}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-black/[.06] dark:bg-white/[.08]'} px-3 py-2 rounded-2xl max-w-[75%]`}>{m.text}</div>
              </div>
            ))}
            {loading && <div className="text-sm text-foreground/60">Assistant is typing…</div>}
          </div>
          <div className="border-t border-black/10 dark:border-white/10 p-3 flex gap-2 items-center">
            <input
              ref={inputRef}
              className="flex-1 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message"
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl disabled:opacity-50"
              onClick={send}
              disabled={!sessionId || loading}
            >
              Send
            </button>
            <div className="flex items-center gap-2">
              <button
                aria-pressed={voiceOpen}
                onClick={() => setVoiceOpen((v) => !v)}
                className={`px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 ${voiceOpen ? 'bg-black/10 dark:bg-white/10' : 'bg-transparent'}`}
                title="Show voice controls"
              >
                🎤
              </button>
              {voiceOpen && (
                <>
                  <button
                    onClick={toggleCall}
                    className={`px-3 py-2 rounded-xl ${isSessionActive ? 'bg-red-600 text-white' : 'bg-green-600 text-white'} transition-colors`}
                    title={isSessionActive ? 'Stop voice' : 'Start voice'}
                  >
                    {isSessionActive ? 'Stop' : 'Start'}
                  </button>
                  <button
                    onClick={toggleMute}
                    className={`px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 ${isMuted ? 'bg-black/10 dark:bg-white/10' : 'bg-transparent'}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <div className="w-16 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden" title="Mic level">
                    <div className="h-full bg-blue-600 transition-[width]" style={{ width: `${Math.max(0, Math.min(1, volumeLevel)) * 100}%` }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {voiceOpen && (
          <div className="mt-3 rounded-2xl border border-black/10 dark:border-white/10 p-3">
            {voiceError && (
              <div className="mb-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 p-2 text-sm">
                {voiceError}
              </div>
            )}
            <div className="text-sm mb-2 text-foreground/70">Voice transcript</div>
            <div className="max-h-40 overflow-y-auto text-sm space-y-1">
              {conversation.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <span className="shrink-0 text-foreground/60">{m.role === 'user' ? 'You' : 'Assistant'}:</span>
                  <span className="whitespace-pre-wrap">{m.text}</span>
                  {!m.isFinal && <span className="text-foreground/40">(…)</span>}
                </div>
              ))}
              {!conversation.length && (
                <div className="text-foreground/50">No transcript yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
