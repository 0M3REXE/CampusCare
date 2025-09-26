import { evaluateMessageRisk } from './evaluator';
import { determineLevel, RiskLevel } from './level';
import { getSupabaseAdminClient } from '@/lib/supabaseServer';

export interface RiskResult {
  level: RiskLevel;
  score: number;
  labels: string[];
  thresholdCrossed: boolean;
  alertId?: string;
}

async function fetchRollingScore(conversationId: string): Promise<number> {
  // Optional: rolling score from last 30 minutes
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.rpc('rolling_risk_score', { p_conversation_id: conversationId });
  if (error || data == null) return 0;
  return Number(data) || 0;
}

export async function assessAndPersistRisk(params: {
  messageId: string;
  conversationId: string;
  userId: string;
  messageText: string;
}): Promise<RiskResult> {
  const supabase = getSupabaseAdminClient();
  const { score, labels } = evaluateMessageRisk(params.messageText);

  // Rolling score is optional; if rpc not defined fallback gracefully.
  let rollingScore = 0;
  try {
    rollingScore = await fetchRollingScore(params.conversationId);
  } catch {
    rollingScore = 0;
  }
  const { level, thresholdCrossed } = determineLevel(score, rollingScore);

  // Insert risk_assessments row
  const { error: riskErr } = await supabase
    .from('risk_assessments')
    .insert({
      message_id: params.messageId,
      score,
      labels: labels.length ? labels : null,
      threshold_crossed: thresholdCrossed,
    });
  if (riskErr) {
    console.error('risk insert error', riskErr);
  }

  let alertId: string | undefined;
  if (thresholdCrossed && level !== 'none') {
    // Check for recent duplicate alert to avoid spamming
    const { data: recentAlerts } = await supabase
      .from('alerts')
      .select('id, level, created_at')
      .eq('user_id', params.userId)
      .eq('conversation_id', params.conversationId)
      .order('created_at', { ascending: false })
      .limit(1);

    const latest = recentAlerts?.[0];
    const reuseWindowMs = 10 * 60 * 1000; // 10 minutes
    const now = Date.now();
    const tooSoon = latest && new Date(latest.created_at).getTime() > (now - reuseWindowMs) && latest.level === level;

    if (!tooSoon) {
      const { data: alertRow, error: alertErr } = await supabase
        .from('alerts')
        .insert({
          user_id: params.userId,
            conversation_id: params.conversationId,
            risk_score: score,
            level,
            delivered_via: [],
        })
        .select('id')
        .single();
      if (!alertErr && alertRow) alertId = alertRow.id;
    }
  }

  return { level, score, labels, thresholdCrossed, alertId };
}
