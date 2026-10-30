import { Flame, Ghost, GraduationCap, Moon, Skull, Volume2, VolumeX } from 'lucide-react';
import type { VillainId, VillainProfile } from '../types/game';
import { DEFAULT_TORCH_RADIUS } from '../data/roomLayout';

const VILLAIN_ICONS: Record<VillainId, typeof Skull> = {
  dracula: Skull,
  werewolf: Moon,
  banshee: Ghost,
};

interface TopHudProps {
  villain: VillainProfile;
  threat: number;
  runesCollected: number;
  totalRunes: number;
  torchRadius: number;
  elapsed: number;
  muted: boolean;
  onToggleMute: () => void;
}

function formatClock(seconds: number): string {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

export default function TopHud({
  villain,
  threat,
  runesCollected,
  totalRunes,
  torchRadius,
  elapsed,
  muted,
  onToggleMute,
}: TopHudProps) {
  const VillainIcon = VILLAIN_ICONS[villain.id];
  const torchPercent = Math.round((torchRadius / DEFAULT_TORCH_RADIUS) * 100);
  const closing = threat >= 75;
  const stalking = threat >= 50;

  // The villain icon creeps from the left edge toward the scholar on the right.
  const chasePosition = Math.min(threat, 100);

  return (
    <>
      <div className="rounded-xl border border-crypt-600/80 bg-crypt-900/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
          <div className="flex items-center gap-2.5">
            <VillainIcon
              size={18}
              style={{ color: villain.accentColor }}
              className={closing ? 'animate-flicker' : ''}
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#e6e2ef]">{villain.name}</p>
              <p
                className="text-[10px] tracking-[0.22em] uppercase"
                style={{ color: villain.accentColor }}
              >
                {villain.title}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* Elder Runes */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] text-[#6f6880] uppercase">Runes</span>
              <div className="flex gap-1.5">
                {Array.from({ length: totalRunes }, (_, index) => {
                  const lit = index < runesCollected;
                  return (
                    <span
                      key={index}
                      className={`h-3 w-3 rotate-45 rounded-[2px] transition ${
                        lit ? 'animate-rune-pop bg-rune-400' : 'bg-crypt-600'
                      }`}
                      style={lit ? { boxShadow: '0 0 10px #3ce2c0' } : undefined}
                    />
                  );
                })}
              </div>
              <span className="text-xs text-rune-400 tabular-nums">
                {runesCollected}/{totalRunes}
              </span>
            </div>

            {/* Torchlight */}
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-ember-400" />
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-crypt-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8a4f16] to-ember-400 transition-[width] duration-500"
                  style={{ width: `${torchPercent}%` }}
                />
              </div>
              <span className="text-xs text-ember-400 tabular-nums">{torchPercent}%</span>
            </div>

            <span className="text-xs text-[#7b7490] tabular-nums">{formatClock(elapsed)}</span>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Unmute Dracuplot' : 'Mute Dracuplot'}
              title={muted ? 'Unmute' : 'Mute'}
              className="rounded-md border border-crypt-600 p-1.5 text-[#8a83a0] transition hover:border-ember-400/60 hover:text-ember-400"
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* Villain Threat Meter — the hunter closes on the scholar */}
        <div className="mt-3">
          <div className="relative h-7">
            <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full border border-crypt-600 bg-crypt-950">
              <div
                className="h-full rounded-full transition-[width] duration-150 ease-linear"
                style={{
                  width: `${chasePosition}%`,
                  background: `linear-gradient(90deg, ${villain.accentColor}33, ${villain.accentColor})`,
                  boxShadow: `0 0 16px ${villain.accentColor}`,
                }}
              />
            </div>

            {/* Hunter */}
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-150 ease-linear"
              style={{ left: `calc(${chasePosition * 0.92}% + 12px)` }}
            >
              <VillainIcon
                size={20}
                className={stalking ? 'animate-flicker' : ''}
                style={{
                  color: villain.accentColor,
                  filter: `drop-shadow(0 0 ${stalking ? 9 : 5}px ${villain.accentColor})`,
                }}
              />
            </div>

            {/* Prey */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2">
              <GraduationCap
                size={19}
                className="text-[#a79be0]"
                style={{ filter: 'drop-shadow(0 0 6px rgba(167,155,224,0.7))' }}
              />
            </div>
          </div>

          <div className="mt-0.5 flex items-center justify-between text-[10px] tracking-[0.2em] uppercase">
            <span className="text-[#6f6880]">Villain threat</span>
            <span style={{ color: villain.accentColor }} className="tabular-nums">
              {threat.toFixed(0)}%
              {closing ? ' · breathing down your neck' : stalking ? ' · closing in' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Banshee's Spectral Haunt */}
      {villain.id === 'banshee' && threat > 60 && (
        <div
          className="animate-flicker pointer-events-none fixed inset-0 z-40"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 32%, rgba(160,108,232,0.22) 72%, rgba(194,33,58,0.42) 100%)',
            mixBlendMode: 'screen',
          }}
        />
      )}
    </>
  );
}
