import { useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import SetupScreen from './components/SetupScreen';
import DebugRoomPreview from './components/DebugRoomPreview';
import type { GameData, GamePhase, VillainId } from './types/game';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [loadingMessage, setLoadingMessage] = useState('Opening the crypt…');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [villainId, setVillainId] = useState<VillainId>('dracula');
  const [isDemo, setIsDemo] = useState(false);

  const handleLaunch = useCallback((data: GameData, villain: VillainId, demo: boolean) => {
    setGameData(data);
    setVillainId(villain);
    setIsDemo(demo);
    setPhase('PLAYING');
  }, []);

  const handleExit = useCallback(() => {
    setGameData(null);
    setPhase('SETUP');
  }, []);

  if (phase === 'PLAYING' && gameData) {
    // Phase 2 replaces this debug view with the 800x600 EscapeRoomCanvas.
    return (
      <DebugRoomPreview
        gameData={gameData}
        villainId={villainId}
        isDemo={isDemo}
        onExit={handleExit}
      />
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
