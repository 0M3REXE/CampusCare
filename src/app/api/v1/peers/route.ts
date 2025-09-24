import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
    if (!token) return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });

    const admin = getSupabaseAdminClient();
    // Start peers query in parallel
    const peersPromise = admin
      .from('profiles')
      .select('user_id, display_name, interests, visibility')
      .limit(50);

    // Verify session and get user id
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    const me = userRes.user;

    // Get my profile
    const { data: myProfile, error: myErr } = await admin
      .from('profiles')
      .select('user_id, display_name, interests, visibility')
      .eq('user_id', me.id)
      .maybeSingle();
    if (myErr) return NextResponse.json({ error: myErr.message }, { status: 500 });
    if (!myProfile) return NextResponse.json({ error: 'No profile', code: 'NO_PROFILE' }, { status: 403 });

    // Resolve peers list and filter out me
    const { data: othersRaw, error } = await peersPromise;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const others = (othersRaw ?? []).filter((p) => p.user_id !== me.id);

    return NextResponse.json({ peers: others, myProfile });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
