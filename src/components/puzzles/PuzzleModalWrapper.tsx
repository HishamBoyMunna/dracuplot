import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Gem, Info, X } from 'lucide-react';
import type { PropId } from '../../types/game';
import { PROP_LORE } from '../../types/game';
import type { FeedbackTone, PuzzleFeedback } from './puzzleHelpers';

interface PuzzleModalWrapperProps {
  propId: PropId;
  /** Short description of the mechanic, shown under the lore title. */
  mechanic: string;
  accentColor: string;
  shakeSignal: number;
  feedback?: PuzzleFeedback | null;
  /** Shown as a progress chip in the header, e.g. "2 / 4 bound". */
  progress?: string;
  solved?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const TONE_STYLES: Record<FeedbackTone, { border: string; bg: string; text: string }> = {
  error: { border: 'border-blood-500/60', bg: 'bg-blood-500/12', text: 'text-[#f4c6cd]' },
  info: { border: 'border-ember-400/50', bg: 'bg-ember-400/10', text: 'text-[#f0dcb4]' },
  success: { border: 'border-rune-400/50', bg: 'bg-rune-400/10', text: 'text-[#bdf3e6]' },
};

export default function PuzzleModalWrapper({
  propId,
  mechanic,
  accentColor,
  shakeSignal,
  feedback,
  progress,
  solved = false,
  onClose,
  children,
  footer,
}: PuzzleModalWrapperProps) {
  const lore = PROP_LORE[propId];
  const [shaking, setShaking] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setShaking(true);
    const timer = window.setTimeout(() => setShaking(false), 560);
    return () => window.clearTimeout(timer);
  }, [shakeSignal]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const tone = feedback ? TONE_STYLES[feedback.tone] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 p-4 py-8 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lore.name}
        className={`relative w-full max-w-3xl rounded-2xl border-2 shadow-[0_0_90px_rgba(0,0,0,0.95)] ${
          shaking ? 'animate-shake' : ''
        }`}
        style={{
          borderColor: shaking ? '#e23c55' : solved ? 'rgba(60,226,192,0.55)' : 'rgba(55,55,79,0.9)',
          background:
            'linear-gradient(160deg, #15151f 0%, #0d0d16 45%, #121019 100%)',
        }}
      >
        {/* Carved stone edge highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: shaking
              ? 'inset 0 0 70px rgba(226,60,85,0.25)'
              : 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 60px rgba(0,0,0,0.6)',
          }}
        />

        <header
          className="relative flex items-start justify-between gap-4 border-b px-6 py-5"
          style={{ borderColor: 'rgba(55,55,79,0.75)' }}
        >
          <div className="min-w-0">
            <p
              className="text-[10px] tracking-[0.35em] uppercase"
              style={{ color: accentColor }}
            >
              {mechanic}
            </p>
            <h2 className="text-gothic mt-1.5 text-2xl text-[#ead9b9]">{lore.name}</h2>
            <p className="mt-1 text-sm text-[#8a83a0] italic">{lore.lore}</p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {progress && (
              <span className="hidden rounded-full border border-crypt-600 bg-crypt-950/70 px-3 py-1 text-xs text-[#9d96b0] sm:inline">
                {progress}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Step away from this relic"
              className="rounded-md p-1.5 text-[#7b7490] transition hover:bg-crypt-700 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {feedback && tone && (
          <div className={`relative mx-6 mt-5 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${tone.border} ${tone.bg} ${tone.text}`}>
            {feedback.tone === 'error' ? (
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            ) : feedback.tone === 'success' ? (
              <Gem size={16} className="mt-0.5 shrink-0" />
            ) : (
              <Info size={16} className="mt-0.5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="relative px-6 py-6">{children}</div>

        {footer && (
          <footer
            className="relative border-t px-6 py-4"
            style={{ borderColor: 'rgba(55,55,79,0.75)' }}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/** Shared success panel so every relic rewards the player the same way. */
export function RuneAwardPanel({
  takeaways,
  buttonLabel = 'Claim the Elder Rune',
  onClaim,
}: {
  takeaways: Array<{ heading: string; body: string }>;
  buttonLabel?: string;
  onClaim: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <Gem size={34} className="animate-rune-pop text-rune-400" />
        <p className="text-gothic text-xl text-rune-400">The relic yields.</p>
      </div>

      <div className="space-y-2.5">
        {takeaways.map((takeaway) => (
          <div
            key={takeaway.heading}
            className="rounded-lg border border-crypt-600/80 bg-crypt-950/60 px-4 py-3"
          >
            <p className="text-sm font-semibold text-[#d9d5e4]">{takeaway.heading}</p>
            <p className="mt-1 text-sm leading-relaxed text-[#9d96b0]">{takeaway.body}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClaim}
        className="w-full rounded-lg border border-rune-400/60 bg-rune-400/12 px-4 py-3 font-semibold text-rune-400 transition hover:bg-rune-400/22"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
