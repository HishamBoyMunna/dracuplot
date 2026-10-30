import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Gem, Info, X } from 'lucide-react';
import type { PropId } from '../../types/game';
import { PROP_LORE } from '../../types/game';
import type { FeedbackTone, PuzzleFeedback } from './puzzleHelpers';

interface PuzzleModalWrapperProps {
  propId: PropId;
  /** Short description of the mechanic, shown above the lore title. */
  mechanic: string;
  accentColor: string;
  shakeSignal: number;
  feedback?: PuzzleFeedback | null;
  /** Shown as a stamped chip in the header, e.g. "2 / 4 bound". */
  progress?: string;
  solved?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const TONE_STYLES: Record<FeedbackTone, string> = {
  error: 'etch-blood text-[#f0c8c4]',
  info: 'etch-brass text-[#ecd6a8]',
  success: 'etch-verd text-[#a9e8d2]',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-2 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lore.name}
        className={`etch etch-heavy flex max-h-[94dvh] w-[96vw] max-w-3xl flex-col ${
          shaking ? 'animate-shake' : ''
        }`}
        style={{
          borderColor: shaking ? '#a82323' : solved ? '#1d4b3f' : undefined,
          outlineColor: shaking
            ? 'rgba(168,35,35,0.6)'
            : solved
              ? 'rgba(79,191,158,0.45)'
              : undefined,
        }}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b-2 border-iron-2 px-3 py-2.5 compact:px-3 compact:py-1.5 sm:px-5 sm:py-3.5">
          <div className="min-w-0">
            <p
              className="text-[9px] tracking-[0.3em] uppercase sm:text-[10px]"
              style={{ color: accentColor }}
            >
              {mechanic}
            </p>
            <h2 className="font-display mt-1 truncate text-lg text-bone compact:mt-0 compact:text-base sm:text-2xl">
              {lore.name}
            </h2>
            <p className="mt-0.5 hidden text-sm text-bone-dim italic compact:hidden sm:block">
              {lore.lore}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {progress && (
              <span className="num hidden border border-brass-dim bg-ink px-2.5 py-1 text-[11px] text-brass sm:inline-block">
                {progress}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Step away from this relic"
              className="btn btn-sm btn-icon btn-iron"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {feedback && (
          <div className="shrink-0 px-3 pt-3 sm:px-5 sm:pt-4">
            <div
              className={`etch etch-flat flex items-start gap-2.5 px-3 py-2 text-[13px] leading-snug sm:text-sm ${TONE_STYLES[feedback.tone]}`}
            >
              {feedback.tone === 'error' ? (
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              ) : feedback.tone === 'success' ? (
                <Gem size={15} className="mt-0.5 shrink-0" />
              ) : (
                <Info size={15} className="mt-0.5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 compact:p-2 sm:p-5">
          {children}
        </div>

        {footer && (
          <footer className="shrink-0 border-t-2 border-iron-2 p-3 compact:p-2 sm:p-4">
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
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <Gem size={30} className="animate-rune-pop text-verdigris-lit" />
        <p className="font-display text-lg text-verdigris-lit sm:text-xl">The relic yields.</p>
      </div>

      <div className="space-y-2">
        {takeaways.map((takeaway) => (
          <div
            key={takeaway.heading}
            className="etch etch-flat border-l-[3px] border-l-verdigris px-3 py-2.5"
          >
            <p className="text-sm font-semibold text-bone">{takeaway.heading}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-bone-dim">{takeaway.body}</p>
          </div>
        ))}
      </div>

      <button type="button" onClick={onClaim} className="btn btn-verd w-full">
        <Gem size={16} />
        {buttonLabel}
      </button>
    </div>
  );
}
