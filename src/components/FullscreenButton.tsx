import { useCallback, useEffect, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

type OrientationLock = ScreenOrientation & {
  lock?: (orientation: 'landscape') => Promise<void>;
};

interface FullscreenButtonProps {
  /** Compact variant for the in-game HUD. */
  compact?: boolean;
  className?: string;
}

/**
 * One-tap mobile immersion: fullscreen plus a best-effort landscape lock.
 * The lock is unsupported on iOS, so failures are swallowed deliberately.
 */
export default function FullscreenButton({ compact = false, className = '' }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    sync();
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await document.documentElement.requestFullscreen();
      await (screen.orientation as OrientationLock | undefined)
        ?.lock?.('landscape')
        .catch(() => undefined);
    } catch {
      /* Fullscreen can be refused; the game stays perfectly playable. */
    }
  }, []);

  const Icon = isFullscreen ? Minimize : Maximize;

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-label={isFullscreen ? 'Leave fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Leave fullscreen' : 'Fullscreen & landscape lock'}
      className={`btn btn-sm ${compact ? 'btn-icon' : ''} ${className}`}
    >
      <Icon size={compact ? 14 : 15} />
      {!compact && <span>Fullscreen</span>}
    </button>
  );
}
