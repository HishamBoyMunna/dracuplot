import { BookOpen, RotateCw } from 'lucide-react';

/** Full-screen wrought-iron notice asking the player to rotate the device. */
export default function OrientationGate() {
  return (
    <div className="fog-backdrop fixed inset-0 z-[9000] flex h-[100dvh] w-screen flex-col items-center justify-center gap-6 bg-ink px-7 text-center">
      <div className="relative">
        <div className="animate-tome-turn">
          <div className="etch etch-brass bracket flex h-24 w-20 items-center justify-center">
            <BookOpen size={34} className="text-brass" />
          </div>
        </div>
        <RotateCw
          size={22}
          className="animate-flicker absolute -top-3 -right-5 text-blood-glow"
        />
      </div>

      <div>
        <h1 className="text-display text-2xl text-bone sm:text-3xl">Turn Your Grimoire Sideways</h1>
        <p className="mx-auto mt-3 max-w-xs text-bone-dim italic">
          This chamber requires Landscape Orientation. Rotate the device and the study will open.
        </p>
      </div>

      <div className="rule-orn w-56">
        <span className="font-display text-xs tracking-[0.3em] text-brass-dim">✦</span>
      </div>

      <p className="label-etched">Dracuplot</p>
    </div>
  );
}
