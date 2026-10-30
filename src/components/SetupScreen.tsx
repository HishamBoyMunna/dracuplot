import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpenText,
  Check,
  ClipboardType,
  Eye,
  EyeOff,
  FileText,
  Ghost,
  KeyRound,
  Moon,
  Settings2,
  Skull,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import type { GameData, LLMConfig, LLMProvider, VillainId } from '../types/game';
import { VILLAIN_LIST } from '../types/game';
import { FALLBACK_GAME_DATA } from '../data/fallbackData';
import {
  ACCEPTED_FILE_TYPES,
  MAX_STUDY_TEXT_LENGTH,
  type ParsedDocument,
  parsePastedText,
  parseStudyFile,
} from '../services/pdfParser';
import {
  BASE_URL_SUGGESTIONS,
  PROVIDER_PRESETS,
  generateGameData,
  loadLLMConfig,
  saveLLMConfig,
} from '../services/llmService';
import FullscreenButton from './FullscreenButton';

const VILLAIN_ICONS: Record<VillainId, typeof Skull> = {
  dracula: Skull,
  werewolf: Moon,
  banshee: Ghost,
};

const PROVIDER_ORDER: LLMProvider[] = ['gemini', 'openai_compatible', 'anthropic'];

interface SetupScreenProps {
  onGenerationStart: (message: string) => void;
  onGenerationProgress: (message: string) => void;
  onGenerationEnd: () => void;
  onLaunch: (gameData: GameData, villainId: VillainId, isDemo: boolean) => void;
}

export default function SetupScreen({
  onGenerationStart,
  onGenerationProgress,
  onGenerationEnd,
  onLaunch,
}: SetupScreenProps) {
  const [villainId, setVillainId] = useState<VillainId>('dracula');
  const [doc, setDoc] = useState<ParsedDocument | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [config, setConfig] = useState<LLMConfig>(() => loadLLMConfig());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    saveLLMConfig(config);
  }, [config]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [settingsOpen]);

  const preset = PROVIDER_PRESETS[config.provider];
  const hasKey = config.apiKey.trim().length > 0;
  const studyText = doc?.text ?? '';
  const canSummon = studyText.length > 0 && hasKey && !isWorking;

  const charCountLabel = useMemo(() => {
    if (!doc) return null;
    const used = Math.min(doc.characterCount, MAX_STUDY_TEXT_LENGTH);
    const trimmed = doc.characterCount > MAX_STUDY_TEXT_LENGTH;
    return `${used.toLocaleString()} characters${
      trimmed ? ` (trimmed from ${doc.characterCount.toLocaleString()})` : ''
    }`;
  }, [doc]);

  const ingestFile = useCallback(async (file: File) => {
    setError(null);
    setIsWorking(true);
    try {
      const parsed = await parseStudyFile(file);
      setDoc(parsed);
      setPasteMode(false);
    } catch (cause) {
      setDoc(null);
      setError(cause instanceof Error ? cause.message : 'That file could not be read.');
    } finally {
      setIsWorking(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) void ingestFile(file);
    },
    [ingestFile],
  );

  const applyPastedText = useCallback(() => {
    setError(null);
    try {
      setDoc(parsePastedText(pastedText));
    } catch (cause) {
      setDoc(null);
      setError(cause instanceof Error ? cause.message : 'That text could not be used.');
    }
  }, [pastedText]);

  const clearDocument = useCallback(() => {
    setDoc(null);
    setPastedText('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const summon = useCallback(async () => {
    if (!doc) return;
    setError(null);
    setIsWorking(true);
    onGenerationStart('Transcribing your manuscript for the Game Master\u2026');
    try {
      onGenerationProgress(`Summoning six trials from "${doc.title}"\u2026`);
      const data = await generateGameData({
        studyText: doc.text,
        documentTitle: doc.title,
        config,
      });
      onGenerationProgress('Carving the Elder Runes\u2026');
      onLaunch(data, villainId, false);
    } catch (cause) {
      onGenerationEnd();
      setError(cause instanceof Error ? cause.message : 'The summoning failed.');
    } finally {
      setIsWorking(false);
    }
  }, [config, doc, onGenerationEnd, onGenerationProgress, onGenerationStart, onLaunch, villainId]);

  const playDemo = useCallback(() => {
    setError(null);
    onLaunch(FALLBACK_GAME_DATA, villainId, true);
  }, [onLaunch, villainId]);

  const updateProvider = useCallback((provider: LLMProvider) => {
    setConfig((previous) => ({
      ...previous,
      provider,
      model: PROVIDER_PRESETS[provider].defaultModel,
      baseUrl: previous.baseUrl || PROVIDER_PRESETS.openai_compatible.defaultBaseUrl,
    }));
  }, []);

  return (
    <div className="fog-backdrop relative min-h-[100dvh] overflow-x-hidden px-4 py-6 sm:px-7 sm:py-10">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-7">
        {/* ---------------- Masthead ---------------- */}
        <header className="text-center">
          <div className="rule-orn mx-auto max-w-sm">
            <span className="label-etched whitespace-nowrap">An Anti-Brainrot Ritual</span>
          </div>

          <h1
            className="font-display mt-4 text-[clamp(2.6rem,10vw,5.5rem)] leading-[0.92] text-bone"
            style={{
              textShadow:
                '0 2px 0 #3a0d0d, 5px 5px 0 #040306, 0 0 44px rgba(168,35,35,0.42)',
              letterSpacing: '0.04em',
            }}
          >
            DRACUPLOT
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-bone-dim italic">
            Feed it the PDF you have been avoiding. It becomes a gothic escape room where the only
            way out is actually knowing the material.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="btn btn-sm btn-iron"
            >
              <Settings2 size={14} />
              Conjuration Settings
              <span
                className={`ml-1 border px-1.5 py-0.5 text-[9px] tracking-widest uppercase ${
                  hasKey
                    ? 'border-verdigris text-verdigris-lit'
                    : 'border-blood text-blood-glow'
                }`}
              >
                {hasKey ? 'key set' : 'no key'}
              </span>
            </button>
            <FullscreenButton />
          </div>
        </header>

        {/* ---------------- I. Study material ---------------- */}
        <section className="etch etch-brass bracket p-4 sm:p-5">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display flex items-center gap-2 text-xl text-bone">
              <BookOpenText size={17} className="text-brass" />
              I. Offer Your Study Material
            </h2>
            <button
              type="button"
              onClick={() => setPasteMode((value) => !value)}
              className="flex items-center gap-2 text-sm text-bone-faint transition hover:text-brass"
            >
              <ClipboardType size={14} />
              {pasteMode ? 'Use a file instead' : 'Paste raw text instead'}
            </button>
          </div>

          {pasteMode ? (
            <div className="space-y-3">
              <textarea
                value={pastedText}
                onChange={(event) => setPastedText(event.target.value)}
                placeholder="Paste lecture notes, a chapter, or an article here (200+ characters)…"
                rows={7}
                className="field resize-y text-sm"
              />
              <button
                type="button"
                onClick={applyPastedText}
                disabled={pastedText.trim().length < 200}
                className="btn btn-sm"
              >
                Seal this text into the grimoire
              </button>
            </div>
          ) : (
            <div
              onDragEnter={(event) => {
                event.preventDefault();
                dragDepth.current += 1;
                setIsDragging(true);
              }}
              onDragLeave={() => {
                dragDepth.current = Math.max(0, dragDepth.current - 1);
                if (dragDepth.current === 0) setIsDragging(false);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`bracket flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-5 py-9 text-center transition ${
                isDragging
                  ? 'border-brass bg-brass/8'
                  : 'border-iron-2 bg-ink/60 hover:border-brass-dim'
              }`}
            >
              <Upload size={26} className={isDragging ? 'text-brass-lit' : 'text-bone-faint'} />
              <p className="mt-2.5 text-bone">
                Drag a <span className="text-brass">PDF</span> into the crypt, or tap to choose
              </p>
              <p className="mt-1 text-sm text-bone-faint">
                .pdf, .txt and .md are accepted — parsed entirely in your browser
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void ingestFile(file);
                }}
              />
            </div>
          )}

          {doc && (
            <div className="etch etch-verd etch-flat mt-3.5 flex items-start gap-3 p-3">
              <FileText size={17} className="mt-0.5 shrink-0 text-verdigris-lit" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-bone">{doc.title}</p>
                <p className="num text-xs text-bone-faint">
                  {doc.pageCount} page{doc.pageCount === 1 ? '' : 's'} · {charCountLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={clearDocument}
                aria-label="Discard this document"
                className="btn btn-sm btn-icon btn-iron"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {error && (
            <div className="etch etch-blood etch-flat mt-3.5 flex items-start gap-2.5 p-3 text-sm text-[#f0c8c4]">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-blood-glow" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* ---------------- II. Villain ---------------- */}
        <section>
          <h2 className="font-display mb-3.5 flex items-center gap-2 text-xl text-bone">
            <Skull size={17} className="text-blood-glow" />
            II. Choose What Hunts You
          </h2>

          <div className="grid gap-3.5 sm:grid-cols-3">
            {VILLAIN_LIST.map((villain) => {
              const Icon = VILLAIN_ICONS[villain.id];
              const selected = villain.id === villainId;
              const maxMinutes = (100 / villain.passiveThreatPerSecond / 60).toFixed(1);
              return (
                <button
                  key={villain.id}
                  type="button"
                  onClick={() => setVillainId(villain.id)}
                  style={{
                    borderColor: selected ? villain.accentColor : undefined,
                    outlineColor: selected ? `${villain.accentColor}80` : undefined,
                  }}
                  className={`etch bracket chamfer woodcut relative flex flex-col p-4 text-left transition ${
                    selected ? '' : 'hover:border-iron-2'
                  }`}
                >
                  {selected && (
                    <span
                      className="absolute top-3 right-3 border p-1"
                      style={{ borderColor: villain.accentColor, color: villain.accentColor }}
                    >
                      <Check size={11} />
                    </span>
                  )}

                  <Icon
                    size={27}
                    className={selected ? 'animate-flicker' : 'opacity-70'}
                    style={{ color: villain.accentColor }}
                  />

                  <h3 className="font-display mt-2.5 text-lg text-bone">{villain.name}</h3>
                  <p
                    className="text-[10px] tracking-[0.22em] uppercase"
                    style={{ color: villain.accentColor }}
                  >
                    {villain.title}
                  </p>

                  <p className="mt-2.5 text-sm leading-snug text-bone-dim">{villain.description}</p>

                  <dl className="mt-3 space-y-1 border-t border-iron pt-2.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-bone-faint">Passive tick</dt>
                      <dd className="num text-bone">
                        +{villain.passiveThreatPerSecond}%/s · ~{maxMinutes}m
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-bone-faint">Mistake</dt>
                      <dd className="num text-bone">+{villain.wrongAnswerPenalty}%</dd>
                    </div>
                  </dl>

                  <p className="mt-2.5 text-xs leading-snug text-bone-faint italic">
                    {villain.specialEffect}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------------- Actions ---------------- */}
        <section className="flex flex-col items-center gap-3.5 pb-4">
          <button
            type="button"
            onClick={() => void summon()}
            disabled={!canSummon}
            className="btn btn-blood w-full max-w-xl py-4 text-base"
          >
            <Wand2 size={18} />
            Summon the Escape Room (Generate from PDF)
          </button>

          {!canSummon && (
            <p className="text-center text-sm text-bone-faint">
              {studyText.length === 0
                ? 'Offer a document above to unlock the summoning.'
                : 'Add an API key in Conjuration Settings to summon from your own material.'}
            </p>
          )}

          <div className="rule-orn w-full max-w-xl">
            <span className="label-etched">or</span>
          </div>

          <button type="button" onClick={playDemo} className="btn btn-verd">
            <Sparkles size={17} />
            Play Haunted Demo (No API Key Needed)
          </button>

          <p className="max-w-md text-center text-xs text-bone-faint">
            The demo runs a pre-built room on neural network architecture and AI cognitive atrophy.
          </p>
        </section>
      </div>

      {/* ---------------- Settings ---------------- */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-3"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="etch etch-brass etch-heavy bracket flex max-h-[92dvh] w-full max-w-lg flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b-2 border-iron-2 px-4 py-3">
              <div>
                <h3 className="font-display flex items-center gap-2 text-xl text-bone">
                  <KeyRound size={17} className="text-brass" />
                  Conjuration Settings
                </h3>
                <p className="mt-0.5 text-sm text-bone-faint">
                  Keys live only in this browser and are sent straight to your provider.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
                className="btn btn-sm btn-icon btn-iron"
              >
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              <div>
                <span className="label-etched mb-2 block">Provider</span>
                <div className="grid gap-1.5">
                  {PROVIDER_ORDER.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => updateProvider(provider)}
                      className={`btn btn-sm justify-start ${
                        config.provider === provider ? '' : 'btn-iron'
                      }`}
                    >
                      {PROVIDER_PRESETS[provider].label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-bone-faint">{preset.keyHint}</p>
              </div>

              <div>
                <label htmlFor="dracuplot-api-key" className="label-etched mb-2 block">
                  API Key
                </label>
                <div className="relative">
                  <input
                    id="dracuplot-api-key"
                    type={showKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(event) =>
                      setConfig((previous) => ({ ...previous, apiKey: event.target.value }))
                    }
                    placeholder="sk-… / AIza…"
                    autoComplete="off"
                    spellCheck={false}
                    className="field num pr-11 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((value) => !value)}
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-bone-faint transition hover:text-bone"
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="dracuplot-model" className="label-etched mb-2 block">
                  Model
                </label>
                <input
                  id="dracuplot-model"
                  type="text"
                  value={config.model}
                  onChange={(event) =>
                    setConfig((previous) => ({ ...previous, model: event.target.value }))
                  }
                  spellCheck={false}
                  className="field num text-sm"
                />
              </div>

              {config.provider === 'openai_compatible' && (
                <div>
                  <label htmlFor="dracuplot-base-url" className="label-etched mb-2 block">
                    Base URL
                  </label>
                  <input
                    id="dracuplot-base-url"
                    type="text"
                    value={config.baseUrl ?? ''}
                    onChange={(event) =>
                      setConfig((previous) => ({ ...previous, baseUrl: event.target.value }))
                    }
                    spellCheck={false}
                    className="field num text-sm"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {BASE_URL_SUGGESTIONS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setConfig((previous) => ({ ...previous, baseUrl: url }))}
                        className="num border border-iron-2 px-2 py-1 text-[10px] text-bone-faint transition hover:border-brass-dim hover:text-brass"
                      >
                        {url.replace(/^https?:\/\//, '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t-2 border-iron-2 p-3">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="btn w-full"
              >
                Seal the Pact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
