export type RiskLevel = 'none' | 'info' | 'warning' | 'critical';

export interface LevelDecision {
  level: RiskLevel;
  thresholdCrossed: boolean;
}

export function determineLevel(messageScore: number, rollingScore?: number): LevelDecision {
  const rolling = rollingScore ?? 0;
  if (messageScore >= 6) return { level: 'critical', thresholdCrossed: true };
  if (messageScore >= 4) return { level: 'warning', thresholdCrossed: true };
  if (rolling >= 6) return { level: 'warning', thresholdCrossed: true };
  if (rolling >= 3) return { level: 'info', thresholdCrossed: true };
  return { level: 'none', thresholdCrossed: false };
}
