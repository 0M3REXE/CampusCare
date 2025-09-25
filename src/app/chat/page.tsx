"use client";
import { useEffect, useRef, useState } from 'react';
import useVapi from '@/lib/useVapi';
import { PromptBlock } from '@/components/chat/PromptBlock';
import { AudioControls } from '@/components/chat/AudioControls';
import { VoiceVisualizer } from '@/components/chat/VoiceVisualizer';

interface ChatMessage { role: 'user' | 'assistant'; text: string }

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const { isSessionActive, toggleCall, toggleMute, isMuted, conversation, volumeLevel, sendMessage, voiceError } = useVapi();
  const inputRef = useRef<HTMLInputElement>(null);

  // session creation
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
      try { sendMessage('assistant', reply); } catch {}
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Error sending message.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const promptLines = ["I'm listening, CampusCare Voice Assistant.", "What's on your mind?"]; // placeholder personalization

  return (
    <div className="min-h-screen w-full bg-[#0c1630] text-white flex flex-col" role="main">
      {/* Mode Switch */}
      <div className="flex justify-center mt-4">
        <div className="inline-flex rounded-full bg-white/10 p-1 text-sm" role="tablist" aria-label="Chat mode">
          <button
            role="tab"
            aria-selected={mode === 'voice'}
            onClick={() => setMode('voice')}
            className={`px-4 py-1.5 rounded-full focus:outline-none focus-visible:ring ${mode === 'voice' ? 'bg-white text-[#0c1630] font-medium' : 'text-white/70'}`}
          >
            Voice
          </button>
          <button
            role="tab"
            aria-selected={mode === 'text'}
            onClick={() => setMode('text')}
            className={`px-4 py-1.5 rounded-full focus:outline-none focus-visible:ring ${mode === 'text' ? 'bg-white text-[#0c1630] font-medium' : 'text-white/70'}`}
          >
            Text
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">
        {mode === 'voice' && (
          <div className="flex flex-col items-center gap-10">
            <PromptBlock lines={promptLines} />
            <AudioControls
              isSessionActive={isSessionActive}
              toggleCall={toggleCall}
              isMuted={isMuted}
              toggleMute={toggleMute}
            />
            <div className="mt-4">
              <VoiceVisualizer volumeLevel={volumeLevel} active={isSessionActive} />
            </div>
            {voiceError && (
              <div className="mt-4 text-sm text-amber-300 max-w-md text-center" role="alert">{voiceError}</div>
            )}
            {/* Transcript */}
            <div className="mt-6 w-full max-w-xl bg-white/5 rounded-2xl p-4 max-h-52 overflow-y-auto">
              <div className="text-xs uppercase tracking-wide text-white/50 mb-2">Transcript</div>
              {conversation.length === 0 && (
                <div className="text-white/40 text-sm">No transcript yet.</div>
              )}
              <ul className="space-y-1 text-sm">
                {conversation.map((m, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-white/50 shrink-0">{m.role === 'user' ? 'You' : 'Assistant'}:</span>
                    <span className="whitespace-pre-wrap">{m.text}</span>
                    {!m.isFinal && <span className="text-white/30">(…)</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {mode === 'text' && (
          <div className="w-full max-w-3xl flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
              {!sessionId && <div className="text-sm text-white/60">Creating session…</div>}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10'} px-3 py-2 rounded-2xl max-w-[75%]`}>{m.text}</div>
                </div>
              ))}
              {loading && <div className="text-sm text-white/60">Assistant is typing…</div>}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type your message"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring focus:ring-blue-500/40"
              />
              <button
                onClick={send}
                disabled={!sessionId || loading}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-colors font-medium"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
