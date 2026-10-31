import { ArrowUp, Radio } from 'lucide-react';
import { BlackMaskMark, BatGlyph } from './Glyphs';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050506]">
      <div className="footer-glow" aria-hidden="true" />
      <div className="section-shell relative z-10 py-14">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-end">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center border border-white/10 bg-white/[0.03]">
              <BlackMaskMark className="size-8 text-bone" />
            </span>
            <div>
              <p className="font-display text-2xl tracking-[0.12em] text-bone">BLACK MASK</p>
              <p className="mt-1 font-mono text-[8px] tracking-[0.28em] text-bone-faint">
                SIONIS CRIME SYNDICATE / GOTHAM CITY
              </p>
            </div>
          </div>

          <p className="max-w-xl font-serif text-[clamp(1.3rem,2.4vw,2rem)] leading-[1.25] text-bone-dim">
            “The night belongs to whoever owns the fear.”
          </p>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 font-mono text-[8px] tracking-[0.18em] text-bone-faint">
              <Radio size={11} className="text-blood" />
              CHANNEL OPEN
            </span>
            <a href="#origin" className="btn btn-ghost btn-sm" aria-label="Back to top">
              <ArrowUp size={13} />
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 pt-6 text-[10px] leading-5 text-bone-faint sm:flex-row sm:items-center">
          <p className="max-w-2xl">
            A fictional Batman fan project. Roman Sionis, Batman and Gotham City are property of DC
            Comics. Strategy output is generated fiction, not real-world guidance.
          </p>
          <div className="flex items-center gap-4 font-mono text-[8px] tracking-[0.18em]">
            <span>GOTHAM / 02:14</span>
            <span className="size-1 bg-blood" />
            <a href="#war-room" className="transition hover:text-bone">
              WAR ROOM
            </a>
            <BatGlyph className="size-5 text-bone-faint" />
          </div>
        </div>
      </div>
    </footer>
  );
}
