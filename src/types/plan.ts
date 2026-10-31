export type WeaknessId =
  | 'cowl'
  | 'jaw'
  | 'chest'
  | 'belt'
  | 'gauntlets'
  | 'knees'
  | 'cape';

export type RiskLevel = 'low' | 'medium' | 'high';

export type PlanIntensity = 'surgical' | 'brutal' | 'total';

export interface Weakness {
  id: WeaknessId;
  index: string;
  label: string;
  shortLabel: string;
  bodyPart: string;
  severity: number;
  summary: string;
  exploit: string;
  tell: string;
}

export interface PlanPhase {
  title: string;
  timing: string;
  objective: string;
  actions: string[];
  asset: string;
  risk: RiskLevel;
}

export interface BlackMaskPlan {
  codename: string;
  thesis: string;
  targetWeaknessId: WeaknessId;
  successProbability: number;
  exposure: number;
  window: string;
  openingMove: string;
  phases: PlanPhase[];
  assets: string[];
  contingencies: string[];
}

export interface PlannerConfig {
  apiKey: string;
  model: string;
}
