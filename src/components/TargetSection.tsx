import { useState } from 'react';
import { Crosshair, MousePointer2, ScanLine, ShieldAlert, TriangleAlert } from 'lucide-react';
import Batman3D from './Batman3D';
import { WEAKNESSES, WEAKNESS_BY_ID } from '../data/weaknesses';
import type { WeaknessId } from '../types/plan';

interface TargetSectionProps {
  selectedWeakness: WeaknessId;
  onSelectWeakness: (id: WeaknessId) => void;
}

export default function TargetSection({ selectedWeakness, onSelectWeakness }: TargetSectionProps) {
  const [hovered, setHovered] = useState<WeaknessId | null>(null);
  const displayed = WEAKNESS_BY_ID[hovered ?? selectedWeakness];

  return (
    <section id="target" className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32">
      <div className="target-backdrop" aria-hidden="true" />
      <div className="target-watermark" aria-hidden="true">
        02
      </div>

      <div className="section-shell relative z-10">
        <div className="grid items-end gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1fr_auto]">
          <div data-reveal>
            <div className="flex items-center gap-4">
              <span className="section-index">02</span>
              <span className="h-px w-16 bg-blood" />
              <span className="eyebrow text-bone-faint">TARGET ANALYSIS</span>
            </div>
            <h2 className="mt-6 max-w-4xl font-display text-[clamp(3.3rem,7vw,7.4rem)] leading-[0.87] tracking-[-0.01em] text-bone">
              KNOW THE BAT.
              <br />
              <span className="text-stroke-red">BREAK THE MAN.</span>
            </h2>
          </div>

          <div className="flex max-w-sm flex-col gap-5 lg:items-end lg:pb-2 lg:text-right" data-reveal data-delay="1">
            <p className="text-[15px] leading-7 text-bone-dim">
              He built a legend out of fear. Fear is a system. Systems have seams. Seven of them
              run down the Bat’s body — if you know where to cut.
            </p>
            <div className="flex items-center gap-2 border border-white/10 bg-white/[0.025] px-3 py-2">
              <MousePointer2 size={13} className="text-blood" />
              <span className="font-mono text-[8px] tracking-[0.2em] text-bone-faint">
                DRAG TO ROTATE / HOVER A FAULT
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border border-white/10 bg-black/20 px-4 py-3" data-reveal>
              <div className="flex items-center gap-2">
                <ScanLine size={14} className="text-blood-glow" />
                <span className="font-mono text-[8px] tracking-[0.24em] text-bone-faint">
                  WAYNE-TECH / STRUCTURAL SCAN
                </span>
              </div>
              <span className="font-mono text-[8px] tracking-[0.2em] text-bone-dim">7 FAULTS</span>
            </div>

            <article
              key={displayed.id}
              className="weakness-detail relative overflow-hidden border border-white/10 bg-coal p-6 sm:p-8"
              data-reveal
            >
              <div className="pointer-events-none absolute right-0 top-0 font-display text-[12rem] leading-none text-white/[0.025]">
                {displayed.index}
              </div>
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-blood-glow">FAULT {displayed.index} / ISOLATED</p>
                    <h3 className="mt-3 font-display text-4xl tracking-[0.03em] text-bone sm:text-5xl">
                      {displayed.label.toUpperCase()}
                    </h3>
                    <p className="mt-2 font-mono text-[9px] tracking-[0.18em] text-bone-faint">
                      {displayed.bodyPart.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-blood-glow">
                      <TriangleAlert size={14} />
                      <span className="font-mono text-[9px] tracking-[0.18em]">
                        SEVERITY {displayed.severity}/10
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, index) => (
                        <span
                          key={index}
                          className={`h-2.5 w-3 ${
                            index < displayed.severity ? 'bg-blood' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-7 border-l border-blood/50 pl-4 text-[14px] leading-7 text-bone-dim">
                  {displayed.summary}
                </p>

                <div className="mt-7 grid gap-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="eyebrow text-bone-faint">THE EXPLOIT</p>
                    <p className="mt-3 text-[13px] leading-6 text-bone">{displayed.exploit}</p>
                  </div>
                  <div className="border border-white/10 bg-black/20 p-4 sm:max-w-[190px]">
                    <div className="flex items-center gap-2 text-blood">
                      <Crosshair size={12} />
                      <span className="font-mono text-[8px] tracking-[0.2em]">OBSERVED TELL</span>
                    </div>
                    <p className="mt-3 font-serif text-[15px] leading-6 text-bone-dim">
                      “{displayed.tell}”
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2" data-reveal>
              {WEAKNESSES.map((weakness) => {
                const active = weakness.id === displayed.id;
                return (
                  <button
                    key={weakness.id}
                    type="button"
                    onClick={() => onSelectWeakness(weakness.id)}
                    onMouseEnter={() => setHovered(weakness.id)}
                    onMouseLeave={() => setHovered(null)}
                    aria-pressed={weakness.id === selectedWeakness}
                    className={`group flex items-center gap-3 bg-coal px-4 py-3.5 text-left transition-colors ${
                      active ? 'bg-blood/15' : 'hover:bg-white/[0.035]'
                    }`}
                  >
                    <span
                      className={`font-mono text-[9px] ${
                        active ? 'text-blood-glow' : 'text-bone-faint'
                      }`}
                    >
                      {weakness.index}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate font-display text-[13px] tracking-[0.12em] ${
                          active ? 'text-bone' : 'text-bone-dim group-hover:text-bone'
                        }`}
                      >
                        {weakness.shortLabel}
                      </span>
                      <span className="mt-1 flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, index) => (
                          <span
                            key={index}
                            className={`h-0.5 flex-1 ${
                              index < weakness.severity
                                ? active
                                  ? 'bg-blood'
                                  : 'bg-bone-faint/50'
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </span>
                    </span>
                    <span
                      className={`size-1.5 transition-colors ${
                        active ? 'bg-blood' : 'bg-white/10 group-hover:bg-blood/50'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-start gap-3 border-l border-blood/50 bg-blood/[0.04] p-4" data-reveal>
              <ShieldAlert size={17} className="mt-0.5 shrink-0 text-blood" />
              <p className="text-[12px] leading-5 text-bone-dim">
                Batman learns. Every plan that survives contact leaves a scar in his playbook. Change
                the vector, change the city, change the bait — never give the same war twice.
              </p>
            </div>
          </div>

          <div className="relative min-h-[510px] lg:sticky lg:top-24 lg:h-[calc(100svh-7rem)] lg:min-h-[640px]" data-reveal data-delay="1">
            <Batman3D
              selectedWeakness={selectedWeakness}
              onHoverWeakness={setHovered}
              onSelectWeakness={onSelectWeakness}
            />
            <div className="absolute -bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-3 border border-white/10 bg-coal px-4 py-2 lg:flex">
              <span className="font-mono text-[8px] tracking-[0.22em] text-bone-faint">
                SELECTED FAULT
              </span>
              <span className="size-1 bg-blood" />
              <span className="font-mono text-[8px] tracking-[0.22em] text-bone">
                {displayed.shortLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
