import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Radio,
  RotateCcw,
  Sparkles,
  TerminalSquare,
  WandSparkles,
} from 'lucide-react';
import PlanVisualizer from './PlanVisualizer';
import { DEMO_OBJECTIVE, DEMO_PLAN } from '../data/demoPlan';
import { WEAKNESSES, WEAKNESS_BY_ID } from '../data/weaknesses';
import type { BlackMaskPlan, PlanIntensity, PlannerConfig, WeaknessId } from '../types/plan';
import {
  DEFAULT_PLANNER_CONFIG,
  generatePlan,
  loadPlannerConfig,
  PlannerError,
  savePlannerConfig,
} from '../services/geminiPlanner';

const PRESETS = [
  'Break the Bat’s grip on the Gotham docks.',
  'Frame Batman for a massacre he didn’t commit.',
  'Draw him into Arkham and seal the gates.',
  'Take the East End and make the GCPD watch.',
];

const INTENSITIES: Array<{ id: PlanIntensity; label: string; note: string }> = [
  { id: 'surgical', label: 'SURGICAL', note: 'Quiet. Deniable. Precise.' },
  { id: 'brutal', label: 'BRUTAL', note: 'Loud. Physical. Memorable.' },
  { id: 'total', label: 'TOTAL', note: 'Burn the myth at the root.' },
];

interface PlanGeneratorProps {
  focusWeakness: WeaknessId;
  onFocusWeakness: (id: WeaknessId) => void;
}

export default function PlanGenerator({ focusWeakness, onFocusWeakness }: PlanGeneratorProps) {
  const [config, setConfig] = useState<PlannerConfig>(() => loadPlannerConfig());
  const [showKey, setShowKey] = useState(false);
  const [showUplink, setShowUplink] = useState(() => !loadPlannerConfig().apiKey);
  const [objective, setObjective] = useState(DEMO_OBJECTIVE);
  const [intensity, setIntensity] = useState<PlanIntensity>('brutal');
  const [plan, setPlan] = useState<BlackMaskPlan>(DEMO_PLAN);
  const [source, setSource] = useState<'demo' | 'gemini'>('demo');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    savePlannerConfig(config);
  }, [config]);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  const runSample = () => {
    controllerRef.current?.abort();
    setBusy(false);
    setError(null);
    setPlan(DEMO_PLAN);
    setSource('demo');
  };

  const generate = async () => {
    if (busy) return;
    if (!objective.trim()) {
      setError('Give Black Mask a target. He does not work in vague gestures.');
      return;
    }
    if (!config.apiKey.trim()) {
      setShowUplink(true);
      setError('No Gemini key in the uplink. Add one below or run the sample protocol.');
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true);
    setError(null);

    try {
      const nextPlan = await generatePlan({
        objective: objective.trim(),
        weaknessId: focusWeakness,
        intensity,
        config,
        signal: controller.signal,
      });
      setPlan(nextPlan);
      setSource('gemini');
      if (window.innerWidth < 1024) {
        window.setTimeout(() => {
          outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return;
      setError(
        caught instanceof PlannerError
          ? caught.message
          : 'The uplink failed before the plan was finished. Try again.',
      );
    } finally {
      if (controllerRef.current === controller) {
        setBusy(false);
        controllerRef.current = null;
      }
    }
  };

  const focusedWeakness = WEAKNESS_BY_ID[focusWeakness];

  return (
    <section id="war-room" className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32">
      <div className="war-backdrop" aria-hidden="true" />
      <div className="war-watermark" aria-hidden="true">
        PLAN
      </div>

      <div className="section-shell relative z-10">
        <div className="grid items-end gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1fr_auto]">
          <div data-reveal>
            <div className="flex items-center gap-4">
              <span className="section-index">03</span>
              <span className="h-px w-16 bg-blood" />
              <span className="eyebrow text-bone-faint">THE WAR ROOM</span>
            </div>
            <h2 className="mt-6 max-w-5xl font-display text-[clamp(3.3rem,7vw,7.4rem)] leading-[0.87] tracking-[-0.01em] text-bone">
              PLAN THE FALL.
              <br />
              <span className="text-stroke-red">OWN THE MORNING.</span>
            </h2>
          </div>
          <div className="max-w-sm lg:pb-2" data-reveal data-delay="1">
            <p className="text-[15px] leading-7 text-bone-dim">
              Black Mask does not improvise. Tell him what Gotham should look like when the sun
              comes up. Gemini builds the night around it — phased, target-specific, and ugly.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping bg-blood opacity-50" />
                <span className="relative inline-flex size-2 bg-blood" />
              </span>
              <span className="font-mono text-[8px] tracking-[0.2em] text-bone-faint">
                SECURE CHANNEL / GEMINI 2.5
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid items-start gap-8 xl:grid-cols-[0.42fr_0.58fr] xl:gap-10">
          <div className="flex flex-col gap-5 xl:sticky xl:top-24" data-reveal>
            <div className="war-console relative overflow-hidden border border-white/10 bg-[#0a0a0d]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <TerminalSquare size={14} className="text-blood-glow" />
                  <span className="font-mono text-[9px] tracking-[0.22em] text-bone">
                    DIRECTIVE CONSOLE
                  </span>
                </div>
                <span className="font-mono text-[8px] tracking-[0.16em] text-bone-faint">
                  ROMAN SIONIS / ROOT
                </span>
              </div>

              <div className="space-y-7 p-5 sm:p-6">
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <label htmlFor="objective" className="eyebrow text-bone-faint">
                      01 / OBJECTIVE
                    </label>
                    <span className="font-mono text-[8px] text-bone-faint">
                      {objective.length}/220
                    </span>
                  </div>
                  <textarea
                    id="objective"
                    value={objective}
                    maxLength={220}
                    rows={3}
                    onChange={(event) => setObjective(event.target.value)}
                    placeholder="What should Gotham wake up to?"
                    className="field mt-3 min-h-[102px] resize-none text-[13px] leading-6"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setObjective(preset)}
                        className={`border px-2.5 py-1.5 text-left font-mono text-[8px] leading-4 tracking-[0.06em] transition ${
                          objective === preset
                            ? 'border-blood/60 bg-blood/15 text-bone'
                            : 'border-white/10 text-bone-faint hover:border-white/25 hover:text-bone-dim'
                        }`}
                      >
                        {preset.replace(/\.$/, '')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-end justify-between gap-4">
                    <label htmlFor="weakness" className="eyebrow text-bone-faint">
                      02 / FAULT LINE
                    </label>
                    <span className="font-mono text-[8px] text-blood-glow">
                      SEV {focusedWeakness.severity}/10
                    </span>
                  </div>
                  <div className="relative mt-3">
                    <select
                      id="weakness"
                      value={focusWeakness}
                      onChange={(event) => onFocusWeakness(event.target.value as WeaknessId)}
                      className="field appearance-none pr-10 text-[13px]"
                    >
                      {WEAKNESSES.map((weakness) => (
                        <option key={weakness.id} value={weakness.id}>
                          {weakness.index} — {weakness.label.toUpperCase()} / {weakness.bodyPart}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bone-faint"
                    />
                  </div>
                  <p className="mt-2.5 text-[11px] leading-5 text-bone-faint">
                    {focusedWeakness.summary}
                  </p>
                </div>

                <div>
                  <p className="eyebrow text-bone-faint">03 / RULES OF ENGAGEMENT</p>
                  <div className="mt-3 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
                    {INTENSITIES.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setIntensity(option.id)}
                        className={`bg-[#0c0c10] px-2 py-3 text-center transition ${
                          intensity === option.id ? 'bg-blood text-white' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="block font-display text-[10px] tracking-[0.13em]">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2.5 font-mono text-[8px] leading-4 tracking-[0.06em] text-bone-faint">
                    {INTENSITIES.find((option) => option.id === intensity)?.note}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowUplink((open) => !open)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <KeyRound size={13} className={config.apiKey ? 'text-[#78b79b]' : 'text-blood'} />
                      <span className="eyebrow text-bone-faint">GEMINI UPLINK</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[8px] tracking-[0.14em] text-bone-faint">
                        {config.apiKey ? 'KEY STORED' : 'KEY REQUIRED'}
                      </span>
                      {showUplink ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>

                  {showUplink && (
                    <div className="mt-4 space-y-3">
                      <div className="relative">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={config.apiKey}
                          onChange={(event) =>
                            setConfig((current) => ({ ...current, apiKey: event.target.value }))
                          }
                          placeholder="Paste Gemini API key"
                          autoComplete="off"
                          spellCheck={false}
                          className="field pr-11 font-mono text-[11px]"
                          aria-label="Gemini API key"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey((visible) => !visible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-bone-faint transition hover:text-bone"
                          aria-label={showKey ? 'Hide API key' : 'Show API key'}
                        >
                          {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <input
                          type="text"
                          value={config.model}
                          onChange={(event) =>
                            setConfig((current) => ({ ...current, model: event.target.value }))
                          }
                          placeholder="gemini-2.5-flash"
                          spellCheck={false}
                          className="field font-mono text-[10px]"
                          aria-label="Gemini model"
                        />
                        <button
                          type="button"
                          onClick={() => setConfig({ ...DEFAULT_PLANNER_CONFIG, apiKey: config.apiKey })}
                          className="btn btn-ghost btn-sm"
                          title="Reset model"
                        >
                          <RotateCcw size={13} />
                        </button>
                      </div>
                      <p className="text-[10px] leading-4 text-bone-faint">
                        Get a free key at{' '}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noreferrer"
                          className="text-bone-dim underline decoration-blood/60 underline-offset-2 hover:text-bone"
                        >
                          aistudio.google.com
                        </a>
                        . The key stays in this browser and is sent only to Google.
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 border border-blood/40 bg-blood/10 p-3" role="alert">
                    <Radio size={13} className="mt-0.5 shrink-0 text-blood-glow" />
                    <p className="text-[11px] leading-5 text-bone-dim">{error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={generate}
                    disabled={busy}
                    className="btn btn-primary w-full py-4"
                  >
                    {busy ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        DRAFTING THE OPERATION…
                      </>
                    ) : (
                      <>
                        <WandSparkles size={16} />
                        GENERATE OPERATION
                        <span className="ml-auto font-mono text-[8px] opacity-60">GEMINI</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={runSample}
                    disabled={busy}
                    className="btn btn-ghost w-full"
                  >
                    <Sparkles size={14} />
                    LOAD SAMPLE PROTOCOL
                  </button>
                </div>

                <p className="text-center font-mono text-[7px] leading-4 tracking-[0.16em] text-bone-faint">
                  FICTIONAL STRATEGY SIMULATION / NO REAL-WORLD INSTRUCTIONS
                </p>
              </div>
            </div>
          </div>

          <div ref={outputRef} className="relative min-w-0 scroll-mt-24" data-reveal data-delay="1">
            <PlanVisualizer key={`${plan.codename}-${plan.successProbability}`} plan={plan} source={source} />

            {busy && (
              <div className="absolute inset-0 z-30 flex items-center justify-center border border-blood/30 bg-[#070709]/92 p-8 backdrop-blur-sm">
                <div className="max-w-sm text-center">
                  <div className="relative mx-auto size-20">
                    <span className="absolute inset-0 animate-ping border border-blood/30" />
                    <span className="absolute inset-2 animate-spin border border-transparent border-t-blood [animation-duration:1.6s]" />
                    <span className="absolute inset-5 border border-blood/40 bg-blood/10" />
                    <Radio size={20} className="absolute inset-0 m-auto text-blood-glow" />
                  </div>
                  <p className="mt-6 font-display text-2xl tracking-[0.04em] text-bone">
                    BLACK MASK IS THINKING.
                  </p>
                  <p className="mt-3 font-mono text-[8px] leading-5 tracking-[0.16em] text-bone-faint">
                    CROSS-REFERENCING GOTHAM ASSETS
                    <br />
                    TESTING BATMAN’S RESPONSE
                    <br />
                    REMOVING THE OBVIOUS TRAPS
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
