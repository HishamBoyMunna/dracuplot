import type { GameData, LLMConfig, LLMProvider } from '../types/game';
import { truncateStudyText } from './pdfParser';

const STORAGE_KEY = 'dracuplot.llm.config';

export const PROVIDER_PRESETS: Record<
  LLMProvider,
  { label: string; defaultModel: string; defaultBaseUrl?: string; keyHint: string }
> = {
  gemini: {
    label: 'Google Gemini (free tier)',
    defaultModel: 'gemini-2.5-flash',
    keyHint: 'Create a free key at aistudio.google.com/app/apikey',
  },
  openai_compatible: {
    label: 'OpenAI / Groq / OpenRouter / Ollama',
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    keyHint: 'Any OpenAI-compatible endpoint. Groq and OpenRouter both have free tiers.',
  },
  anthropic: {
    label: 'Anthropic (Claude)',
    defaultModel: 'claude-sonnet-4-5',
    keyHint: 'Browser calls require the direct-browser-access header, which is sent for you.',
  },
};

export const BASE_URL_SUGGESTIONS = [
  'https://api.openai.com/v1',
  'https://api.groq.com/openai/v1',
  'https://openrouter.ai/api/v1',
  'http://localhost:11434/v1',
];

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'gemini',
  apiKey: '',
  model: PROVIDER_PRESETS.gemini.defaultModel,
  baseUrl: PROVIDER_PRESETS.openai_compatible.defaultBaseUrl,
};

export class LLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMError';
  }
}

export function loadLLMConfig(): LLMConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_LLM_CONFIG };
    const parsed = JSON.parse(raw) as Partial<LLMConfig>;
    const provider: LLMProvider =
      parsed.provider && parsed.provider in PROVIDER_PRESETS ? parsed.provider : 'gemini';
    return {
      provider,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: parsed.model?.trim() || PROVIDER_PRESETS[provider].defaultModel,
      baseUrl: parsed.baseUrl?.trim() || PROVIDER_PRESETS.openai_compatible.defaultBaseUrl,
    };
  } catch {
    return { ...DEFAULT_LLM_CONFIG };
  }
}

export function saveLLMConfig(config: LLMConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* Private browsing or a full quota — settings simply won't persist. */
  }
}

const SYSTEM_PROMPT = `You are Black Mask, Gotham's crime lord, running a lethal escape room inside your syndicate headquarters to test deep comprehension of study material.
Analyze the provided study text and generate a complete 6-puzzle escape room dataset.

CRITICAL RULES:
1. Return ONLY raw, valid JSON matching the exact schema requested. Do not wrap in markdown code blocks if possible.
2. Every single puzzle MUST test real factual concepts, definitions, processes, or applications directly from the provided study text.
3. "bookshelf.pairs" must contain EXACTLY 4 distinct term/definition pairs.
4. "clock.orderedSteps" must contain EXACTLY 4 sequential steps, phases, or chronological events in their TRUE order.
5. "scale.statements" must contain EXACTLY 4 statements (mix of true and false misconceptions).
6. "safe.questions" must contain EXACTLY 4 multiple-choice questions, each with 4 options and a correctIndex (0-3).
7. "cauldron" must have a clue with "[BLANK]" and a single critical keyword as "answer".
8. "gargoyle" is the final boss door: create a challenging applied scenario question synthesizing the main theme of the text.`;

const JSON_SCHEMA_SPEC = `Required JSON shape:
{
  "documentTitle": string,
  "storyIntro": string,
  "puzzles": {
    "bookshelf": { "pairs": [{ "term": string, "definition": string }] },
    "clock": { "prompt": string, "orderedSteps": [string, string, string, string] },
    "scale": { "statements": [{ "text": string, "isTrue": boolean, "explanation": string }] },
    "safe": { "questions": [{ "q": string, "options": [string, string, string, string], "correctIndex": number }] },
    "cauldron": { "clue": string, "answer": string, "hint": string },
    "gargoyle": { "scenario": string, "options": [string, string, string, string], "correctIndex": number, "explanation": string }
  }
}`;

function buildUserPrompt(studyText: string, documentTitle: string): string {
  return `${JSON_SCHEMA_SPEC}

The player is studying a document titled "${documentTitle}". Write "storyIntro" as two or three atmospheric Gotham-noir sentences that tease the document's real subject matter.

=== STUDY TEXT BEGINS ===
${truncateStudyText(studyText)}
=== STUDY TEXT ENDS ===`;
}

/** Models love to wrap JSON in prose or fences. Dig the object back out. */
function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const candidates = [withoutFence];
  const start = withoutFence.indexOf('{');
  const end = withoutFence.lastIndexOf('}');
  if (start !== -1 && end > start) candidates.push(withoutFence.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }
  throw new LLMError('The model did not return valid JSON. Try again or switch models.');
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new LLMError(`Malformed response: "${field}" must be a non-empty string.`);
  }
  return value.trim();
}

function asArrayOfLength(value: unknown, length: number, field: string): unknown[] {
  if (!Array.isArray(value) || value.length < length) {
    throw new LLMError(`Malformed response: "${field}" must contain at least ${length} items.`);
  }
  return value.slice(0, length);
}

function asQuad(value: unknown, field: string): [string, string, string, string] {
  const items = asArrayOfLength(value, 4, field).map((item, index) =>
    asString(item, `${field}[${index}]`),
  );
  return [items[0], items[1], items[2], items[3]];
}

function asCorrectIndex(value: unknown, field: string): number {
  const index = typeof value === 'number' ? Math.trunc(value) : Number.NaN;
  if (!Number.isInteger(index) || index < 0 || index > 3) {
    throw new LLMError(`Malformed response: "${field}" must be an integer between 0 and 3.`);
  }
  return index;
}

/** Validate and normalise an arbitrary model payload into strict GameData. */
export function validateGameData(payload: unknown, fallbackTitle: string): GameData {
  if (!payload || typeof payload !== 'object') {
    throw new LLMError('Malformed response: expected a JSON object.');
  }
  const root = payload as Record<string, unknown>;
  const puzzles = root.puzzles;
  if (!puzzles || typeof puzzles !== 'object') {
    throw new LLMError('Malformed response: missing "puzzles" object.');
  }
  const p = puzzles as Record<string, unknown>;

  const bookshelf = (p.bookshelf ?? {}) as Record<string, unknown>;
  const pairs = asArrayOfLength(bookshelf.pairs, 4, 'puzzles.bookshelf.pairs').map(
    (entry, index) => {
      const pair = (entry ?? {}) as Record<string, unknown>;
      return {
        term: asString(pair.term, `puzzles.bookshelf.pairs[${index}].term`),
        definition: asString(pair.definition, `puzzles.bookshelf.pairs[${index}].definition`),
      };
    },
  );

  const clock = (p.clock ?? {}) as Record<string, unknown>;
  const orderedSteps = asArrayOfLength(clock.orderedSteps, 4, 'puzzles.clock.orderedSteps').map(
    (step, index) => asString(step, `puzzles.clock.orderedSteps[${index}]`),
  );

  const scale = (p.scale ?? {}) as Record<string, unknown>;
  const statements = asArrayOfLength(scale.statements, 4, 'puzzles.scale.statements').map(
    (entry, index) => {
      const statement = (entry ?? {}) as Record<string, unknown>;
      return {
        text: asString(statement.text, `puzzles.scale.statements[${index}].text`),
        isTrue: Boolean(statement.isTrue),
        explanation: asString(
          statement.explanation ?? 'No explanation was provided for this claim.',
          `puzzles.scale.statements[${index}].explanation`,
        ),
      };
    },
  );

  const safe = (p.safe ?? {}) as Record<string, unknown>;
  const questions = asArrayOfLength(safe.questions, 4, 'puzzles.safe.questions').map(
    (entry, index) => {
      const question = (entry ?? {}) as Record<string, unknown>;
      return {
        q: asString(question.q, `puzzles.safe.questions[${index}].q`),
        options: asQuad(question.options, `puzzles.safe.questions[${index}].options`),
        correctIndex: asCorrectIndex(
          question.correctIndex,
          `puzzles.safe.questions[${index}].correctIndex`,
        ),
      };
    },
  );

  const cauldron = (p.cauldron ?? {}) as Record<string, unknown>;
  let clue = asString(cauldron.clue, 'puzzles.cauldron.clue');
  const answer = asString(cauldron.answer, 'puzzles.cauldron.answer');
  if (!clue.includes('[BLANK]')) {
    const pattern = new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    clue = pattern.test(clue) ? clue.replace(pattern, '[BLANK]') : `${clue} (Answer: [BLANK])`;
  }

  const gargoyle = (p.gargoyle ?? {}) as Record<string, unknown>;

  return {
    documentTitle: typeof root.documentTitle === 'string' && root.documentTitle.trim()
      ? root.documentTitle.trim()
      : fallbackTitle,
    storyIntro: asString(
      root.storyIntro ?? 'The door slams shut behind you. Six locks. Six keys. One way out.',
      'storyIntro',
    ),
    puzzles: {
      bookshelf: { pairs },
      clock: {
        prompt: typeof clock.prompt === 'string' && clock.prompt.trim()
          ? clock.prompt.trim()
          : 'Restore these four steps to their true order.',
        orderedSteps,
      },
      scale: { statements },
      safe: { questions },
      cauldron: {
        clue,
        answer,
        hint: typeof cauldron.hint === 'string' && cauldron.hint.trim()
          ? cauldron.hint.trim()
          : 'Recall the single key term at the heart of this chapter.',
      },
      gargoyle: {
        scenario: asString(gargoyle.scenario, 'puzzles.gargoyle.scenario'),
        options: asQuad(gargoyle.options, 'puzzles.gargoyle.options'),
        correctIndex: asCorrectIndex(gargoyle.correctIndex, 'puzzles.gargoyle.correctIndex'),
        explanation: asString(
          gargoyle.explanation ?? 'The Gargoyle offers no further wisdom.',
          'puzzles.gargoyle.explanation',
        ),
      },
    },
  };
}

async function readError(response: Response): Promise<string> {
  const body = await response.text().catch(() => '');
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } | string };
    const message = typeof parsed.error === 'string' ? parsed.error : parsed.error?.message;
    if (message) return message;
  } catch {
    /* Fall through to the raw body. */
  }
  return body.slice(0, 300) || response.statusText;
}

async function callGemini(config: LLMConfig, prompt: string, signal?: AbortSignal) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    config.model,
  )}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
    }),
  });

  if (!response.ok) throw new LLMError(`Gemini request failed: ${await readError(response)}`);

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
  if (!text.trim()) throw new LLMError('Gemini returned an empty response.');
  return text;
}

async function callOpenAICompatible(config: LLMConfig, prompt: string, signal?: AbortSignal) {
  const baseUrl = (config.baseUrl?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: config.model,
      temperature: 0.8,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new LLMError(`Chat completion failed: ${await readError(response)}`);

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? '';
  if (!text.trim()) throw new LLMError('The provider returned an empty response.');
  return text;
}

async function callAnthropic(config: LLMConfig, prompt: string, signal?: AbortSignal) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    signal,
    body: JSON.stringify({
      model: config.model,
      max_tokens: 8000,
      temperature: 0.8,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `${prompt}\n\nRespond with raw JSON only.` },
      ],
    }),
  });

  if (!response.ok) throw new LLMError(`Anthropic request failed: ${await readError(response)}`);

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text =
    data.content
      ?.filter((block) => block.type === 'text')
      .map((block) => block.text ?? '')
      .join('') ?? '';
  if (!text.trim()) throw new LLMError('Claude returned an empty response.');
  return text;
}

export interface GenerateOptions {
  studyText: string;
  documentTitle: string;
  config: LLMConfig;
  signal?: AbortSignal;
}

/** Turn raw study text into a validated 6-puzzle escape room. */
export async function generateGameData({
  studyText,
  documentTitle,
  config,
  signal,
}: GenerateOptions): Promise<GameData> {
  if (!config.apiKey.trim()) {
    throw new LLMError('Add an API key in Syndicate Settings, or run the demo job instead.');
  }
  if (!config.model.trim()) {
    throw new LLMError('Choose a model in Syndicate Settings.');
  }

  const prompt = buildUserPrompt(studyText, documentTitle);

  let raw: string;
  try {
    if (config.provider === 'gemini') raw = await callGemini(config, prompt, signal);
    else if (config.provider === 'anthropic') raw = await callAnthropic(config, prompt, signal);
    else raw = await callOpenAICompatible(config, prompt, signal);
  } catch (error) {
    if (error instanceof LLMError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    const reason = error instanceof Error ? error.message : String(error);
    throw new LLMError(
      `Could not reach the provider (${reason}). Check your key, model name and network — browser CORS rules may also block this endpoint.`,
    );
  }

  return validateGameData(extractJsonObject(raw), documentTitle);
}
