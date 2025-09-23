import { NextRequest } from 'next/server';
import { chatOnce, classifyRisk } from '@/lib/gemini';

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

  // Generate a reply with Gemini
  const reply = await chatOnce(content);
  // Lightweight risk scoring
  const risk = await classifyRisk(content);

  // If privacyMode === 'private', do not persist message content. Persistence is optional and omitted here.

  return new Response(
  JSON.stringify({ data: { sessionId: id, reply, language, privacyMode, risk } }),
    { headers: { 'content-type': 'application/json' } }
  );
}
