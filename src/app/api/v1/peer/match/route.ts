import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseServer';

// Lightweight interfaces describing the profile shape needed for matching
interface ProfilePreferences {
  strengths?: unknown;
  weaknesses?: unknown;
  compatibility?: unknown;
  institution?: unknown;
  [k: string]: unknown;
}

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  interests: string[] | null;
  preferences: ProfilePreferences | null;
}

// GET /api/v1/peer/match
// Returns up to 20 recommended peers with deterministic scoring components
export async function GET(req: NextRequest) {
  try {
    // Extract bearer token (same pattern as /peers endpoint)
    const auth = req.headers.get('authorization') || '';
    const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
    if (!token) return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });

    const admin = getSupabaseAdminClient();
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    const userId = userRes.user.id;

    // Load current user profile
    const { data: me, error: meErr } = await admin
      .from('profiles')
      .select('user_id, display_name, interests, preferences')
      .eq('user_id', userId)
      .maybeSingle();
    if (meErr || !me) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
    }

    const myInterests: string[] = Array.isArray(me.interests) ? me.interests : [];
    const prefs: ProfilePreferences = me.preferences || {};
    const myStrengths: string[] = Array.isArray(prefs.strengths) ? (prefs.strengths as string[]) : [];
    const myWeaknesses: string[] = Array.isArray(prefs.weaknesses) ? (prefs.weaknesses as string[]) : [];
    const myInstitution: string | undefined = typeof prefs.institution === 'string' ? (prefs.institution as string) : undefined;

    // Existing peer conversations to exclude already connected users
    const { data: existingConvos } = await admin
      .from('peer_conversations')
      .select('user_a, user_b')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`);
    const excludeIds = new Set<string>();
    existingConvos?.forEach(c => {
      if (c.user_a !== userId) excludeIds.add(c.user_a);
      if (c.user_b !== userId) excludeIds.add(c.user_b);
    });

    // Candidate pool (limited for performance; can paginate / randomize later)
    const { data: candidates, error: candErr } = await admin
      .from('profiles')
      .select('user_id, display_name, interests, preferences')
      .neq('user_id', userId)
      .limit(400);
    if (candErr) {
      return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }

    // Normalization helper
    const norm = (arr: string[] = []) => arr.map(s => s.trim().toLowerCase()).filter(Boolean);
    const myInterestsNorm = norm(myInterests);

    const matches = (candidates as ProfileRow[] | null || [])
      .filter(c => !excludeIds.has(c.user_id))
      .map(c => {
        const cPrefs: ProfilePreferences = c.preferences || {};
        const rawCInterests: string[] = Array.isArray(c.interests) ? c.interests : [];
        const rawMyInterests = myInterests;
        const cInterestsNorm = norm(rawCInterests);
        const cStrengths: string[] = Array.isArray(cPrefs.strengths) ? (cPrefs.strengths as string[]) : [];
        const cInstitution: string | undefined = typeof cPrefs.institution === 'string' ? (cPrefs.institution as string) : undefined;

        // Interest overlap (case-insensitive Jaccard)
        const sharedNorm = cInterestsNorm.filter(i => myInterestsNorm.includes(i));
        const unionSize = new Set([...cInterestsNorm, ...myInterestsNorm]).size || 1;
        let interestOverlap = sharedNorm.length / unionSize;
        // Minimum floor: any shared interest counts as at least 0.05
        if (sharedNorm.length > 0 && interestOverlap < 0.05) interestOverlap = 0.05;

        // Complement: their strengths cover my weaknesses (case sensitive for now)
        const complements = myWeaknesses.filter(w => cStrengths.includes(w));
        const complementStrength = complements.length;

        // Same institution boost (case-insensitive compare)
        const sameInstitution = myInstitution && cInstitution && myInstitution.toLowerCase().trim() === cInstitution.toLowerCase().trim() ? 1 : 0;

        // Diversity penalty if identical strengths (exact match)
        const diversityPenalty = cStrengths.length === myStrengths.length && cStrengths.every(s => myStrengths.includes(s)) ? -0.1 : 0; // soften penalty

        const rawScore =
          0.5 * interestOverlap +
          0.20 * complementStrength +
          0.20 * sameInstitution +
          0.10 * (diversityPenalty + 0.1); // shifted smaller penalty band

        return {
          user_id: c.user_id,
          display_name: c.display_name ?? 'Student',
          institution: cInstitution,
          sharedInterests: sharedNorm.slice(0, 12),
          complements,
          interestOverlap: Number(interestOverlap.toFixed(4)),
          complementStrength,
          sameInstitution,
          score: Number(rawScore.toFixed(4)),
          debug: {
            rawInterestsMine: rawMyInterests,
            rawInterestsCandidate: rawCInterests,
            normInterestsMine: myInterestsNorm,
            normInterestsCandidate: cInterestsNorm,
            sharedNormCount: sharedNorm.length
          }
        };
      })
      // Do NOT filter out zero-score results now; still sort top 20 so user sees something
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return NextResponse.json({ matches });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'Unexpected error', detail: message }, { status: 500 });
  }
}

// TODO (future): Persist match scores for analytics, add pagination, incorporate time-decay & conversation recency, and optionally experiment with embedding similarity.