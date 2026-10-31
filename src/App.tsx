import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import SetupScreen from './components/SetupScreen';
import EscapeRoomCanvas from './components/EscapeRoomCanvas';
import TopHud from './components/TopHud';
import EndgameModal from './components/EndgameModal';
import OrientationGate from './components/OrientationGate';
import { useIsPortraitPhone } from './hooks/useOrientation';
import BookshelfModal from './components/puzzles/BookshelfModal';
import ClockModal from './components/puzzles/ClockModal';
import ScaleModal from './components/puzzles/ScaleModal';
import SafeModal from './components/puzzles/SafeModal';
import CauldronModal from './components/puzzles/CauldronModal';
import GargoyleModal from './components/puzzles/GargoyleModal';
import { soundEngine } from './services/soundEngine';
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
  const [loadingMessage, setLoadingMessage] = useState('Opening the case file…');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [villainId, setVillainId] = useState<VillainId>('dracula');

  const [solvedProps, setSolvedProps] = useState<ReadonlySet<PropId>>(() => new Set<PropId>());
  const [torchRadius, setTorchRadius] = useState(DEFAULT_TORCH_RADIUS);
  const [activeProp, setActiveProp] = useState<PropId | null>(null);
  const [threat, setThreat] = useState(0);
  const [mistakeLogs, setMistakeLogs] = useState<MistakeLog[]>([]);
  const [wrongSubmissions, setWrongSubmissions] = useState(0);
  const [quaking, setQuaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(() => soundEngine.isMuted());

  const quakeTimer = useRef<number | null>(null);
  const threatRef = useRef(0);
  const villain = VILLAINS[villainId];
  const portraitPhone = useIsPortraitPhone();

  /** Single funnel for threat so the catch condition is checked exactly once. */
  const addThreat = useCallback((amount: number) => {
    const next = Math.min(100, threatRef.current + amount);
    threatRef.current = next;
    setThreat(next);
    soundEngine.setThreat(next);
    if (next >= 100) {
      setActiveProp(null);
      setPhase('LOST');
      soundEngine.defeat();
    }
  }, []);

  /* ---- The villain never stops creeping while the game is live ---- */
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const interval = window.setInterval(() => {
      addThreat(villain.passiveThreatPerSecond * (TICK_MS / 1000));
      setElapsed((current) => current + TICK_MS / 1000);
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [addThreat, phase, villain]);

  useEffect(() => {
    if (phase === 'SETUP' || phase === 'LOADING') soundEngine.stopHeartbeat();
  }, [phase]);

  useEffect(
    () => () => {
      if (quakeTimer.current) window.clearTimeout(quakeTimer.current);
      soundEngine.stopHeartbeat();
    },
    [],
  );

  const toggleMute = useCallback(() => {
    soundEngine.unlock();
    setMuted(soundEngine.toggleMuted());
  }, []);

  const startRun = useCallback((data: GameData, chosenVillain: VillainId) => {
    soundEngine.unlock();
    soundEngine.stopHeartbeat();
    setGameData(data);
    setVillainId(chosenVillain);
    setSolvedProps(new Set<PropId>());
    setTorchRadius(DEFAULT_TORCH_RADIUS);
    setActiveProp(null);
    threatRef.current = 0;
    setThreat(0);
    setMistakeLogs([]);
    setWrongSubmissions(0);
    setElapsed(0);
    setPhase('PLAYING');
  }, []);

  const handleExit = useCallback(() => {
    soundEngine.stopHeartbeat();
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
      setWrongSubmissions((count) => count + 1);

      soundEngine.wrong();
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
    if (propId === 'gargoyle') {
      setPhase('WON');
      soundEngine.victory();
    } else {
      soundEngine.rune();
    }
  }, []);

  const runesCollected = useMemo(
    () =>
      RUNE_PROP_IDS.filter((id) => solvedProps.has(id)).length +
      (solvedProps.has('gargoyle') ? 1 : 0),
    [solvedProps],
  );

  const renderPuzzle = () => {
    if (!activeProp || !gameData) return null;
    const shared = {
      accentColor: villain.accentColor,
      onSolve: () => solveProp(activeProp),
      onMistake: (mistakes: PuzzleMistake[]) => registerMistakes(activeProp, mistakes),
      onThreatCost: (amount: number) => {
        soundEngine.whisper();
        addThreat(amount);
      },
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

  if (portraitPhone) return <OrientationGate />;

  if ((phase === 'PLAYING' || phase === 'WON' || phase === 'LOST') && gameData) {
    const over = phase === 'WON' || phase === 'LOST';

    return (
      <div
        className={`fog-backdrop flex h-[100dvh] w-screen flex-col overflow-hidden bg-ink p-2 compact:p-1 sm:p-3 ${
          quaking ? 'animate-quake' : ''
        }`}
      >
        <div className="mx-auto flex min-h-0 w-full max-w-[1000px] flex-1 flex-col gap-2 compact:gap-1">
          <div className="flex shrink-0 items-center justify-between gap-3 compact:hidden">
            <button
              type="button"
              onClick={handleExit}
              className="flex items-center gap-2 text-sm text-bone-faint transition hover:text-brass"
            >
              <ArrowLeft size={14} />
              Abandon the job
            </button>
            <p className="truncate text-xs text-bone-faint italic">{gameData.documentTitle}</p>
          </div>

          <TopHud
            villain={villain}
            threat={threat}
            runesCollected={runesCollected}
            totalRunes={TOTAL_RUNES}
            torchRadius={torchRadius}
            elapsed={elapsed}
            muted={muted}
            onToggleMute={toggleMute}
          />

          <EscapeRoomCanvas
            solvedProps={solvedProps}
            torchRadius={torchRadius}
            interactionLocked={activeProp !== null || over}
            accentColor={villain.accentColor}
            onInteractProp={setActiveProp}
          />

          <footer className="shrink-0 truncate text-center text-[11px] text-bone-faint italic compact:hidden">
            {villain.specialEffect}
          </footer>
        </div>

        {phase === 'PLAYING' && renderPuzzle()}

        {over && (
          <EndgameModal
            won={phase === 'WON'}
            gameData={gameData}
            villain={villain}
            elapsed={elapsed}
            threat={threat}
            runesCollected={runesCollected}
            totalRunes={TOTAL_RUNES}
            mistakeLogs={mistakeLogs}
            wrongSubmissions={wrongSubmissions}
            onReplay={() => startRun(gameData, villainId)}
            onNewDocument={handleExit}
          />
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
        <div className="fog-backdrop fixed inset-0 z-[60] flex h-[100dvh] flex-col items-center justify-center gap-5 bg-ink/97 px-6 text-center">
          <Loader2 size={40} className="animate-spin text-blood-glow" />
          <h2 className="font-display animate-flicker text-2xl text-bone sm:text-3xl">
            Black Mask is reading the file…
          </h2>
          <p className="max-w-md text-bone-dim italic">{loadingMessage}</p>
          <div className="rule-orn w-72">
            <span className="label-etched whitespace-nowrap">Six Locks · Six Keys</span>
          </div>
        </div>
      )}
    </>
  );
}
