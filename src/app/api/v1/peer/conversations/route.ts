import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseServer';

// Helper to extract and validate bearer token
function getBearer(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  return auth.slice(7);
}

// GET /api/v1/peer/conversations
// Returns the current user's peer conversations with peer profile + unread counts
export async function GET(req: NextRequest) {
  const token = getBearer(req);
  if (!token) return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  const admin = getSupabaseAdminClient();

  // Resolve session
  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes.user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  const me = userRes.user.id;

  try {
    // Fetch conversations where user is participant (two simple queries merged)
    const { data: aSide, error: aErr } = await admin
      .from('peer_conversations')
      .select('*')
      .eq('user_a', me)
      .order('last_message_at', { ascending: false });
    const { data: bSide, error: bErr } = await admin
      .from('peer_conversations')
      .select('*')
      .eq('user_b', me)
      .order('last_message_at', { ascending: false });
    if (aErr || bErr) return NextResponse.json({ error: aErr?.message || bErr?.message }, { status: 500 });

    const merged = [...(aSide || []), ...(bSide || [])];

    // Collect peer ids to hydrate minimal profile
    const peerIds = merged.map(c => (c.user_a === me ? c.user_b : c.user_a));
    const { data: profiles, error: profErr } = await admin
      .from('profiles')
      .select('user_id, display_name, visibility, interests')
      .in('user_id', peerIds.length ? peerIds : ['00000000-0000-0000-0000-000000000000']);
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

    const response = merged.map(c => {
      const peerId = c.user_a === me ? c.user_b : c.user_a;
      const unread = c.user_a === me ? c.unread_a : c.unread_b;
      return {
        id: c.id,
  peer: profileMap.get(peerId) || { user_id: peerId, display_name: 'Unknown', visibility: 'hidden', interests: [] },
        last_message_at: c.last_message_at,
        last_message_preview: c.last_message_preview,
        unread,
      };
    }).sort((a,b)=> (b.last_message_at ? new Date(b.last_message_at).getTime():0) - (a.last_message_at ? new Date(a.last_message_at).getTime():0));

    return NextResponse.json({ conversations: response });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/v1/peer/conversations  { peerUserId }
// Creates (or returns existing) conversation with target peer.
export async function POST(req: NextRequest) {
  const token = getBearer(req);
  if (!token) return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  const admin = getSupabaseAdminClient();
  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes.user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  const me = userRes.user.id;

  try {
    const body = await req.json().catch(()=>null) as { peerUserId?: string } | null;
    const peerUserId = body?.peerUserId;
    if (!peerUserId) return NextResponse.json({ error: 'peerUserId required' }, { status: 400 });
    if (peerUserId === me) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });

    // Ensure peer profile exists & visible or already have conversation
    const { data: peerProfile, error: peerErr } = await admin
      .from('profiles')
      .select('user_id, display_name, visibility')
      .eq('user_id', peerUserId)
      .maybeSingle();
    if (peerErr) return NextResponse.json({ error: peerErr.message }, { status: 500 });
    if (!peerProfile) return NextResponse.json({ error: 'Peer not found' }, { status: 404 });

    // Look for existing conversation (either ordering)
    const { data: existing, error: existErr } = await admin
      .from('peer_conversations')
      .select('*')
      .or(`and(user_a.eq.${me},user_b.eq.${peerUserId}),and(user_a.eq.${peerUserId},user_b.eq.${me})`)
      .maybeSingle();
    if (existErr && existErr.code !== 'PGRST116') return NextResponse.json({ error: existErr.message }, { status: 500 });

    if (existing) {
      return NextResponse.json({ conversation: existing, existed: true });
    }

    // Insert new conversation: user_a = lesser UUID lexicographically for consistency
    const order = [me, peerUserId].sort();
    const user_a = order[0];
    const user_b = order[1];
    const { data: inserted, error: insErr } = await admin
      .from('peer_conversations')
      .insert({ user_a, user_b })
      .select('*')
      .single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ conversation: inserted, existed: false });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
