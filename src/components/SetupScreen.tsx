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
    return `${used.toLocaleString()} characters${trimmed ? ' (trimmed from ' + doc.characterCount.toLocaleString() + ')' : ''}`;
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
    <div className="fog-backdrop relative min-h-screen overflow-x-hidden px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(226,60,85,0.08),transparent_55%)]" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="text-center">
          <p className="text-xs tracking-[0.5em] text-blood-400/70 uppercase">
            An anti-brainrot ritual
          </p>
          <h1 className="text-gothic mt-3 text-5xl font-black text-transparent sm:text-7xl bg-gradient-to-b from-[#ffe9ec] via-[#e23c55] to-[#6d0d1c] bg-clip-text drop-shadow-[0_0_35px_rgba(194,33,58,0.35)]">
            DRACUPLOT
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#b9b2c9] italic">
            Feed it the PDF you have been avoiding. It becomes a gothic escape room where the only
            way out is actually knowing the material.
          </p>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-crypt-500/70 bg-crypt-800/70 px-4 py-2 text-sm text-[#c9c3d6] transition hover:border-blood-400/70 hover:text-white"
          >
            <Settings2 size={15} />
            Conjuration Settings
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] tracking-wider uppercase ${
                hasKey ? 'bg-rune-400/15 text-rune-400' : 'bg-blood-500/20 text-blood-400'
              }`}
            >
              {hasKey ? preset.label.split(' ')[0] + ' ready' : 'no key'}
            </span>
          </button>
        </header>

        <section className="rounded-2xl border border-crypt-600/80 bg-crypt-900/70 p-6 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-gothic flex items-center gap-2 text-xl text-[#ead9b9]">
              <BookOpenText size={18} className="text-ember-400" />
              I. Offer Your Study Material
            </h2>
            <button
              type="button"
              onClick={() => setPasteMode((value) => !value)}
              className="inline-flex items-center gap-2 text-sm text-[#9b93ad] transition hover:text-ember-400"
            >
              <ClipboardType size={15} />
              {pasteMode ? 'Use a file instead' : 'Paste raw text instead'}
            </button>
          </div>

          {pasteMode ? (
            <div className="space-y-3">
              <textarea
                value={pastedText}
                onChange={(event) => setPastedText(event.target.value)}
                placeholder="Paste lecture notes, a chapter, or an article here (200+ characters)…"
                rows={8}
                className="w-full resize-y rounded-xl border border-crypt-600 bg-crypt-950/80 p-4 font-mono text-sm text-[#d9d5e4] outline-none transition focus:border-ember-400/70"
              />
              <button
                type="button"
                onClick={applyPastedText}
                disabled={pastedText.trim().length < 200}
                className="rounded-lg border border-ember-400/50 bg-ember-400/10 px-4 py-2 text-sm text-ember-400 transition hover:bg-ember-400/20 disabled:cursor-not-allowed disabled:opacity-40"
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
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
                isDragging
                  ? 'border-ember-400 bg-ember-400/10'
                  : 'border-crypt-500/80 bg-crypt-950/50 hover:border-blood-400/60 hover:bg-crypt-800/40'
              }`}
            >
              <Upload size={30} className={isDragging ? 'text-ember-400' : 'text-[#6f6880]'} />
              <p className="mt-3 text-[#d9d5e4]">
                Drag a <span className="text-ember-400">PDF</span> into the crypt, or click to
                choose
              </p>
              <p className="mt-1 text-sm text-[#7b7490]">
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
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-rune-400/30 bg-rune-400/5 p-4">
              <FileText size={18} className="mt-0.5 shrink-0 text-rune-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#e6e2ef]">{doc.title}</p>
                <p className="text-sm text-[#8d86a1]">
                  {doc.pageCount} page{doc.pageCount === 1 ? '' : 's'} · {charCountLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={clearDocument}
                aria-label="Discard this document"
                className="shrink-0 rounded-md p-1.5 text-[#7b7490] transition hover:bg-blood-500/15 hover:text-blood-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-blood-500/40 bg-blood-500/10 p-4 text-sm text-[#f2c3ca]">
              <AlertTriangle size={17} className="mt-0.5 shrink-0 text-blood-400" />
              <span>{error}</span>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-gothic mb-4 flex items-center gap-2 text-xl text-[#ead9b9]">
            <Skull size={18} className="text-blood-400" />
            II. Choose What Hunts You
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {VILLAIN_LIST.map((villain) => {
              const Icon = VILLAIN_ICONS[villain.id];
              const selected = villain.id === villainId;
              const maxMinutes = (100 / villain.passiveThreatPerSecond / 60).toFixed(1);
              return (
                <button
                  key={villain.id}
                  type="button"
                  onClick={() => setVillainId(villain.id)}
                  style={
                    selected
                      ? {
                          borderColor: villain.accentColor,
                          boxShadow: `0 0 35px -8px ${villain.accentColor}`,
                        }
                      : undefined
                  }
                  className={`group relative flex flex-col rounded-2xl border p-5 text-left transition ${
                    selected
                      ? 'bg-crypt-800/90'
                      : 'border-crypt-600/70 bg-crypt-900/60 hover:border-crypt-500 hover:bg-crypt-800/60'
                  }`}
                >
                  {selected && (
                    <span
                      className="absolute top-4 right-4 rounded-full p-1"
                      style={{ background: `${villain.accentColor}26`, color: villain.accentColor }}
                    >
                      <Check size={14} />
                    </span>
                  )}
                  <Icon
                    size={30}
                    className={selected ? 'animate-flicker' : 'opacity-70'}
                    style={{ color: villain.accentColor }}
                  />
                  <h3 className="text-gothic mt-3 text-lg text-[#f0ebf7]">{villain.name}</h3>
                  <p
                    className="text-xs tracking-[0.2em] uppercase"
                    style={{ color: villain.accentColor }}
                  >
                    {villain.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#9d96b0]">
                    {villain.description}
                  </p>
                  <dl className="mt-4 space-y-1 border-t border-crypt-600/60 pt-3 text-xs">
                    <div className="flex justify-between text-[#8a83a0]">
                      <dt>Passive tick</dt>
                      <dd className="text-[#d9d5e4]">
                        +{villain.passiveThreatPerSecond}%/s (~{maxMinutes} min)
                      </dd>
                    </div>
                    <div className="flex justify-between text-[#8a83a0]">
                      <dt>Mistake penalty</dt>
                      <dd className="text-[#d9d5e4]">+{villain.wrongAnswerPenalty}%</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs leading-relaxed text-[#7b7490] italic">
                    {villain.specialEffect}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col items-center gap-4 pb-6">
          <button
            type="button"
            onClick={() => void summon()}
            disabled={!canSummon}
            className="group relative w-full max-w-xl overflow-hidden rounded-xl border border-blood-400/60 bg-gradient-to-r from-[#6d0d1c] via-[#c2213a] to-[#6d0d1c] px-8 py-4 text-lg font-bold tracking-wide text-white shadow-[0_0_40px_-10px_rgba(226,60,85,0.8)] transition hover:brightness-115 disabled:cursor-not-allowed disabled:border-crypt-600 disabled:from-crypt-800 disabled:via-crypt-700 disabled:to-crypt-800 disabled:text-[#6f6880] disabled:shadow-none"
          >
            <span className="flex items-center justify-center gap-3">
              <Wand2 size={20} />
              Summon the Escape Room (Generate from PDF)
            </span>
          </button>

          {!canSummon && (
            <p className="text-center text-sm text-[#7b7490]">
              {studyText.length === 0
                ? 'Offer a document above to unlock the summoning.'
                : 'Add an API key in Conjuration Settings to summon from your own material.'}
            </p>
          )}

          <div className="flex w-full max-w-xl items-center gap-4 text-xs tracking-[0.3em] text-[#5d5770] uppercase">
            <span className="h-px flex-1 bg-crypt-600" />
            or
            <span className="h-px flex-1 bg-crypt-600" />
          </div>

          <button
            type="button"
            onClick={playDemo}
            className="inline-flex items-center gap-3 rounded-xl border border-rune-400/50 bg-rune-400/10 px-7 py-3.5 font-semibold text-rune-400 transition hover:bg-rune-400/20"
          >
            <Sparkles size={18} />
            Play Haunted Demo (No API Key Needed)
          </button>
          <p className="max-w-md text-center text-xs text-[#6f6880]">
            The demo runs a pre-built room on neural network architecture and AI cognitive atrophy.
          </p>
        </section>
      </div>

      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 py-10 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-crypt-500/80 bg-crypt-900 p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-gothic flex items-center gap-2 text-xl text-[#ead9b9]">
                  <KeyRound size={18} className="text-ember-400" />
                  Conjuration Settings
                </h3>
                <p className="mt-1 text-sm text-[#8a83a0]">
                  Keys are stored only in this browser's localStorage and sent straight to your
                  provider.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
                className="rounded-md p-1.5 text-[#7b7490] transition hover:bg-crypt-700 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs tracking-[0.2em] text-[#8a83a0] uppercase">
                  Provider
                </label>
                <div className="grid gap-2">
                  {PROVIDER_ORDER.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => updateProvider(provider)}
                      className={`rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                        config.provider === provider
                          ? 'border-ember-400/70 bg-ember-400/10 text-[#f3e3c6]'
                          : 'border-crypt-600 bg-crypt-950/60 text-[#9d96b0] hover:border-crypt-500'
                      }`}
                    >
                      {PROVIDER_PRESETS[provider].label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#6f6880]">{preset.keyHint}</p>
              </div>

              <div>
                <label
                  htmlFor="dracuplot-api-key"
                  className="mb-2 block text-xs tracking-[0.2em] text-[#8a83a0] uppercase"
                >
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
                    className="w-full rounded-lg border border-crypt-600 bg-crypt-950/80 px-4 py-2.5 pr-11 font-mono text-sm text-[#d9d5e4] outline-none transition focus:border-ember-400/70"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((value) => !value)}
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1.5 text-[#7b7490] transition hover:text-[#d9d5e4]"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="dracuplot-model"
                  className="mb-2 block text-xs tracking-[0.2em] text-[#8a83a0] uppercase"
                >
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
                  className="w-full rounded-lg border border-crypt-600 bg-crypt-950/80 px-4 py-2.5 font-mono text-sm text-[#d9d5e4] outline-none transition focus:border-ember-400/70"
                />
              </div>

              {config.provider === 'openai_compatible' && (
                <div>
                  <label
                    htmlFor="dracuplot-base-url"
                    className="mb-2 block text-xs tracking-[0.2em] text-[#8a83a0] uppercase"
                  >
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
                    className="w-full rounded-lg border border-crypt-600 bg-crypt-950/80 px-4 py-2.5 font-mono text-sm text-[#d9d5e4] outline-none transition focus:border-ember-400/70"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {BASE_URL_SUGGESTIONS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setConfig((previous) => ({ ...previous, baseUrl: url }))}
                        className="rounded-full border border-crypt-600 px-3 py-1 font-mono text-[11px] text-[#8a83a0] transition hover:border-ember-400/60 hover:text-ember-400"
                      >
                        {url.replace(/^https?:\/\//, '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="mt-6 w-full rounded-lg border border-ember-400/50 bg-ember-400/10 px-4 py-2.5 font-semibold text-ember-400 transition hover:bg-ember-400/20"
            >
              Seal the Pact
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
