"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export interface PeerConversationSummary {
  id: string;
  peer: { user_id: string; display_name: string; visibility: string; interests?: string[] };
  last_message_at: string | null;
  last_message_preview: string | null;
  unread: number;
}
export interface PeerMessage {
  id: string; sender: string; body: string; created_at: string;
}

// Fetch with bearer token (session access token) - caller ensures user is logged in
async function apiFetch<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {})
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export function usePeerConversations(accessToken: string | null) {
  const [conversations, setConversations] = useState<PeerConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const pollRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true); setError(null);
    try {
      const data = await apiFetch<{ conversations: PeerConversationSummary[] }>(
        '/api/v1/peer/conversations', accessToken
      );
      setConversations(data.conversations);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { refresh(); }, [accessToken, refresh]);

  // Realtime subscription for conversation updates (unread counts / preview)
  useEffect(() => {
    if (!accessToken || !env.supabaseUrl || !env.supabaseAnonKey) return;
    // Lazy init client (no session persistence needed)
    if (!supabaseRef.current) {
      supabaseRef.current = createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false } });
    }
    const client = supabaseRef.current;
    // Bind auth token so realtime RLS matches user
    try { client.realtime.setAuth(accessToken); } catch {}
    const channel = client
      .channel('peer_conversations_rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'peer_conversations' }, (payload) => {
        const row = payload.new as Partial<PeerConversationSummary> & { id: string; last_message_at?: string | null; last_message_preview?: string | null };
        setConversations(prev => prev.map(c => c.id === row.id ? {
          ...c,
          last_message_at: row.last_message_at ?? c.last_message_at,
          last_message_preview: row.last_message_preview ?? c.last_message_preview,
          unread: c.unread // unchanged (accurate unread requires perspective)
        } : c));
      })
      .subscribe();
    // Polling fallback every 15s (covers cases where realtime not replicated)
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => { refresh(); }, 15000);
    return () => { client.removeChannel(channel); };
  }, [accessToken, refresh]);

  return { conversations, loading, error, refresh, setConversations };
}

export function usePeerMessages(accessToken: string | null, conversationId: string | null) {
  const [messages, setMessages] = useState<PeerMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false); // no more messages
  const cursorRef = useRef<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialLoadedRef = useRef(false); // prevent double-load in React Strict Mode

  const loadingRef = useRef(false);
  const doneRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!accessToken || !conversationId) return;
    if (loadingRef.current || doneRef.current) return;
    loadingRef.current = true;
    // Cancel any existing request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true); // state update (async) for UI only
    try {
      const url = new URL(`/api/v1/peer/conversations/${conversationId}/messages`, window.location.origin);
      if (cursorRef.current) url.searchParams.set('cursor', cursorRef.current);
      const res = await fetch(url.pathname + url.search, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { messages: PeerMessage[] };
      if (data.messages.length === 0) {
        setDone(true); doneRef.current = true;
      } else {
        // Append at end (we keep newest-first ordering in state for simplicity?)
        // Current API returns newest-first; we'll append and rely on stable ordering.
        setMessages(prev => [...prev, ...data.messages]);
        const last = data.messages[data.messages.length - 1];
        cursorRef.current = last.created_at;
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        // aborted fetch - ignore
      } else {
        // swallow for MVP; could set an error state
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [accessToken, conversationId]);

  // Reset when conversation changes
  useEffect(() => {
    // Reset when conversationId changes
    setMessages([]);
    setDone(false);
    doneRef.current = false;
    cursorRef.current = null;
    initialLoadedRef.current = false;
    if (conversationId && accessToken) {
      if (!initialLoadedRef.current) {
        initialLoadedRef.current = true;
        loadMore();
      }
    }
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [conversationId, accessToken, loadMore]);

  // Realtime subscription for new messages ONLY (no polling fallback to reduce duplicate GETs)
  useEffect(() => {
    if (!conversationId || !accessToken || !env.supabaseUrl || !env.supabaseAnonKey) return;
    if (!supabaseRef.current) {
      supabaseRef.current = createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false } });
    }
    const client = supabaseRef.current;
    try { client.realtime.setAuth(accessToken); } catch {}
    const channel = client
      .channel(`peer_messages_${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'peer_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const row = payload.new as PeerMessage;
        setMessages(prev => prev.some(m => m.id === row.id) ? prev : [row, ...prev]);
      })
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [conversationId, accessToken]);

  return { messages, loadMore, loading, done, setMessages };
}

export function useSendPeerMessage(accessToken: string | null, conversationId: string | null, onSent?: (m: PeerMessage)=>void) {
  const [sending, setSending] = useState(false);
  const send = useCallback(async (body: string) => {
    if (!accessToken || !conversationId || sending) return;
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const data = await apiFetch<{ message: PeerMessage }>(
        `/api/v1/peer/conversations/${conversationId}/messages`,
        accessToken,
        { method: 'POST', body: JSON.stringify({ body: trimmed }) }
      );
      onSent?.(data.message);
      return data.message;
    } finally {
      setSending(false);
    }
  }, [accessToken, conversationId, sending, onSent]);
  return { send, sending };
}

export function useMarkConversationRead(accessToken: string | null, conversationId: string | null) {
  const lastCallRef = useRef<number>(0);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markRead = useCallback((opts?: { debounceMs?: number }) => {
    if (!accessToken || !conversationId) return;
    const debounceMs = opts?.debounceMs ?? 250;
    if (pendingRef.current) clearTimeout(pendingRef.current);
    pendingRef.current = setTimeout(async () => {
      const now = Date.now();
      // Throttle actual network call to at most once every 2s
      if (now - lastCallRef.current < 2000) return;
      lastCallRef.current = now;
      await apiFetch<{ ok: boolean }>(
        `/api/v1/peer/conversations/${conversationId}/read`,
        accessToken,
        { method: 'POST' }
      ).catch(()=>{});
    }, debounceMs);
  }, [accessToken, conversationId]);
  return { markRead };
}
