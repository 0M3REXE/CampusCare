import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseServer';

function getBearer(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  return auth.slice(7);
}

// POST /api/v1/peer/conversations/:id/read  -> marks unread count for requester to 0
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = getBearer(req);
  if (!token) return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  const admin = getSupabaseAdminClient();
  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes.user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  const me = userRes.user.id;
  const { id: convoId } = await context.params; // Await params per Next.js dynamic route requirement

  try {
    const { data: convo, error: convoErr } = await admin
      .from('peer_conversations')
      .select('*')
      .eq('id', convoId)
      .maybeSingle();
    if (convoErr) return NextResponse.json({ error: convoErr.message }, { status: 500 });
    if (!convo || (convo.user_a !== me && convo.user_b !== me)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (convo.user_a === me) {
      const { error: updErr } = await admin
        .from('peer_conversations')
        .update({ unread_a: 0 })
        .eq('id', convoId);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    } else if (convo.user_b === me) {
      const { error: updErr } = await admin
        .from('peer_conversations')
        .update({ unread_b: 0 })
        .eq('id', convoId);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
