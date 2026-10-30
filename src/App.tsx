import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, Flame, Gem, Loader2, X } from 'lucide-react';
import SetupScreen from './components/SetupScreen';
import EscapeRoomCanvas from './components/EscapeRoomCanvas';
import type { GameData, GamePhase, PropId, VillainId } from './types/game';
import { PROP_LORE, VILLAINS } from './types/game';
import {
  DEFAULT_TORCH_RADIUS,
  MIN_TORCH_RADIUS,
  RUNE_PROP_IDS,
  TORCH_PENALTY_STEP,
  TOTAL_RUNES,
} from './data/roomLayout';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [loadingMessage, setLoadingMessage] = useState('Opening the crypt…');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [villainId, setVillainId] = useState<VillainId>('dracula');
  const [isDemo, setIsDemo] = useState(false);

  const [solvedProps, setSolvedProps] = useState<ReadonlySet<PropId>>(() => new Set<PropId>());
  const [torchRadius, setTorchRadius] = useState(DEFAULT_TORCH_RADIUS);
  const [activeProp, setActiveProp] = useState<PropId | null>(null);

  const villain = VILLAINS[villainId];
  const runesCollected = useMemo(
    () => RUNE_PROP_IDS.filter((id) => solvedProps.has(id)).length + (solvedProps.has('gargoyle') ? 1 : 0),
    [solvedProps],
  );

  const handleLaunch = useCallback((data: GameData, chosenVillain: VillainId, demo: boolean) => {
    setGameData(data);
    setVillainId(chosenVillain);
    setIsDemo(demo);
    setSolvedProps(new Set<PropId>());
    setTorchRadius(DEFAULT_TORCH_RADIUS);
    setActiveProp(null);
    setPhase('PLAYING');
  }, []);

  const handleExit = useCallback(() => {
    setGameData(null);
    setActiveProp(null);
    setPhase('SETUP');
  }, []);

  // Phase 3 replaces this with the real puzzle modals.
  const claimRune = useCallback((propId: PropId) => {
    setSolvedProps((previous) => new Set(previous).add(propId));
    setActiveProp(null);
  }, []);

  const simulateMistake = useCallback(() => {
    if (villainId !== 'dracula') return;
    setTorchRadius((radius) => Math.max(MIN_TORCH_RADIUS, radius - TORCH_PENALTY_STEP));
  }, [villainId]);

  if (phase === 'PLAYING' && gameData) {
    const lore = activeProp ? PROP_LORE[activeProp] : null;

    return (
      <div className="fog-backdrop min-h-screen px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExit}
              className="inline-flex items-center gap-2 text-sm text-[#8a83a0] transition hover:text-ember-400"
            >
              <ArrowLeft size={15} />
              Abandon the study
            </button>

            <div className="flex items-center gap-4 text-sm">
              <span
                className="rounded-full px-3 py-1 text-xs tracking-[0.2em] uppercase"
                style={{ background: `${villain.accentColor}22`, color: villain.accentColor }}
              >
                {villain.name}
              </span>
              <span className="inline-flex items-center gap-1.5 text-rune-400">
                <Gem size={15} />
                {runesCollected}/{TOTAL_RUNES} runes
              </span>
              <span className="inline-flex items-center gap-1.5 text-ember-400">
                <Flame size={15} />
                {Math.round((torchRadius / DEFAULT_TORCH_RADIUS) * 100)}% torch
              </span>
            </div>
          </header>

          <EscapeRoomCanvas
            solvedProps={solvedProps}
            torchRadius={torchRadius}
            interactionLocked={activeProp !== null}
            accentColor={villain.accentColor}
            debugOverlay
            onInteractProp={setActiveProp}
          />

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-crypt-600/70 bg-crypt-900/60 px-4 py-3 text-xs text-[#7b7490]">
            <span>
              Phase 2 build{isDemo ? ' · demo data' : ''} · click the floor to walk, click a relic to
              approach it.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={simulateMistake}
                disabled={villainId !== 'dracula'}
                className="rounded border border-crypt-500 px-2.5 py-1 transition hover:border-blood-400/70 hover:text-blood-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Test Blood Eclipse (−18px)
              </button>
              <button
                type="button"
                onClick={() => setTorchRadius(DEFAULT_TORCH_RADIUS)}
                className="rounded border border-crypt-500 px-2.5 py-1 transition hover:border-ember-400/70 hover:text-ember-400"
              >
                Reset torch
              </button>
            </div>
          </footer>
        </div>

        {activeProp && lore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-crypt-500/80 bg-crypt-900 p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-gothic text-xl text-[#ead9b9]">{lore.name}</h3>
                  <p className="mt-1 text-sm text-[#8a83a0] italic">{lore.lore}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProp(null)}
                  aria-label="Step away"
                  className="rounded-md p-1.5 text-[#7b7490] transition hover:bg-crypt-700 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="rounded-lg border border-crypt-600 bg-crypt-950/70 p-4 text-sm text-[#9d96b0]">
                The real puzzle for this relic arrives in Phase 3. For now, claim its Elder Rune to
                test the solved aura, the door sockets and the gargoyle lock.
              </p>

              <button
                type="button"
                onClick={() => claimRune(activeProp)}
                className="mt-5 w-full rounded-lg border border-rune-400/50 bg-rune-400/10 px-4 py-2.5 font-semibold text-rune-400 transition hover:bg-rune-400/20"
              >
                Claim the Elder Rune (temporary)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <SetupScreen
        onGenerationStart={(message) => {
          setLoadingMessage(message);
          setPhase('LOADING');
        }}
        onGenerationProgress={setLoadingMessage}
        onGenerationEnd={() => setPhase('SETUP')}
        onLaunch={handleLaunch}
      />

      {phase === 'LOADING' && (
        <div className="fog-backdrop fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-crypt-950/95 px-6 text-center backdrop-blur-sm">
          <Loader2 size={44} className="animate-spin text-blood-400" />
          <h2 className="text-gothic animate-flicker text-2xl text-[#ead9b9] sm:text-3xl">
            The Game Master is reading…
          </h2>
          <p className="max-w-md text-[#9d96b0] italic">{loadingMessage}</p>
          <p className="text-xs tracking-[0.3em] text-[#5d5770] uppercase">
            Six trials · Six Elder Runes · One way out
          </p>
        </div>
      )}
    </>
  );
}
