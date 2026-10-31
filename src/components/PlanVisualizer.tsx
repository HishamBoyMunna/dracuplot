import { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  Crosshair,
  FileWarning,
  Radio,
  ShieldCheck,
  Skull,
} from 'lucide-react';
import type { BlackMaskPlan, RiskLevel } from '../types/plan';
import { WEAKNESS_BY_ID } from '../data/weaknesses';
import { BatGlyph } from './Glyphs';

interface PlanVisualizerProps {
  plan: BlackMaskPlan;
  source: 'demo' | 'gemini';
}

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'LOW',
  medium: 'MED',
  high: 'HIGH',
};

const RISK_COLOR: Record<RiskLevel, string> = {
  low: 'text-[#78b79b]',
  medium: 'text-[#c7a15a]',
  high: 'text-blood-glow',
};

const PHASE_POSITIONS = [
  { left: '18%', top: '18%' },
  { left: '82%', top: '18%' },
  { left: '18%', top: '82%' },
  { left: '82%', top: '82%' },
];

function Dial({
  value,
  label,
  accent = 'red',
}: {
  value: number;
  label: string;
  accent?: 'red' | 'gold';
}) {
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-[62px]">
        <svg viewBox="0 0 64 64" className="size-full -rotate-90">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={accent === 'red' ? '#e01b36' : '#c7a15a'}
            strokeWidth="3"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="butt"
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-lg text-bone">
          {value}
          <span className="font-mono text-[8px]">%</span>
        </span>
      </div>
      <div>
        <p className="font-mono text-[8px] tracking-[0.2em] text-bone-faint">{label}</p>
        <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-bone-dim">
          {accent === 'red' ? 'CALCULATED' : 'EXPOSURE'}
        </p>
      </div>
    </div>
  );
}

function PhaseNode({
  index,
  title,
  timing,
  risk,
  active,
  onClick,
}: {
  index: number;
  title: string;
  timing: string;
  risk: RiskLevel;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={PHASE_POSITIONS[index]}
      className={`phase-node absolute z-20 w-[104px] -translate-x-1/2 -translate-y-1/2 border p-2.5 text-left transition-all duration-300 sm:w-[150px] sm:p-3 ${
        active
          ? 'border-blood bg-[#1a0b0f] shadow-[0_0_38px_rgba(224,27,54,0.24)]'
          : 'border-white/15 bg-[#0b0b0e]/95 hover:border-blood/50'
      }`}
      aria-pressed={active}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`font-mono text-[8px] ${active ? 'text-blood-glow' : 'text-bone-faint'}`}>
          0{index + 1}
        </span>
        <span className={`size-1.5 ${active ? 'bg-blood' : 'bg-white/20'}`} />
      </div>
      <p className="mt-2 line-clamp-2 font-display text-[10px] leading-[1.25] tracking-[0.1em] text-bone sm:text-[11px]">
        {title}
      </p>
      <div className="mt-2 flex items-center justify-between gap-1 border-t border-white/10 pt-2">
        <span className="font-mono text-[7px] tracking-[0.1em] text-bone-faint">{timing}</span>
        <span className={`font-mono text-[7px] ${RISK_COLOR[risk]}`}>{RISK_LABEL[risk]}</span>
      </div>
    </button>
  );
}

export default function PlanVisualizer({ plan, source }: PlanVisualizerProps) {
  const [activePhase, setActivePhase] = useState(0);
  const weakness = WEAKNESS_BY_ID[plan.targetWeaknessId];
  const phase = plan.phases[activePhase];

  return (
    <div className="war-output relative overflow-hidden border border-white/10 bg-coal">
      <div className="pointer-events-none absolute inset-0 war-output-grid" aria-hidden="true" />
      <div className="relative">
        <header className="border-b border-white/10 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 border border-blood/40 bg-blood/10 px-2 py-1 font-mono text-[8px] tracking-[0.2em] text-blood-glow">
                  <Radio size={10} />
                  {source === 'gemini' ? 'GEMINI UPLINK' : 'SAMPLE DOSSIER'}
                </span>
                <span className="font-mono text-[8px] tracking-[0.2em] text-bone-faint">
                  OPERATION / {plan.codename}
                </span>
              </div>
              <h3 className="mt-4 max-w-2xl font-display text-[clamp(2rem,3.5vw,3.6rem)] leading-[0.95] tracking-[0.01em] text-bone">
                {plan.codename}
              </h3>
            </div>
            <div className="flex gap-5 border border-white/10 bg-black/20 px-4 py-3">
              <Dial value={plan.successProbability} label="SUCCESS" />
              <div className="w-px bg-white/10" />
              <Dial value={plan.exposure} label="EXPOSURE" accent="gold" />
            </div>
          </div>

          <p className="mt-5 max-w-3xl font-serif text-[17px] leading-7 text-bone-dim sm:text-lg">
            {plan.thesis}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-4">
            <span className="flex items-center gap-2 font-mono text-[8px] tracking-[0.16em] text-bone-faint">
              <Clock3 size={11} className="text-blood" />
              WINDOW: <strong className="font-normal text-bone-dim">{plan.window.toUpperCase()}</strong>
            </span>
            <span className="flex items-center gap-2 font-mono text-[8px] tracking-[0.16em] text-bone-faint">
              <Crosshair size={11} className="text-blood" />
              FAULT LINE: <strong className="font-normal text-bone-dim">{weakness.label.toUpperCase()}</strong>
            </span>
            <span className="flex items-center gap-2 font-mono text-[8px] tracking-[0.16em] text-bone-faint">
              <Skull size={11} className="text-blood" />
              TARGET: <strong className="font-normal text-bone-dim">BATMAN / BRUCE WAYNE</strong>
            </span>
          </div>
        </header>

        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-blood-glow">TACTICAL VISUALISER</p>
              <p className="mt-1 font-display text-xl tracking-[0.06em] text-bone">
                FOUR-PHASE APPROACH
              </p>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <span className="font-mono text-[8px] tracking-[0.18em] text-bone-faint">CLICK A NODE</span>
              <span className="h-px w-8 bg-white/15" />
            </div>
          </div>

          <div className="operation-map relative mt-4 h-[380px] overflow-hidden border border-white/10 bg-[#08080b] sm:h-[430px]">
            <div className="operation-grid absolute inset-0" aria-hidden="true" />
            <div className="operation-sweep absolute inset-0" aria-hidden="true" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="radar-ring radar-ring-1" />
              <div className="radar-ring radar-ring-2" />
              <div className="radar-ring radar-ring-3" />
            </div>

            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="link-hot" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e01b36" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ff4a5c" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {plan.phases.map((_, index) => {
                const x = index % 2 === 0 ? 18 : 82;
                const y = index < 2 ? 18 : 82;
                const active = index === activePhase;
                return (
                  <path
                    key={index}
                    d={`M ${x} ${y} C ${x === 18 ? 32 : 68} ${y}, ${x === 18 ? 38 : 62} 50, 50 50`}
                    fill="none"
                    stroke={active ? 'url(#link-hot)' : 'rgba(255,255,255,0.13)'}
                    strokeWidth={active ? 1.5 : 0.8}
                    strokeDasharray={active ? '3 2' : '1 2'}
                    vectorEffect="non-scaling-stroke"
                    className={active ? 'link-flow' : ''}
                  />
                );
              })}
              <line x1="50" y1="7" x2="50" y2="93" stroke="rgba(255,255,255,0.06)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
              <line x1="7" y1="50" x2="93" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
            </svg>

            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="target-node relative flex size-[104px] items-center justify-center border border-blood/50 bg-[#10070a] shadow-[0_0_60px_rgba(224,27,54,0.22)] sm:size-[126px]">
                <div className="absolute inset-2 border border-blood/15" />
                <BatGlyph className="size-11 text-blood-glow sm:size-14" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[7px] tracking-[0.2em] text-bone-faint">
                  TARGET / BATMAN
                </span>
              </div>
            </div>

            {plan.phases.map((phaseItem, index) => (
              <PhaseNode
                key={phaseItem.title + index}
                index={index}
                title={phaseItem.title}
                timing={phaseItem.timing}
                risk={phaseItem.risk}
                active={index === activePhase}
                onClick={() => setActivePhase(index)}
              />
            ))}

            <div className="absolute left-3 top-3 z-10 font-mono text-[7px] tracking-[0.2em] text-bone-faint">
              GOTHAM / GRID 7-B
            </div>
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 font-mono text-[7px] tracking-[0.2em] text-bone-faint">
              <span className="size-1 animate-pulse bg-blood" />
              LIVE SIMULATION
            </div>
          </div>

          {phase && (
            <div className="mt-5 grid gap-5 border border-white/10 bg-black/20 p-5 lg:grid-cols-[0.52fr_1fr]">
              <div className="border-b border-white/10 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center border border-blood/40 bg-blood/10 font-display text-sm text-blood-glow">
                    0{activePhase + 1}
                  </span>
                  <div>
                    <p className="font-mono text-[8px] tracking-[0.18em] text-bone-faint">{phase.timing}</p>
                    <p className={`mt-1 font-mono text-[8px] tracking-[0.18em] ${RISK_COLOR[phase.risk]}`}>
                      RISK / {RISK_LABEL[phase.risk]}
                    </p>
                  </div>
                </div>
                <h4 className="mt-4 font-display text-2xl tracking-[0.04em] text-bone">
                  {phase.title}
                </h4>
                <p className="mt-3 text-[12px] leading-6 text-bone-dim">{phase.objective}</p>
                <div className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3">
                  <ShieldCheck size={13} className="mt-0.5 shrink-0 text-blood" />
                  <p className="font-mono text-[8px] leading-4 tracking-[0.12em] text-bone-faint">
                    ASSET / <span className="text-bone-dim">{phase.asset.toUpperCase()}</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="eyebrow text-bone-faint">EXECUTION</p>
                <ol className="mt-3 space-y-3">
                  {phase.actions.map((action, index) => (
                    <li key={action} className="flex items-start gap-3 text-[12px] leading-5 text-bone-dim">
                      <span className="mt-0.5 font-mono text-[8px] text-blood">0{index + 1}</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            <div className="bg-coal p-5">
              <div className="flex items-center gap-2">
                <Crosshair size={13} className="text-blood" />
                <p className="eyebrow text-bone-faint">REQUISITIONED ASSETS</p>
              </div>
              <ul className="mt-4 space-y-2.5">
                {plan.assets.map((asset) => (
                  <li key={asset} className="flex items-start gap-2 text-[11px] leading-5 text-bone-dim">
                    <span className="mt-2 size-1 shrink-0 bg-blood" />
                    {asset}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-coal p-5">
              <div className="flex items-center gap-2">
                <FileWarning size={13} className="text-[#c7a15a]" />
                <p className="eyebrow text-bone-faint">FAILURE PROTOCOLS</p>
              </div>
              <ul className="mt-4 space-y-2.5">
                {plan.contingencies.map((contingency) => (
                  <li key={contingency} className="flex items-start gap-2 text-[11px] leading-5 text-bone-dim">
                    <AlertTriangle size={11} className="mt-1 shrink-0 text-[#c7a15a]" />
                    {contingency}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <span className="font-mono text-[8px] tracking-[0.18em] text-bone-faint">
              OPENING MOVE / <span className="text-bone-dim">{plan.openingMove}</span>
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 font-mono text-[8px] tracking-[0.18em] text-bone-faint transition hover:text-blood-glow"
            >
              EXPORT FILE
              <ArrowUpRight size={12} />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
