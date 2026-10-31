import { useEffect, useRef, useState } from 'react';
import {
  BUDGETS,
  COLLATERAL_LEVELS,
  CREWS,
  MODES,
  VECTORS,
} from '../data/blackMask';
import { SAMPLE_PLAN } from '../data/demoPlan';
import {
  PlannerError,
  SUGGESTED_MODELS,
  forgetSettings,
  generateOperation,
  loadSettings,
  saveSettings,
} from '../services/gemini';
import type {
  BlackMaskPlan,
  Budget,
  Collateral,
  CrewSize,
  OperationMode,
  UplinkSettings,
  VectorId,
} from '../types/plan';
import { ArrowIcon, FileMark } from './Marks';
import PlanMemo from './PlanMemo';

const DIRECTIVE_LIMIT = 240;

function planAsText(plan: BlackMaskPlan): string {
  return [
    `OPERATION ${plan.codename.toUpperCase()}`,
    `Point of entry: ${plan.vector}`,
    '',
    plan.thesis,
    '',
    ...plan.phases.flatMap((phase, index) => [
      `${String(index + 1).padStart(2, '0')}. ${phase.name.toUpperCase()} — ${phase.objective}`,
      ...phase.actions.map((action) => `    · ${action}`),
      `    asset: ${phase.asset}`,
      `    window: ${phase.window}`,
      '',
    ]),
    'ASSETS',
    ...plan.assets.map((asset) => `  ${asset.name} — ${asset.role} (${asset.cost})`),
    '',
    'CONTINGENCIES',
    ...plan.contingencies.map((item) => `  IF ${item.trigger} → ${item.response}`),
    '',
    `PROBABILITY ${plan.successProbability}% · EXPOSURE ${plan.exposureRisk}% · COLLATERAL ${plan.collateral}%`,
    `MOST LIKELY FAILURE: ${plan.failureMode}`,
    '',
    plan.closingLine,
  ].join('\n');
}

export default function PlannerSection({
  vector,
  onVector,
}: {
  vector: VectorId;
  onVector: (id: VectorId) => void;
}) {
  const [mode, setMode] = useState<OperationMode>('financial');
  const [crew, setCrew] = useState<CrewSize>('crew');
  const [budget, setBudget] = useState<Budget>('funded');
  const [collateral, setCollateral] = useState<Collateral>('surgical');
  const [directive, setDirective] = useState('');
  const [settings, setSettings] = useState<UplinkSettings>(loadSettings);
  const [remember, setRemember] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const [plan, setPlan] = useState<BlackMaskPlan | null>(null);
  const [copied, setCopied] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const memoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (remember) saveSettings(settings);
    else forgetSettings();
  }, [settings, remember]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function revealMemo() {
    if (!window.matchMedia('(max-width: 1080px)').matches) return;
    window.requestAnimationFrame(() => {
      memoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  async function runPlan() {
    if (busy) return;
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);

    try {
      const result = await generateOperation(
        { mode, vector, crew, budget, collateral, directive },
        settings,
        controller.signal,
      );
      setPlan(result);
      revealMemo();
    } catch (problem) {
      const cancelled = problem instanceof PlannerError && problem.message === 'Cancelled.';
      if (!cancelled) {
        setError(
          problem instanceof PlannerError
            ? { message: problem.message, hint: problem.hint }
            : { message: 'Something in the room failed. Try again.' },
        );
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function runSample() {
    setError(null);
    setPlan({ ...SAMPLE_PLAN, createdAt: Date.now() });
    revealMemo();
  }

  async function copyPlan() {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(planAsText(plan));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard can be denied. The memo is still on screen. */
    }
  }

  const modeBlurb = MODES.find((entry) => entry.id === mode)?.blurb;

  return (
    <section className="section" id="protocol" aria-labelledby="protocol-title">
      <div className="shell">
        <div className="section-head reveal">
          <div className="gutter" aria-hidden="true">
            <span className="gutter__num">03</span>
            <span className="gutter__bar" />
          </div>
          <div>
            <p className="kicker">The protocol</p>
            <h2 className="display" id="protocol-title" style={{ marginTop: 14 }}>
              Dictate the operation. The desk does the arithmetic.
            </h2>
            <p className="deck" style={{ marginTop: 16 }}>
              Set the terms below and the Gemini uplink drafts the entire memo — sequence, assets,
              contingencies, and the number you will pretend not to care about. Your key stays in
              this browser; there is no server of ours for it to visit. A sample operation is on the
              premises if you would rather not use one.
            </p>
          </div>
        </div>

        <div className="planner__grid">
          <div className="reveal">
            <form
              className="sheet"
              onSubmit={(event) => {
                event.preventDefault();
                void runPlan();
              }}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  void runPlan();
                }
              }}
            >
              <div className="sheet__head">
                <span>Deployment order — form 12</span>
                <span>07-B</span>
              </div>

              <div className="sheet__body">
                <div className="field">
                  <p className="field__label">
                    <span>Mode of operation</span>
                    <b>required</b>
                  </p>
                  <div className="chips" role="group" aria-label="Mode of operation">
                    {MODES.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className="chip"
                        aria-pressed={mode === entry.id}
                        onClick={() => setMode(entry.id)}
                      >
                        {entry.label}
                      </button>
                    ))}
                  </div>
                  <p className="chip__blurb">{modeBlurb}</p>
                </div>

                <div className="field">
                  <p className="field__label">
                    <span>Point of entry</span>
                    <b>selected on the chart</b>
                  </p>
                  <div className="chips" role="group" aria-label="Point of entry">
                    {VECTORS.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className="chip chip--red"
                        aria-pressed={vector === entry.id}
                        onClick={() => onVector(entry.id)}
                      >
                        {entry.code} · {entry.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="selects">
                    <div className="field">
                      <p className="field__label">
                        <span>Crew</span>
                      </p>
                    <select
                      className="select"
                      value={crew}
                      onChange={(event) => setCrew(event.target.value as CrewSize)}
                      aria-label="Crew size"
                    >
                      {CREWS.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <p className="field__label">
                      <span>Funding</span>
                    </p>
                    <select
                      className="select"
                      value={budget}
                      onChange={(event) => setBudget(event.target.value as Budget)}
                      aria-label="Funding"
                    >
                      {BUDGETS.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <p className="field__label">
                      <span>Tolerance for collateral</span>
                    </p>
                    <select
                      className="select"
                      value={collateral}
                      onChange={(event) => setCollateral(event.target.value as Collateral)}
                      aria-label="Tolerance for collateral"
                    >
                      {COLLATERAL_LEVELS.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <p className="field__label">
                    <span>Standing directive</span>
                    <span className="field__hint">optional</span>
                  </p>
                  <textarea
                    className="textarea"
                    value={directive}
                    maxLength={DIRECTIVE_LIMIT}
                    onChange={(event) => setDirective(event.target.value)}
                    placeholder="One sentence. He will read it twice."
                    aria-label="Standing directive"
                  />
                  <p className="field__hint" style={{ textAlign: 'right', marginTop: 4 }}>
                    {directive.length}/{DIRECTIVE_LIMIT}
                  </p>
                </div>

                <details className="field uplinkbox">
                  <summary className="uplinkbox__summary">
                    <span className="field__label">
                      <span>Gemini uplink</span>
                      <span className="field__hint" style={{ textTransform: 'none' }}>
                        optional — try the sample first
                      </span>
                    </span>
                  </summary>
                  <div style={{ marginTop: 12 }}>
                    <div className="keyset">
                      <div>
                        <div className="keyrow">
                          <input
                            className="input"
                            type={showKey ? 'text' : 'password'}
                            value={settings.apiKey}
                            onChange={(event) =>
                              setSettings((current) => ({ ...current, apiKey: event.target.value }))
                            }
                            placeholder="AIza..."
                            autoComplete="off"
                            spellCheck={false}
                            aria-label="Gemini API key"
                          />
                          <button
                            type="button"
                            className="btn btn--line btn--sm"
                            onClick={() => setShowKey((value) => !value)}
                          >
                            {showKey ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <input
                          className="input"
                          value={settings.model}
                          list="gemini-models"
                          onChange={(event) =>
                            setSettings((current) => ({ ...current, model: event.target.value }))
                          }
                          placeholder="gemini-2.5-flash"
                          spellCheck={false}
                          aria-label="Gemini model"
                        />
                        <datalist id="gemini-models">
                          {SUGGESTED_MODELS.map((model) => (
                            <option key={model} value={model} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    <p className="keyset__note">
                      Sent directly to Google. Nothing is stored but the key, in this browser, and only
                      if you leave the box below switched on.
                    </p>
                    <button
                      type="button"
                      className="chip"
                      style={{ marginTop: 8 }}
                      aria-pressed={remember}
                      onClick={() => setRemember((value) => !value)}
                    >
                      {remember ? 'Key held on this device' : 'Key kept in memory only'}
                    </button>
                  </div>
                </details>

                <div className="sheet__actions">
                  <button type="submit" className="btn btn--ink" disabled={busy}>
                    {busy ? (
                      <>
                        <span className="spin" aria-hidden="true" />
                        Drafting the operation…
                      </>
                    ) : (
                      <>
                        <FileMark className="btn__arrow" />
                        Sign &amp; issue
                      </>
                    )}
                  </button>
                  <div className="sheet__actions-row">
                    <button
                      type="button"
                      className="btn btn--line btn--sm"
                      onClick={runSample}
                      disabled={busy}
                    >
                      Sample operation
                    </button>
                    {busy ? (
                      <button
                        type="button"
                        className="btn btn--line btn--sm"
                        onClick={() => abortRef.current?.abort()}
                      >
                        Abort
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--line btn--sm"
                        onClick={() => {
                          setSettings((current) => ({ ...current, apiKey: '' }));
                          forgetSettings();
                        }}
                        disabled={!settings.apiKey}
                      >
                        Forget key
                      </button>
                    )}
                  </div>
                </div>

                {error ? (
                  <div className="alert" role="alert">
                    <p className="alert__title">
                      <span className="pip" style={{ background: 'var(--red)' }} aria-hidden="true" />
                      Transmission failed
                    </p>
                    <p className="alert__msg">
                      {error.message}
                      {error.hint ? ` ${error.hint}` : ''}
                    </p>
                  </div>
                ) : null}
              </div>
            </form>
          </div>

          <div ref={memoRef} className="reveal">
            <PlanMemo
              plan={plan}
              busy={busy}
              copied={copied}
              onPrint={() => window.print()}
              onCopy={() => void copyPlan()}
              onSample={runSample}
            />
            <p
              className="no-print"
              style={{
                marginTop: 12,
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ArrowIcon className="btn__arrow" />
              Press <kbd style={{ fontFamily: 'inherit' }}>⌘/Ctrl</kbd> +{' '}
              <kbd style={{ fontFamily: 'inherit' }}>↵</kbd> anywhere in the form to issue it
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
