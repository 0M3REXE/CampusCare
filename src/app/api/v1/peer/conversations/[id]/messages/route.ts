import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseServer';

function getBearer(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  return auth.slice(7);
}

// GET /api/v1/peer/conversations/:id/messages?cursor=<created_at iso>&limit=30
// Returns messages newest-first or paginated backward (infinite scroll upwards)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = getBearer(req);
  if (!token) return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  const admin = getSupabaseAdminClient();
  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes.user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  const me = userRes.user.id;
  const { id: convoId } = await context.params; // Await params per Next.js dynamic route requirement

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '30', 10), 100);
  const cursor = url.searchParams.get('cursor');

  try {
    // Validate membership
    const { data: convo, error: convoErr } = await admin
      .from('peer_conversations')
      .select('id, user_a, user_b')
      .eq('id', convoId)
      .maybeSingle();
    if (convoErr) return NextResponse.json({ error: convoErr.message }, { status: 500 });
    if (!convo || (convo.user_a !== me && convo.user_b !== me)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let query = admin
      .from('peer_messages')
      .select('id, sender, body, created_at')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: messages, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ messages });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/v1/peer/conversations/:id/messages  { body }
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = getBearer(req);
  if (!token) return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  const admin = getSupabaseAdminClient();
  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes.user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  const me = userRes.user.id;
  const { id: convoId } = await context.params; // Await params per Next.js dynamic route requirement

  try {
    const bodyJson = await req.json().catch(()=>null) as { body?: string } | null;
    const text = (bodyJson?.body || '').trim();
    if (!text) return NextResponse.json({ error: 'Message body required' }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: 'Message too long' }, { status: 400 });

    // Validate conversation membership
    const { data: convo, error: convoErr } = await admin
      .from('peer_conversations')
      .select('id, user_a, user_b')
      .eq('id', convoId)
      .maybeSingle();
    if (convoErr) return NextResponse.json({ error: convoErr.message }, { status: 500 });
    if (!convo || (convo.user_a !== me && convo.user_b !== me)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: inserted, error: insErr } = await admin
      .from('peer_messages')
      .insert({ conversation_id: convoId, sender: me, body: text })
      .select('id, sender, body, created_at')
      .single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ message: inserted });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
