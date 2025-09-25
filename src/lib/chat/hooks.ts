"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Initial schema conversation: user_id (student) + optional counselor_id; messages have sender role among student|bot|counselor
export interface Conversation {
  id: string;
  user_id: string | null;
  counselor_id: string | null;
  privacy_mode: 'standard' | 'private';
  started_at: string;
  ended_at: string | null;
  last_message_at?: string | null; // derived client-side
  last_message_preview?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'student' | 'bot' | 'counselor';
  content: string | null;
  language: string | null;
  modality: 'text' | 'voice' | null;
  created_at: string;
}

function getClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) throw new Error('Supabase env not configured');
  return createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } });
}

// Fetch conversations for current auth.uid() (as student / user owner)
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof getClient> | null>(null);

  useEffect(() => { if (!supabaseRef.current) supabaseRef.current = getClient(); }, []);

  const load = useCallback(async () => {
    if (!supabaseRef.current) return;
    setLoading(true); setError(null);
    try {
      const { data: { user } } = await supabaseRef.current.auth.getUser();
      if (!user) { setConversations([]); return; }
      const { data, error: err } = await supabaseRef.current
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });
      if (err) throw err;
      setConversations(data || []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error';
      setError(msg);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { conversations, loading, error, reload: load, setConversations };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof getClient> | null>(null);
  // Store realtime channel reference (supabase-js returns RealtimeChannel type)
  // Use `unknown` initially to avoid any; narrow where used.
  const subscriptionRef = useRef<ReturnType<ReturnType<typeof getClient>['channel']> | null>(null);
  const cursorRef = useRef<string | null>(null);
  const doneRef = useRef(false);

  useEffect(() => { if (!supabaseRef.current) supabaseRef.current = getClient(); }, []);

  const loadMore = useCallback(async () => {
    if (!conversationId || !supabaseRef.current || loading || doneRef.current) return;
    setLoading(true);
    try {
      let query = supabaseRef.current
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(30);
      if (cursorRef.current) {
        query = query.lt('created_at', cursorRef.current);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) { doneRef.current = true; }
      else {
        setMessages(prev => [...prev, ...data]);
        cursorRef.current = data[data.length - 1].created_at;
      }
    } finally { setLoading(false); }
  }, [conversationId, loading]);

  // reset when conversation changes
  useEffect(() => {
    setMessages([]); cursorRef.current = null; doneRef.current = false;
    if (conversationId) loadMore();
  }, [conversationId, loadMore]);

  // realtime
  useEffect(() => {
    if (!conversationId || !supabaseRef.current) return;
    const client = supabaseRef.current;
    if (subscriptionRef.current) client.removeChannel(subscriptionRef.current);
    subscriptionRef.current = client
      .channel(`messages_${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const row = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === row.id) ? prev : [row, ...prev]);
      })
      .subscribe();
    return () => { if (subscriptionRef.current) client.removeChannel(subscriptionRef.current); };
  }, [conversationId]);

  return { messages, loadMore, loading, setMessages };
}

export function useSendMessage(conversationId: string | null) {
  const [sending, setSending] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof getClient> | null>(null);
  useEffect(() => { if (!supabaseRef.current) supabaseRef.current = getClient(); }, []);

  const send = useCallback(async (content: string, privacyMode: 'standard' | 'private' = 'standard', language = 'en') => {
    if (!conversationId || sending || !supabaseRef.current) return;
    const trimmed = content.trim(); if (!trimmed) return;
    setSending(true);
    try {
      // Determine sender role: assume student (owner) for now.
      const { data: { user } } = await supabaseRef.current.auth.getUser();
      if (!user) return;
      // Insert message
      const { error } = await supabaseRef.current.from('messages').insert({
        conversation_id: conversationId,
        sender: 'student',
        content: trimmed,
        language,
        modality: 'text'
      });
      if (error) throw error;
      // Optionally call AI for assistant reply (non-streaming) and insert
      // For now call existing API to reuse Gemini risk classification logic
      const res = await fetch(`/api/v1/chat/sessions/${conversationId}/message`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: trimmed, privacyMode, language })
      });
      if (res.ok) {
        const json = await res.json();
        const reply: string | undefined = json?.data?.reply;
        if (reply) {
          await supabaseRef.current.from('messages').insert({
            conversation_id: conversationId,
            sender: 'bot',
            content: reply,
            language,
            modality: 'text'
          });
        }
      }
    } finally { setSending(false); }
  }, [conversationId, sending]);

  return { send, sending };
}

export function useOrCreateConversation() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const supabaseRef = useRef<ReturnType<typeof getClient> | null>(null);
  useEffect(() => { if (!supabaseRef.current) supabaseRef.current = getClient(); }, []);

  useEffect(() => {
    const init = async () => {
      if (!supabaseRef.current) return;
      const { data: { user } } = await supabaseRef.current.auth.getUser();
      if (!user) { setInitializing(false); return; }
      // Find existing open conversation (no ended_at)
      const { data, error } = await supabaseRef.current
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .is('ended_at', null)
        .limit(1);
      if (error) { setInitializing(false); return; }
      if (data && data.length > 0) {
        setConversationId(data[0].id); setInitializing(false); return;
      }
      // Create a new conversation row
      const { data: created, error: createErr } = await supabaseRef.current
        .from('conversations')
        .insert({ user_id: user.id, privacy_mode: 'standard' })
        .select('id')
        .single();
      if (!createErr && created) setConversationId(created.id);
      setInitializing(false);
    };
    init();
  }, []);

  return { conversationId, initializing };
}
