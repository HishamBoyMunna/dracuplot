import { RotateCw } from 'lucide-react';
import BlackMaskMark from './BlackMaskMark';

/** Full-screen noir notice asking the player to rotate the device. */
export default function OrientationGate() {
  return (
    <div className="fog-backdrop fixed inset-0 z-[9000] flex h-[100dvh] w-screen flex-col items-center justify-center gap-6 bg-ink px-7 text-center">
      <div className="relative">
        <div className="animate-flicker">
          <BlackMaskMark className="h-28 w-auto drop-shadow-[0_0_22px_rgba(211,32,53,0.45)]" />
        </div>
        <RotateCw
          size={22}
          className="animate-flicker absolute -top-3 -right-5 text-blood-glow"
        />
      </div>

      <div>
        <h1 className="font-display text-2xl text-bone sm:text-3xl">Turn the City Sideways</h1>
        <p className="mx-auto mt-3 max-w-xs text-bone-dim italic">
          This job needs landscape orientation. Rotate the device and the room opens.
        </p>
      </div>

      <div className="rule-orn w-56">
        <span className="font-display text-xs tracking-[0.3em] text-blood-lit">✦</span>
      </div>

      <p className="label-etched">Black Mask</p>
    </div>
  );
}
