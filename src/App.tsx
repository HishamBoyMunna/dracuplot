import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Flame, Gem, Loader2, RotateCcw, Skull, Upload } from 'lucide-react';
import SetupScreen from './components/SetupScreen';
import EscapeRoomCanvas from './components/EscapeRoomCanvas';
import BookshelfModal from './components/puzzles/BookshelfModal';
import ClockModal from './components/puzzles/ClockModal';
import ScaleModal from './components/puzzles/ScaleModal';
import SafeModal from './components/puzzles/SafeModal';
import CauldronModal from './components/puzzles/CauldronModal';
import GargoyleModal from './components/puzzles/GargoyleModal';
import type {
  GameData,
  GamePhase,
  MistakeLog,
  PropId,
  PuzzleMistake,
  VillainId,
} from './types/game';
import { PROP_LORE, VILLAINS } from './types/game';
import {
  DEFAULT_TORCH_RADIUS,
  MIN_TORCH_RADIUS,
  RUNE_PROP_IDS,
  TORCH_PENALTY_STEP,
  TOTAL_RUNES,
} from './data/roomLayout';

const TICK_MS = 100;

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [loadingMessage, setLoadingMessage] = useState('Opening the crypt…');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [villainId, setVillainId] = useState<VillainId>('dracula');

  const [solvedProps, setSolvedProps] = useState<ReadonlySet<PropId>>(() => new Set<PropId>());
  const [torchRadius, setTorchRadius] = useState(DEFAULT_TORCH_RADIUS);
  const [activeProp, setActiveProp] = useState<PropId | null>(null);
  const [threat, setThreat] = useState(0);
  const [mistakeLogs, setMistakeLogs] = useState<MistakeLog[]>([]);
  const [quaking, setQuaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const quakeTimer = useRef<number | null>(null);
  const threatRef = useRef(0);
  const villain = VILLAINS[villainId];

  /** Single funnel for threat so the catch condition is checked exactly once. */
  const addThreat = useCallback((amount: number) => {
    const next = Math.min(100, threatRef.current + amount);
    threatRef.current = next;
    setThreat(next);
    if (next >= 100) {
      setActiveProp(null);
      setPhase('LOST');
    }
  }, []);

  const runesCollected = useMemo(
    () =>
      RUNE_PROP_IDS.filter((id) => solvedProps.has(id)).length +
      (solvedProps.has('gargoyle') ? 1 : 0),
    [solvedProps],
  );

  /* ---- The villain never stops creeping while the game is live ---- */
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const interval = window.setInterval(() => {
      addThreat(villain.passiveThreatPerSecond * (TICK_MS / 1000));
      setElapsed((current) => current + TICK_MS / 1000);
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [addThreat, phase, villain]);

  useEffect(
    () => () => {
      if (quakeTimer.current) window.clearTimeout(quakeTimer.current);
    },
    [],
  );

  const startRun = useCallback((data: GameData, chosenVillain: VillainId) => {
    setGameData(data);
    setVillainId(chosenVillain);
    setSolvedProps(new Set<PropId>());
    setTorchRadius(DEFAULT_TORCH_RADIUS);
    setActiveProp(null);
    threatRef.current = 0;
    setThreat(0);
    setMistakeLogs([]);
    setElapsed(0);
    setPhase('PLAYING');
  }, []);

  const handleExit = useCallback(() => {
    setGameData(null);
    setActiveProp(null);
    setPhase('SETUP');
  }, []);

  /** One villain penalty per wrong submission, however many concepts were missed. */
  const registerMistakes = useCallback(
    (propId: PropId, mistakes: PuzzleMistake[]) => {
      setMistakeLogs((current) => [
        ...current,
        ...mistakes.map((mistake) => ({
          propId,
          puzzleName: PROP_LORE[propId].name,
          ...mistake,
        })),
      ]);

      addThreat(villain.wrongAnswerPenalty);

      if (villain.id === 'dracula') {
        setTorchRadius((radius) => Math.max(MIN_TORCH_RADIUS, radius - TORCH_PENALTY_STEP));
      }
      if (villain.id === 'werewolf') {
        setQuaking(true);
        if (quakeTimer.current) window.clearTimeout(quakeTimer.current);
        quakeTimer.current = window.setTimeout(() => setQuaking(false), 600);
      }
    },
    [addThreat, villain],
  );

  const solveProp = useCallback((propId: PropId) => {
    setSolvedProps((current) => new Set(current).add(propId));
    setActiveProp(null);
    if (propId === 'gargoyle') setPhase('WON');
  }, []);

  const renderPuzzle = () => {
    if (!activeProp || !gameData) return null;
    const shared = {
      accentColor: villain.accentColor,
      onSolve: () => solveProp(activeProp),
      onMistake: (mistakes: PuzzleMistake[]) => registerMistakes(activeProp, mistakes),
      onThreatCost: (amount: number) => addThreat(amount),
      onClose: () => setActiveProp(null),
    };
    const { puzzles } = gameData;

    switch (activeProp) {
      case 'bookshelf':
        return <BookshelfModal data={puzzles.bookshelf} {...shared} />;
      case 'clock':
        return <ClockModal data={puzzles.clock} {...shared} />;
      case 'scale':
        return <ScaleModal data={puzzles.scale} {...shared} />;
      case 'safe':
        return <SafeModal data={puzzles.safe} {...shared} />;
      case 'cauldron':
        return <CauldronModal data={puzzles.cauldron} {...shared} />;
      case 'gargoyle':
        return (
          <GargoyleModal
            data={puzzles.gargoyle}
            runesCollected={runesCollected}
            runesRequired={RUNE_PROP_IDS.length}
            {...shared}
          />
        );
    }
  };

  if ((phase === 'PLAYING' || phase === 'WON' || phase === 'LOST') && gameData) {
    const won = phase === 'WON';
    const over = won || phase === 'LOST';
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);

    return (
      <div className={`fog-backdrop min-h-screen px-4 py-6 sm:px-6 ${quaking ? 'animate-quake' : ''}`}>
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleExit}
                className="inline-flex items-center gap-2 text-sm text-[#8a83a0] transition hover:text-ember-400"
              >
                <ArrowLeft size={15} />
                Abandon the study
              </button>

              <div className="flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 text-rune-400">
                  <Gem size={15} />
                  {runesCollected}/{TOTAL_RUNES} runes
                </span>
                <span className="inline-flex items-center gap-1.5 text-ember-400">
                  <Flame size={15} />
                  {Math.round((torchRadius / DEFAULT_TORCH_RADIUS) * 100)}% torch
                </span>
                <span className="text-[#7b7490] tabular-nums">
                  {minutes}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Provisional threat meter — replaced by TopHud in Phase 4. */}
            <div className="flex items-center gap-3">
              <Skull size={16} style={{ color: villain.accentColor }} className="shrink-0" />
              <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-crypt-600 bg-crypt-950">
                <div
                  className="h-full rounded-full transition-[width] duration-150 ease-linear"
                  style={{
                    width: `${threat}%`,
                    background: `linear-gradient(90deg, ${villain.accentColor}55, ${villain.accentColor})`,
                    boxShadow: `0 0 14px ${villain.accentColor}`,
                  }}
                />
              </div>
              <span
                className="w-24 shrink-0 text-right text-xs tabular-nums"
                style={{ color: villain.accentColor }}
              >
                {threat.toFixed(0)}% threat
              </span>
            </div>
          </header>

          <EscapeRoomCanvas
            solvedProps={solvedProps}
            torchRadius={torchRadius}
            interactionLocked={activeProp !== null || over}
            accentColor={villain.accentColor}
            onInteractProp={setActiveProp}
          />

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-crypt-600/70 bg-crypt-900/60 px-4 py-3 text-xs text-[#7b7490]">
            <span>
              {villain.name} · {villain.specialEffect}
            </span>
            <span>
              {mistakeLogs.length} concept{mistakeLogs.length === 1 ? '' : 's'} missed so far
            </span>
          </footer>
        </div>

        {phase === 'PLAYING' && renderPuzzle()}

        {over && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm">
            <div
              className="w-full max-w-lg rounded-2xl border-2 bg-crypt-900 p-7 text-center shadow-[0_0_90px_rgba(0,0,0,0.95)]"
              style={{ borderColor: won ? 'rgba(60,226,192,0.6)' : `${villain.accentColor}99` }}
            >
              <h2
                className="text-gothic text-3xl"
                style={{ color: won ? '#3ce2c0' : villain.accentColor }}
              >
                {won ? 'You escaped the study.' : `${villain.name} caught you.`}
              </h2>
              <p className="mt-3 text-[#9d96b0] italic">
                {won
                  ? 'Six Elder Runes, one locked door, and a head full of material you actually know now.'
                  : 'The threat meter filled. The study keeps another scholar.'}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-3 text-left text-sm">
                <div className="rounded-lg border border-crypt-600 bg-crypt-950/60 px-4 py-3">
                  <dt className="text-xs text-[#7b7490] uppercase">Time</dt>
                  <dd className="mt-1 text-[#d9d5e4] tabular-nums">
                    {minutes}:{String(seconds).padStart(2, '0')}
                  </dd>
                </div>
                <div className="rounded-lg border border-crypt-600 bg-crypt-950/60 px-4 py-3">
                  <dt className="text-xs text-[#7b7490] uppercase">Final threat</dt>
                  <dd className="mt-1 text-[#d9d5e4] tabular-nums">{threat.toFixed(0)}%</dd>
                </div>
                <div className="rounded-lg border border-crypt-600 bg-crypt-950/60 px-4 py-3">
                  <dt className="text-xs text-[#7b7490] uppercase">Runes</dt>
                  <dd className="mt-1 text-[#d9d5e4] tabular-nums">
                    {runesCollected}/{TOTAL_RUNES}
                  </dd>
                </div>
                <div className="rounded-lg border border-crypt-600 bg-crypt-950/60 px-4 py-3">
                  <dt className="text-xs text-[#7b7490] uppercase">Concepts missed</dt>
                  <dd className="mt-1 text-[#d9d5e4] tabular-nums">{mistakeLogs.length}</dd>
                </div>
              </dl>

              <p className="mt-5 text-xs text-[#5d5770]">
                The Grimoire of Knowledge study review arrives in Phase 4.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => startRun(gameData, villainId)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-ember-400/60 bg-ember-400/12 px-4 py-3 font-semibold text-ember-400 transition hover:bg-ember-400/22"
                >
                  <RotateCcw size={16} />
                  Replay Same Study Material
                </button>
                <button
                  type="button"
                  onClick={handleExit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-crypt-500 px-4 py-3 font-semibold text-[#b7b1c6] transition hover:border-crypt-400 hover:text-white"
                >
                  <Upload size={16} />
                  Upload New PDF
                </button>
              </div>
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
        onLaunch={(data, chosenVillain) => startRun(data, chosenVillain)}
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
