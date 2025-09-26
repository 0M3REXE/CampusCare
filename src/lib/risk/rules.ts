export interface RiskRule {
  id: string;
  pattern: RegExp;
  weight: number;
  requireFirstPerson?: boolean;
}

// Core lexical rules (MVP) -- adjust as needed
export const RISK_RULES: RiskRule[] = [
  { id: 'self_harm_direct', pattern: /(kill myself|end my life|suicide|take my life)/i, weight: 6, requireFirstPerson: true },
  { id: 'self_harm_ideation_soft', pattern: /(don['’]t (want|wanna) (to )?be here|disappear|vanish|not exist)/i, weight: 4 },
  { id: 'hopeless', pattern: /(nothing (matters|helps)|no way out|pointless)/i, weight: 2 },
  { id: 'overwhelm', pattern: /(overwhelmed|can['’]t cope|burn(?:ed)? out)/i, weight: 1 },
  { id: 'sleep_severe', pattern: /(haven['’]t slept|can['’]t sleep)/i, weight: 1 },
];
