import { ArrowDownRight, ArrowRight, Landmark, Target, Users } from 'lucide-react';
import HeroMask from './HeroMask';
import { BlackMaskMark } from './Glyphs';

const ORIGIN_CHAPTERS = [
  {
    index: 'I',
    title: 'THE HEIR',
    body: 'Born into the Sionis fortune and raised by parents who treated cruelty as inheritance. Roman learned early that a smile is just another thing you can buy.',
  },
  {
    index: 'II',
    title: 'THE FIRE',
    body: 'Janus Cosmetics went up in a boardroom war with Wayne Enterprises. Roman went up with it. He came out of the fire without a face and without any further use for the truth.',
  },
  {
    index: 'III',
    title: 'THE MASK',
    body: 'Carved from his father’s ebony coffin. Cold. Seamless. Expressionless. The first face that ever told the truth about him.',
  },
];

const PRINCIPLES = ['CONTROL THE NIGHT', 'OWN THE FEAR', 'BREAK THE SYMBOL'];

export default function Hero() {
  return (
    <section id="origin" className="relative overflow-hidden pb-24 pt-28 sm:pt-32 lg:pb-32">
      <div className="hero-ray" aria-hidden="true" />
      <div className="hero-ambient" aria-hidden="true" />
      <div className="giant-watermark" aria-hidden="true">
        SIONIS
      </div>

      <div className="section-shell relative z-10">
        <div className="grid min-h-[calc(100svh-8rem)] items-center gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-6">
          <div className="relative z-10" data-reveal>
            <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-blood-glow">
                <span className="inline-block size-1.5 bg-blood" />
                GOTHAM CITY / CRIME FILE 001
              </span>
              <span className="h-px w-12 bg-white/15" />
              <span className="font-mono text-[9px] tracking-[0.24em] text-bone-faint">
                CLASSIFICATION: PUBLIC ENEMY
              </span>
            </div>

            <h1 className="hero-title font-display text-bone">
              <span className="block">BLACK</span>
              <span className="relative block pl-[0.06em]">
                <span className="outline-text">MASK</span>
                <span className="text-blood">.</span>
                <span className="absolute -right-2 top-3 hidden border border-blood/30 bg-blood/10 px-2 py-1 font-mono text-[8px] tracking-[0.28em] text-blood-glow sm:block">
                  NO FACE
                </span>
              </span>
            </h1>

            <div className="mt-8 flex items-start gap-4">
              <span className="mt-2 block h-14 w-px shrink-0 bg-gradient-to-b from-blood to-transparent" />
              <p className="max-w-[580px] font-serif text-[clamp(1.25rem,2vw,1.7rem)] leading-[1.35] text-bone-dim">
                Gotham’s crime lord. The Bat’s ugliest mirror. The only man in this city who
                understands that a mask is not a disguise —
                <em className="text-bone"> it’s a weapon.</em>
              </p>
            </div>

            <p className="mt-6 max-w-[560px] text-[15px] leading-7 text-bone-faint">
              Roman Sionis did not crawl out of the gutter. He was born above it. He lost the
              family company, the family name, and finally the face that carried them. What was
              left became Black Mask — a syndicate built on the one thing Bruce Wayne can’t buy.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#target" className="btn btn-primary group">
                <Target size={16} />
                ANALYZE THE BAT
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#war-room" className="btn btn-ghost group">
                <span>OPEN WAR ROOM</span>
                <ArrowDownRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </a>
            </div>

            <div className="mt-12 grid max-w-[610px] grid-cols-1 border-y border-white/10 sm:grid-cols-3">
              <div className="hero-fact">
                <Landmark size={15} />
                <span className="eyebrow">THE EMPIRE</span>
                <strong>JANUS COSMETICS</strong>
              </div>
              <div className="hero-fact sm:border-l sm:border-white/10 sm:pl-5">
                <Users size={15} />
                <span className="eyebrow">THE SYNDICATE</span>
                <strong>FALSE FACE SOCIETY</strong>
              </div>
              <div className="hero-fact sm:border-l sm:border-white/10 sm:pl-5">
                <Target size={15} />
                <span className="eyebrow">THE OBSESSION</span>
                <strong>BATMAN</strong>
              </div>
            </div>
          </div>

          <div className="relative lg:-mr-8 lg:pl-6" data-reveal data-delay="2">
            <HeroMask />
          </div>
        </div>

        <div className="mt-10 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-[1.35fr_0.65fr]" data-reveal>
          <article className="relative overflow-hidden bg-coal p-6 sm:p-9 lg:p-11">
            <div className="pointer-events-none absolute -right-8 -top-10 opacity-[0.035]">
              <BlackMaskMark className="size-64 text-bone" />
            </div>
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="eyebrow text-blood-glow">DOSSIER / ORIGIN</p>
                  <h2 className="mt-2 font-display text-3xl tracking-[0.03em] text-bone sm:text-4xl">
                    THE MAKING OF A MONSTER
                  </h2>
                </div>
                <span className="stamp">DECLASSIFIED</span>
              </div>

              <div className="mt-7 grid gap-7 sm:grid-cols-3">
                {ORIGIN_CHAPTERS.map((chapter) => (
                  <div key={chapter.index} className="group relative">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-blood">{chapter.index}</span>
                      <span className="h-px flex-1 bg-white/10 transition-colors group-hover:bg-blood/50" />
                    </div>
                    <h3 className="mt-4 font-display text-xl tracking-[0.08em] text-bone">
                      {chapter.title}
                    </h3>
                    <p className="mt-3 text-[13px] leading-6 text-bone-dim">{chapter.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden bg-blood p-6 text-[#fff3ef] sm:p-9 lg:p-11" data-reveal data-delay="1">
            <div className="motive-grain" aria-hidden="true" />
            <div className="relative flex h-full flex-col">
              <p className="font-mono text-[9px] tracking-[0.3em] text-white/60">THE MOTIVE</p>
              <h2 className="mt-4 font-display text-[clamp(2.2rem,3.8vw,3.8rem)] leading-[0.92] tracking-[0.01em]">
                GOTHAM IS
                <br />
                A PROTECTION
                <br />
                RACKET.
              </h2>
              <p className="mt-6 max-w-md font-serif text-lg leading-7 text-white/85">
                “The Falcones sold fear by the pound. The Waynes sold hope by the acre. Batman
                sells both. I intend to <em className="text-white">corner the market.</em>”
              </p>
              <p className="mt-4 font-mono text-[9px] tracking-[0.25em] text-white/55">
                — ROMAN SIONIS
              </p>

              <div className="mt-auto grid grid-cols-1 gap-px border-t border-white/25 pt-6 sm:grid-cols-3">
                {PRINCIPLES.map((principle, index) => (
                  <div key={principle} className="flex items-center gap-2 py-1 sm:block">
                    <span className="font-mono text-[8px] text-white/45">0{index + 1}</span>
                    <p className="font-display text-[12px] tracking-[0.14em] sm:mt-1">{principle}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className="ticker mt-16 border-y border-white/10" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="ticker-group">
              <span>ROMAN SIONIS</span>
              <span className="ticker-dot">◆</span>
              <span>BLACK MASK</span>
              <span className="ticker-dot">◆</span>
              <span>CRIME LORD OF GOTHAM</span>
              <span className="ticker-dot">◆</span>
              <span>PUBLIC ENEMY №1</span>
              <span className="ticker-dot">◆</span>
              <span>THE FALSE FACE SOCIETY</span>
              <span className="ticker-dot">◆</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
