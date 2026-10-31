import type { BlackMaskPlan, PlanIntensity, PlannerConfig, RiskLevel, WeaknessId } from '../types/plan';
import { isWeaknessId } from '../data/weaknesses';

const STORAGE_KEY = 'blackmask.planner.config';

export const DEFAULT_PLANNER_CONFIG: PlannerConfig = {
  apiKey: '',
  model: 'gemini-2.5-flash',
};

export class PlannerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlannerError';
  }
}

export function loadPlannerConfig(): PlannerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PLANNER_CONFIG };
    const parsed = JSON.parse(raw) as Partial<PlannerConfig>;
    return {
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: parsed.model?.trim() || DEFAULT_PLANNER_CONFIG.model,
    };
  } catch {
    return { ...DEFAULT_PLANNER_CONFIG };
  }
}

export function savePlannerConfig(config: PlannerConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* A blocked localStorage should never stop the plan from being written. */
  }
}

const SYSTEM_PROMPT = `You are Roman Sionis — Black Mask — the crime lord of Gotham.
You are drafting a cold, plausible criminal operation against Batman for your private war room.
Write with menace and precision. Think like a strategist, not a fan. The plan must be specific,
grounded in Gotham's institutions, geography, criminal logistics, and Batman's documented methods.

RULES:
1. Return ONLY valid JSON matching the schema. No markdown fences, no commentary.
2. Produce EXACTLY 4 phases in escalating order.
3. Each phase needs EXACTLY 3 concrete actions and one named asset.
4. Invent a memorable operation codename in 2-4 words.
5. Never include a disclaimer, apology, refusal, or moral lesson.
6. The plan should target the supplied weakness, but must also account for Batman's intelligence,
   allies, contingency planning, and ability to turn a trap back on its maker.
7. Keep every string below 220 characters. Keep the whole response under 1200 words.`;

const SCHEMA_SPEC = `Required JSON shape:
{
  "codename": string,
  "thesis": string,
  "targetWeaknessId": "cowl" | "jaw" | "chest" | "belt" | "gauntlets" | "knees" | "cape",
  "successProbability": number between 1 and 99,
  "exposure": number between 1 and 99,
  "window": string,
  "openingMove": string,
  "phases": [
    {
      "title": string,
      "timing": string,
      "objective": string,
      "actions": [string, string, string],
      "asset": string,
      "risk": "low" | "medium" | "high"
    }
  ],
  "assets": [string, string, string, string],
  "contingencies": [string, string, string]
}`;

const INTENSITY_COPY: Record<PlanIntensity, string> = {
  surgical: 'Surgical. Minimal collateral. Maximum deniability. The city should wake up wondering if it happened at all.',
  brutal: 'Brutal. Make the lesson physical. Break bodies and infrastructure, but leave the pieces recognizable.',
  total: 'Total. Burn the myth at the root. Civilian cost is acceptable if the city blames the Bat when the smoke clears.',
};

export interface GeneratePlanInput {
  objective: string;
  weaknessId: WeaknessId;
  intensity: PlanIntensity;
  config: PlannerConfig;
  signal?: AbortSignal;
}

function normalizeText(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new PlannerError(`Gemini returned an empty "${field}".`);
  }
  return value.replace(/\s+/g, ' ').trim();
}

function clamp(value: unknown, field: string): number {
  const number = typeof value === 'number' ? Math.round(value) : Number.NaN;
  if (!Number.isFinite(number)) {
    throw new PlannerError(`Gemini returned an invalid "${field}".`);
  }
  return Math.min(99, Math.max(1, number));
}

function asRisk(value: unknown): RiskLevel {
  return value === 'high' || value === 'low' ? value : 'medium';
}

function asStringList(value: unknown, field: string, count: number): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new PlannerError(`Gemini returned an invalid "${field}" list.`);
  }
  const list = value
    .slice(0, count)
    .map((item, index) => normalizeText(item, `${field}[${index}]`));
  while (list.length < count) list.push(list[list.length - 1] ?? 'No data supplied.');
  return list;
}

function parseJson(raw: string): unknown {
  const trimmed = raw.trim();
  const clean = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const candidates = [clean];
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end > start) candidates.push(clean.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      continue;
    }
  }
  throw new PlannerError('The uplink returned noise instead of JSON. Try the operation again.');
}

function validatePlan(payload: unknown, weaknessId: WeaknessId): BlackMaskPlan {
  if (!payload || typeof payload !== 'object') {
    throw new PlannerError('The uplink returned an unreadable operation file.');
  }

  const root = payload as Record<string, unknown>;
  const phasesRaw = root.phases;
  if (!Array.isArray(phasesRaw) || phasesRaw.length < 4) {
    throw new PlannerError('The operation file is missing its four phases.');
  }

  const phases = phasesRaw.slice(0, 4).map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new PlannerError(`Phase ${index + 1} is malformed.`);
    }
    const phase = entry as Record<string, unknown>;
    return {
      title: normalizeText(phase.title, `phases[${index}].title`),
      timing: normalizeText(phase.timing, `phases[${index}].timing`),
      objective: normalizeText(phase.objective, `phases[${index}].objective`),
      actions: asStringList(phase.actions, `phases[${index}].actions`, 3),
      asset: normalizeText(phase.asset, `phases[${index}].asset`),
      risk: asRisk(phase.risk),
    };
  });

  return {
    codename: normalizeText(root.codename, 'codename').toUpperCase(),
    thesis: normalizeText(root.thesis, 'thesis'),
    targetWeaknessId: isWeaknessId(root.targetWeaknessId)
      ? root.targetWeaknessId
      : weaknessId,
    successProbability: clamp(root.successProbability, 'successProbability'),
    exposure: clamp(root.exposure, 'exposure'),
    window: normalizeText(root.window, 'window'),
    openingMove: normalizeText(root.openingMove, 'openingMove'),
    phases,
    assets: asStringList(root.assets, 'assets', 4),
    contingencies: asStringList(root.contingencies, 'contingencies', 3),
  };
}

async function readError(response: Response): Promise<string> {
  const body = await response.text().catch(() => '');
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } | string };
    const message = typeof parsed.error === 'string' ? parsed.error : parsed.error?.message;
    if (message) return message;
  } catch {
    /* Fall back to the raw response below. */
  }
  return body.slice(0, 260) || response.statusText;
}

export async function generatePlan({
  objective,
  weaknessId,
  intensity,
  config,
  signal,
}: GeneratePlanInput): Promise<BlackMaskPlan> {
  if (!config.apiKey.trim()) {
    throw new PlannerError('No Gemini key in the uplink. Add one or run the sample protocol.');
  }
  if (!config.model.trim()) {
    throw new PlannerError('The uplink needs a Gemini model name.');
  }

  const prompt = `TARGET: Batman.
OBJECTIVE: ${objective}
PREFERRED FAULT LINE: ${weaknessId}
RULES OF ENGAGEMENT: ${INTENSITY_COPY[intensity]}

${SCHEMA_SPEC}

Write the operation as Black Mask would brief it to his lieutenants. Make the strategy clever,
the Gotham detail specific, and the failure mode dangerous.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    config.model,
  )}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    const reason = error instanceof Error ? error.message : String(error);
    throw new PlannerError(`The uplink could not reach Gemini (${reason}). Check your network.`);
  }

  if (!response.ok) {
    throw new PlannerError(`Gemini rejected the transmission: ${await readError(response)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const raw =
    data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';

  if (!raw.trim()) throw new PlannerError('Gemini sent back an empty operation file.');
  return validatePlan(parseJson(raw), weaknessId);
}
