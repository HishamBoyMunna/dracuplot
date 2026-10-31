import { Ghost, Lightbulb, Skull, Umbrella, Volume2, VolumeX } from 'lucide-react';
import type { VillainId, VillainProfile } from '../types/game';
import { DEFAULT_TORCH_RADIUS } from '../data/roomLayout';
import FullscreenButton from './FullscreenButton';
import { BatGlyph } from './BatMark';

const VILLAIN_ICONS: Record<VillainId, typeof Skull> = {
  dracula: Skull,
  werewolf: Umbrella,
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

function RuneTrack({ collected, total }: { collected: number; total: number }) {
  return (
    <div className="flex gap-[5px]">
      {Array.from({ length: total }, (_, index) => {
        const lit = index < collected;
        return (
          <span
            key={index}
            className={`h-[9px] w-[9px] rotate-45 border ${
              lit
                ? 'animate-rune-pop border-brass-lit bg-brass-lit'
                : 'border-iron-2 bg-transparent'
            }`}
            style={lit ? { boxShadow: '0 0 9px #e6c98a' } : undefined}
          />
        );
      })}
    </div>
  );
}

/** The hunter creeping along the rail toward Batman. */
function ThreatRail({
  villain,
  threat,
  short,
}: {
  villain: VillainProfile;
  threat: number;
  short: boolean;
}) {
  const VillainIcon = VILLAIN_ICONS[villain.id];
  const closing = threat >= 75;
  const stalking = threat >= 50;

  return (
    <div className={`relative ${short ? 'h-5' : 'h-7'} flex-1`}>
      {/* Steel rail */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 border border-iron-2 bg-ink"
        style={{ height: short ? 8 : 11, boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.9)' }}
      >
        <div
          className="h-full transition-[width] duration-150 ease-linear"
          style={{
            width: `${threat}%`,
            background: `repeating-linear-gradient(135deg, ${villain.accentColor} 0 5px, ${villain.accentColor}99 5px 10px)`,
            boxShadow: `0 0 12px ${villain.accentColor}`,
          }}
        />
      </div>

      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-150 ease-linear"
        style={{ left: `calc(${threat * 0.92}% + 11px)` }}
      >
        <VillainIcon
          size={short ? 15 : 19}
          className={stalking ? 'animate-flicker' : ''}
          style={{
            color: villain.accentColor,
            filter: `drop-shadow(0 0 ${closing ? 9 : 5}px ${villain.accentColor})`,
          }}
        />
      </div>

      <div className="absolute top-1/2 right-0 -translate-y-1/2">
        <BatGlyph
          size={short ? 18 : 22}
          className="text-bone"
          style={{ filter: 'drop-shadow(0 0 6px rgba(233,228,216,0.65))' }}
        />
      </div>
    </div>
  );
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

  const muteButton = (
    <button
      type="button"
      onClick={onToggleMute}
      aria-label={muted ? 'Unmute audio' : 'Mute audio'}
      title={muted ? 'Unmute' : 'Mute'}
      className="btn btn-sm btn-icon"
    >
      {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  );

  return (
    <>
      {/* ---------- Compact single-row bar: short landscape phones ---------- */}
      <div className="etch etch-brass etch-flat hidden h-10 shrink-0 items-center gap-3 px-2.5 compact:flex">
        <VillainIcon
          size={15}
          style={{ color: villain.accentColor }}
          className={closing ? 'animate-flicker shrink-0' : 'shrink-0'}
        />
        <ThreatRail villain={villain} threat={threat} short />
        <span
          className="num shrink-0 text-[11px]"
          style={{ color: villain.accentColor }}
        >
          {threat.toFixed(0)}%
        </span>
        <span className="h-5 w-px shrink-0 bg-iron-2" />
        <RuneTrack collected={runesCollected} total={totalRunes} />
        <span className="num shrink-0 text-[11px] text-brass">{torchPercent}%</span>
        <span className="num shrink-0 text-[11px] text-bone-faint">{formatClock(elapsed)}</span>
        <div className="flex shrink-0 gap-1.5">
          {muteButton}
          <FullscreenButton compact />
        </div>
      </div>

      {/* ---------- Full bar: tablets and desktop ---------- */}
      <div className="etch etch-brass bracket shrink-0 px-4 py-2.5 compact:hidden">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
          <div className="flex items-center gap-2.5">
            <VillainIcon
              size={19}
              style={{ color: villain.accentColor }}
              className={closing ? 'animate-flicker' : ''}
            />
            <div className="leading-none">
              <p className="font-display text-[15px] text-bone">{villain.name}</p>
              <p
                className="mt-1 text-[9px] tracking-[0.28em] uppercase"
                style={{ color: villain.accentColor }}
              >
                {villain.title}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="label-etched">Keys</span>
              <RuneTrack collected={runesCollected} total={totalRunes} />
              <span className="num text-[11px] text-brass-lit">
                {runesCollected}/{totalRunes}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-brass" />
              <div
                className="h-[7px] w-14 border border-iron-2 bg-ink"
                style={{ boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.9)' }}
              >
                <div
                  className="h-full bg-gradient-to-r from-brass-dim to-brass-lit transition-[width] duration-500"
                  style={{ width: `${torchPercent}%` }}
                />
              </div>
              <span className="num text-[11px] text-brass">{torchPercent}%</span>
            </div>

            <span className="num text-[11px] text-bone-faint">{formatClock(elapsed)}</span>

            <div className="flex gap-1.5">
              {muteButton}
              <FullscreenButton compact />
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <ThreatRail villain={villain} threat={threat} short={false} />
        </div>

        <div className="mt-0.5 flex items-center justify-between">
          <span className="label-etched">Syndicate Heat</span>
          <span
            className="num text-[11px] tracking-wider"
            style={{ color: villain.accentColor }}
          >
            {threat.toFixed(0)}%
            {closing ? ' · ON YOUR HEELS' : stalking ? ' · CLOSING IN' : ''}
          </span>
        </div>
      </div>

      {/* Scarecrow's Fear Toxin */}
      {villain.id === 'banshee' && threat > 60 && (
        <div
          className="animate-flicker pointer-events-none fixed inset-0 z-40"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(155,123,234,0.24) 70%, rgba(211,32,53,0.46) 100%)',
            mixBlendMode: 'screen',
          }}
        />
      )}
    </>
  );
}
