import { NextRequest } from 'next/server';
import { chatOnce } from '@/lib/gemini';
import { assessAndPersistRisk } from '@/lib/risk/service';
import { getSupabaseAdminClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const content = body?.content as string | undefined;
  const privacyMode = (body?.privacyMode as 'private' | 'standard' | undefined) ?? 'standard';
  const language = (body?.language as string | undefined) ?? 'en';

  if (!content || typeof content !== 'string') {
    return new Response(JSON.stringify({ error: { message: 'content is required' } }), { status: 400 });
  }

  // TODO: auth: derive user from bearer/session if needed. For now assume unauth'd placeholder.
  const userId = '00000000-0000-0000-0000-000000000000'; // Replace with real user extraction

  // (Optional) Persist message if not in private mode.
  let messageId: string | undefined;
  try {
    if (privacyMode !== 'private') {
      const supabase = getSupabaseAdminClient();
      const { data: msgRow, error: msgErr } = await supabase
        .from('messages')
        .insert({ conversation_id: id, role: 'user', content, language, modality: 'text' })
        .select('id')
        .single();
      if (!msgErr && msgRow) messageId = msgRow.id;
    }
  } catch (e) {
    console.error('message persistence failed', e);
  }

  // Generate a reply with Gemini (independent of risk persistence)
  const reply = await chatOnce(content);

  // Risk assessment (tie to persisted message if available; else ephemeral)
  let risk;
  try {
    risk = await assessAndPersistRisk({
      messageId: messageId ?? '00000000-0000-0000-0000-000000000000',
      conversationId: id,
      userId,
      messageText: content,
    });
  } catch (e) {
    console.error('risk assessment failed', e);
    risk = { level: 'none', score: 0, labels: [], thresholdCrossed: false };
  }

  return new Response(
    JSON.stringify({ data: { sessionId: id, reply, language, privacyMode, risk } }),
    { headers: { 'content-type': 'application/json' } }
  );
}
