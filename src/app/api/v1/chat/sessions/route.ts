import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST() {
  // For near-zero-cost, we keep sessions in-memory ephemeral on serverless (stateless),
  // and return a new id; clients can use it to correlate messages in the UI.
  // If Supabase is configured, you can persist later.
  const id = randomUUID();
  return new Response(JSON.stringify({ data: { id } }), {
    headers: { 'content-type': 'application/json' },
  });
}
