export type RiskLevel = 'none' | 'info' | 'warning' | 'critical';
export interface RiskAssessmentMeta {
  level: RiskLevel;
  score: number;
  labels: string[];
  thresholdCrossed: boolean;
  alertId?: string;
}
