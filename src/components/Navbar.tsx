import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BlackMaskMark } from './Glyphs';

const LINKS = [
  { href: '#origin', index: '01', label: 'Origin' },
  { href: '#target', index: '02', label: 'The Target' },
  { href: '#war-room', index: '03', label: 'War Room' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'nav-shell-scrolled' : 'nav-shell'
      }`}
    >
      <div className="nav-hairline" />
      <div className="mx-auto flex h-[76px] max-w-[1520px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <a href="#origin" className="group flex items-center gap-3" aria-label="Black Mask home">
          <span className="relative flex size-11 items-center justify-center border border-white/10 bg-white/[0.025] transition-colors group-hover:border-blood/60">
            <BlackMaskMark className="size-7 text-bone transition-colors group-hover:text-blood-glow" />
            <span className="absolute -right-px -top-px size-1.5 bg-blood" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[21px] tracking-[0.12em] text-bone">BLACK MASK</span>
            <span className="mt-1 font-mono text-[8px] tracking-[0.32em] text-bone-faint">
              SIONIS CRIME SYNDICATE
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Sections">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group flex items-baseline gap-2 font-mono text-[10px] tracking-[0.24em] text-bone-dim transition hover:text-bone"
            >
              <span className="text-[8px] text-blood">{link.index}</span>
              <span>{link.label.toUpperCase()}</span>
              <span className="h-px w-0 bg-blood transition-all duration-300 group-hover:w-4" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 border-r border-white/10 pr-5 xl:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping bg-blood opacity-40" />
              <span className="relative inline-flex size-2 bg-blood" />
            </span>
            <span className="font-mono text-[9px] leading-tight tracking-[0.18em] text-bone-faint">
              GOTHAM / 02:14
              <br />
              <span className="text-bone-dim">SIGNAL ACTIVE</span>
            </span>
          </div>
          <a href="#war-room" className="btn btn-primary btn-sm group">
            <span>WAR ROOM</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
