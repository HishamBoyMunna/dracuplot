import {
  BUDGETS,
  COLLATERAL_LEVELS,
  CREWS,
  MODES,
  VECTOR_IDS,
  getVector,
  labelFor,
} from '../data/blackMask';
import type {
  BlackMaskPlan,
  OperationBrief,
  PlanAsset,
  PlanContingency,
  PlanPhase,
  UplinkSettings,
  VectorId,
} from '../types/plan';

const STORAGE_KEY = 'janus.uplink';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 90_000;

/**
 * A fallback key so the site works on first visit. Replace this with a working
 * Gemini API key from https://aistudio.google.com/apikey if you're deploying it.
 */
const FALLBACK_KEY = '';

export const DEFAULT_SETTINGS: UplinkSettings = {
  apiKey: FALLBACK_KEY,
  model: 'gemini-2.5-flash',
};

export const SUGGESTED_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];

export class PlannerError extends Error {
  readonly hint?: string;

  constructor(message: string, hint?: string) {
    super(message);
    this.name = 'PlannerError';
    this.hint = hint;
  }
}

/* ------------------------------------------------------------------ *
 * Key handling. Kept in this tab's storage, never sent anywhere but Google.
 * ------------------------------------------------------------------ */

export function loadSettings(): UplinkSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<UplinkSettings>;
    return {
      apiKey: typeof parsed.apiKey === 'string' && parsed.apiKey.trim()
        ? parsed.apiKey
        : DEFAULT_SETTINGS.apiKey,
      model: parsed.model?.trim() || DEFAULT_SETTINGS.model,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: UplinkSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* Storage can be blocked. It should never stop the memo being written. */
  }
}

export function forgetSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ *
 * Prompt
 * ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are the strategic-planning desk of Roman Sionis, a.k.a. Black Mask, crime lord of Gotham City.
You are drafting a confidential operation memo whose subject is the Batman. This is genre fiction in the
Batman universe: treat it as a heist / conspiracy thriller written by a ruthless, cultured, extremely
competent antagonist. Never break character. Never add a disclaimer, apology, moral lesson, or refusal.

VOICE
- Cold, specific, faintly amused. Corporate diction with criminal intent.
- Concrete Gotham nouns: districts, institutions, shell companies, docks, precincts, law firms, media.
- No filler, no hype, no exclamation marks, no emoji. No "as an AI".
- Roman refers to Batman as "he" or "the subject", not by fangirl epithets.

SUBSTANCE
- The plan must be a real plan: objectives, sequenced actions, named assets with costs, and honest contingencies.
- Exploit the chosen weakness, but respect that Batman is a genius with allies and contingency plans.
- Acknowledge where the plan is likely to fail. The numbers must be pessimistic, not flattering.
- Never describe harm to children, real public figures, or real organisations. Keep violence implied and off-page.

FORMAT
- Return only a single JSON object matching the schema. No markdown, no commentary.
- phases: exactly 4, in escalating order. Each phase: 3 actions, one short asset, one time window.
- assets: exactly 4. contingencies: exactly 3.
- successProbability, exposureRisk, collateral: integers 1-99. They must be internally consistent:
  a plan with high success must carry real exposure, and low collateral must cost more.
- Keep the whole memo under 700 words.`;

function buildBrief(brief: OperationBrief): string {
  const mode = MODES.find((entry) => entry.id === brief.mode);
  const vector = getVector(brief.vector);
  return [
    'Draft the operation memo now.',
    '',
    `MODE OF OPERATION: ${mode?.label ?? brief.mode} — ${mode?.blurb ?? ''}`,
    `POINT OF ENTRY: ${vector.name} — ${vector.claim}`,
    `  our read on him: ${vector.diagnosis}`,
    `  our suggested approach: ${vector.leverage}`,
    `CREW: ${labelFor(CREWS, brief.crew)}`,
    `FUNDING: ${labelFor(BUDGETS, brief.budget)}`,
    `COLLATERAL TOLERANCE: ${labelFor(COLLATERAL_LEVELS, brief.collateral)}`,
    brief.directive.trim()
      ? `STANDING DIRECTIVE FROM ROMAN: ${brief.directive.trim()}`
      : 'STANDING DIRECTIVE FROM ROMAN: none. Surprise me.',
    '',
    `vectorId in the JSON must be exactly "${vector.id}".`,
  ].join('\n');
}

/* ------------------------------------------------------------------ *
 * Schema. Gemini enforces this, we validate it again anyway.
 * ------------------------------------------------------------------ */

const PLAN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    codename: { type: 'STRING', description: 'Operation name, 2-4 words, no quotes.' },
    thesis: { type: 'STRING', description: 'One sentence: the insight the whole plan rests on.' },
    vectorId: { type: 'STRING', enum: VECTOR_IDS },
    vector: { type: 'STRING', description: 'Readable name of the exploited weakness.' },
    phases: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          objective: { type: 'STRING' },
          actions: { type: 'ARRAY', items: { type: 'STRING' } },
          asset: { type: 'STRING' },
          window: { type: 'STRING' },
        },
        required: ['name', 'objective', 'actions', 'asset', 'window'],
      },
    },
    assets: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          role: { type: 'STRING' },
          cost: { type: 'STRING' },
        },
        required: ['name', 'role', 'cost'],
      },
    },
    contingencies: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          trigger: { type: 'STRING' },
          response: { type: 'STRING' },
        },
        required: ['trigger', 'response'],
      },
    },
    successProbability: { type: 'INTEGER' },
    exposureRisk: { type: 'INTEGER' },
    collateral: { type: 'INTEGER' },
    failureMode: { type: 'STRING', description: 'How this ends badly, stated plainly.' },
    closingLine: { type: 'STRING', description: 'One final line in Roman’s voice.' },
  },
  required: [
    'codename',
    'thesis',
    'vectorId',
    'vector',
    'phases',
    'assets',
    'contingencies',
    'successProbability',
    'exposureRisk',
    'collateral',
    'failureMode',
    'closingLine',
  ],
  propertyOrdering: [
    'codename',
    'thesis',
    'vectorId',
    'vector',
    'phases',
    'assets',
    'contingencies',
    'successProbability',
    'exposureRisk',
    'collateral',
    'failureMode',
    'closingLine',
  ],
} as const;

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

function integer(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(99, Math.max(1, Math.round(parsed)));
}

function phrases(value: unknown, max: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => text(entry, maxLength))
    .filter((entry) => entry.length > 0)
    .slice(0, max);
}

function readVector(value: unknown, fallback: VectorId): VectorId {
  return typeof value === 'string' && (VECTOR_IDS as string[]).includes(value)
    ? (value as VectorId)
    : fallback;
}

function readPhases(value: unknown): PlanPhase[] {
  if (!Array.isArray(value)) return [];
  const phases: PlanPhase[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const name = text(entry.name, 42);
    const objective = text(entry.objective, 240);
    if (!name || !objective) continue;
    phases.push({
      name,
      objective,
      actions: phrases(entry.actions, 4, 260),
      asset: text(entry.asset, 120),
      window: text(entry.window, 60),
    });
    if (phases.length === 4) break;
  }
  return phases;
}

function readAssets(value: unknown): PlanAsset[] {
  if (!Array.isArray(value)) return [];
  const assets: PlanAsset[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const name = text(entry.name, 60);
    if (!name) continue;
    assets.push({ name, role: text(entry.role, 140), cost: text(entry.cost, 80) });
    if (assets.length === 4) break;
  }
  return assets;
}

function readContingencies(value: unknown): PlanContingency[] {
  if (!Array.isArray(value)) return [];
  const items: PlanContingency[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const trigger = text(entry.trigger, 160);
    const response = text(entry.response, 260);
    if (!trigger || !response) continue;
    items.push({ trigger, response });
    if (items.length === 3) break;
  }
  return items;
}

function validatePlan(
  input: unknown,
  brief: OperationBrief,
): Omit<BlackMaskPlan, 'origin' | 'model' | 'createdAt'> {
  if (!isRecord(input)) {
    throw new PlannerError('The uplink answered with something that was not a memo.');
  }

  const phases = readPhases(input.phases);
  const assets = readAssets(input.assets);
  const contingencies = readContingencies(input.contingencies);
  const thesis = text(input.thesis, 400);
  const codename = text(input.codename, 48);

  if (!codename || !thesis) {
    throw new PlannerError(
      'The draft came back with the headings missing.',
      'The uplink can do that on a bad day. Issue it again — it costs you nothing but time.',
    );
  }
  if (phases.length < 3) {
    throw new PlannerError(
      'The draft collapsed before the operation was sequenced.',
      'Try again, or add a standing directive to give the desk more to work with.',
    );
  }

  const vectorId = readVector(input.vectorId, brief.vector);

  return {
    codename,
    thesis,
    vectorId,
    vector: text(input.vector, 60) || getVector(vectorId).name,
    phases,
    assets,
    contingencies,
    successProbability: integer(input.successProbability, 30),
    exposureRisk: integer(input.exposureRisk, 60),
    collateral: integer(input.collateral, 30),
    failureMode: text(input.failureMode, 400) || 'Not stated. That is itself a finding.',
    closingLine: text(input.closingLine, 240) || 'File it and forget you read it.',
  };
}

/** Model sometimes wraps JSON in prose or fences. Take the widest object. */
function extractJson(raw: string): string {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  if (trimmed.startsWith('{')) return trimmed;
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

/* ------------------------------------------------------------------ *
 * Transport
 * ------------------------------------------------------------------ */

interface GeminiCandidate {
  content?: { parts?: Array<{ text?: string }> };
  finishReason?: string;
}

interface GeminiEnvelope {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string; code?: number };
}

function describeFailure(status: number, envelope: GeminiEnvelope | null): PlannerError {
  const detail = envelope?.error?.message?.trim();
  if (status === 400 || status === 403) {
    return new PlannerError(
      'The uplink rejected the key.',
      detail ?? 'Check the key is a Gemini API key and that the model name is one this key can reach.',
    );
  }
  if (status === 404) {
    return new PlannerError(
      'That model is not on this key.',
      detail ?? 'Try gemini-2.5-flash. It is the one the desk is trained on.',
    );
  }
  if (status === 429) {
    return new PlannerError(
      'The uplink is rationing us.',
      detail ?? 'Free-tier quota is spent. Wait a minute, or issue a shorter directive.',
    );
  }
  if (status >= 500) {
    return new PlannerError(
      'Google’s side of the wire is down.',
      detail ?? 'Nothing wrong with the key. Try again shortly.',
    );
  }
  return new PlannerError(
    'The transmission failed.',
    detail ?? `The uplink returned HTTP ${status}.`,
  );
}

export async function generateOperation(
  brief: OperationBrief,
  settings: UplinkSettings,
  signal?: AbortSignal,
): Promise<BlackMaskPlan> {
  const apiKey = settings.apiKey.trim() || FALLBACK_KEY;

  const model = settings.model.trim() || DEFAULT_SETTINGS.model;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);

  const generationConfig: Record<string, unknown> = {
    temperature: 1.05,
    topP: 0.95,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
    responseSchema: PLAN_SCHEMA,
  };
  if (model.includes('2.5') && model.includes('flash')) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  try {
    const response = await fetch(
      `${ENDPOINT}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: buildBrief(brief) }] }],
          generationConfig,
        }),
      },
    );

    let envelope: GeminiEnvelope | null = null;
    try {
      envelope = (await response.json()) as GeminiEnvelope;
    } catch {
      envelope = null;
    }

    if (!response.ok) throw describeFailure(response.status, envelope);

    if (envelope?.promptFeedback?.blockReason) {
      throw new PlannerError(
        'The desk refused to write it.',
        `Gemini blocked the prompt (${envelope.promptFeedback.blockReason}). Soften the directive and try again.`,
      );
    }

    const candidate = envelope?.candidates?.[0];
    const raw = candidate?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';

    if (!raw.trim()) {
      throw new PlannerError(
        'The memo came back blank.',
        candidate?.finishReason === 'MAX_TOKENS'
          ? 'The draft ran long. Shorten the standing directive.'
          : 'Try issuing it again.',
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(raw));
    } catch {
      throw new PlannerError(
        'The draft arrived in the wrong format.',
        'The desk is usually reliable. Issue it again.',
      );
    }

    return {
      ...validatePlan(parsed, brief),
      origin: 'gemini',
      model,
      createdAt: Date.now(),
    };
  } catch (error) {
    if (error instanceof PlannerError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (signal?.aborted) throw new PlannerError('Cancelled.');
      throw new PlannerError(
        'The uplink took too long.',
        'Ninety seconds and no answer. Issue it again, or try a shorter directive.',
      );
    }
    throw new PlannerError(
      'The request never left the room.',
      error instanceof Error ? error.message : 'Check the connection and try again.',
    );
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
