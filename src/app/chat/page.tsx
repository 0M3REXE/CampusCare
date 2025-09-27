"use client";
import { useRef, useState } from 'react';
import useVapi from '@/lib/useVapi';
import { PromptBlock } from '@/components/chat/PromptBlock';
import { AudioControls } from '@/components/chat/AudioControls';
import { VoiceVisualizer } from '@/components/chat/VoiceVisualizer';
import { useOrCreateConversation, useMessages, useSendMessage } from '@/lib/chat/hooks';
import { Skeleton } from '@/components/ui/Skeleton';

// (Legacy ChatMessage interface removed; using persisted schema messages instead)

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const { isSessionActive, toggleCall, toggleMute, isMuted, conversation, volumeLevel, sendMessage, voiceError } = useVapi();
  const inputRef = useRef<HTMLInputElement>(null);
  // Initial schema persisted conversation + messages
  const { conversationId, initializing } = useOrCreateConversation();
  const { messages: persistedMessages, loadMore, loading: loadingMessages } = useMessages(conversationId);
  const { send: sendPersisted, sending } = useSendMessage(conversationId);

  const send = async () => {
    if (!input.trim() || !conversationId) return;
    const content = input.trim();
    setInput('');
    // Optimistic local auditory send (voice API) not tied to persisted messages list
    try { sendMessage('user', content); } catch {}
    await sendPersisted(content, 'private', 'en');
    inputRef.current?.focus();
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
              {initializing && (
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="bg-white/10 px-3 py-2 rounded-2xl max-w-[75%]">
                      <Skeleton variant="text" width="200px" className="bg-white/20" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-600/30 px-3 py-2 rounded-2xl max-w-[75%]">
                      <Skeleton variant="text" width="150px" className="bg-white/20" />
                    </div>
                  </div>
                </div>
              )}
              {!initializing && persistedMessages.length === 0 && <div className="text-sm text-white/60">No messages yet.</div>}
              {persistedMessages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.sender === 'student' ? 'bg-blue-600 text-white' : m.sender === 'bot' ? 'bg-white/10' : 'bg-green-700/70'} px-3 py-2 rounded-2xl max-w-[75%] whitespace-pre-wrap`}>{m.content}</div>
                </div>
              ))}
              {loadingMessages && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div className={`${i % 2 === 0 ? 'bg-white/10' : 'bg-blue-600/30'} px-3 py-2 rounded-2xl max-w-[75%]`}>
                        <Skeleton variant="text" width={`${120 + Math.random() * 80}px`} className="bg-white/20" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {sending && <div className="text-sm text-white/60">Assistant is processing…</div>}
              {!loadingMessages && !initializing && persistedMessages.length >= 30 && (
                <button onClick={() => loadMore()} className="mt-2 text-xs text-white/50 underline">Load older messages</button>
              )}
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
                disabled={!conversationId || sending || initializing}
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
