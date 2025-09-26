import { RISK_RULES } from './rules';

export interface RiskEvaluation {
  score: number;
  labels: string[];
}

function hasFirstPerson(text: string) {
  return /(\bi\b|\bi'm\b|\bim\b|\bmy\b)/i.test(text);
}

export function evaluateMessageRisk(text: string): RiskEvaluation {
  const norm = text.toLowerCase();
  let score = 0;
  const labels: string[] = [];

  for (const rule of RISK_RULES) {
    if (rule.pattern.test(norm)) {
      if (rule.requireFirstPerson && !hasFirstPerson(norm)) continue;
      score += rule.weight;
      labels.push(rule.id);
    }
  }

  // Cap extreme stacking
  if (score > 10) score = 10;

  return { score, labels };
}
