/** The six ways through the armour, and the shape of the memo that comes back. */

export type VectorId = 'code' | 'family' | 'city' | 'fortune' | 'method' | 'compassion';

export interface TargetVector {
  id: VectorId;
  code: string;
  name: string;
  /** One line used in the index. */
  claim: string;
  /** What we actually believe about him. */
  diagnosis: string;
  /** How it gets used. */
  leverage: string;
  /** What it costs us when it goes wrong. */
  exposure: string;
  asset: string;
  /** Plotted position on the Gotham map, in viewBox units. */
  at: { x: number; y: number };
}

export interface PlanPhase {
  name: string;
  objective: string;
  actions: string[];
  asset: string;
  window: string;
}

export interface PlanAsset {
  name: string;
  role: string;
  cost: string;
}

export interface PlanContingency {
  trigger: string;
  response: string;
}

export interface BlackMaskPlan {
  codename: string;
  thesis: string;
  vectorId: VectorId;
  vector: string;
  phases: PlanPhase[];
  assets: PlanAsset[];
  contingencies: PlanContingency[];
  successProbability: number;
  exposureRisk: number;
  collateral: number;
  failureMode: string;
  closingLine: string;
  origin: 'gemini' | 'sample';
  model?: string;
  createdAt?: number;
}

export type OperationMode = 'financial' | 'reputation' | 'siege' | 'false_flag' | 'decoy';
export type CrewSize = 'handful' | 'crew' | 'syndicate';
export type Budget = 'lean' | 'funded' | 'unlimited';
export type Collateral = 'surgical' | 'acceptable' | 'citywide';

export interface OperationBrief {
  mode: OperationMode;
  vector: VectorId;
  crew: CrewSize;
  budget: Budget;
  collateral: Collateral;
  directive: string;
}

export interface UplinkSettings {
  apiKey: string;
  model: string;
}
