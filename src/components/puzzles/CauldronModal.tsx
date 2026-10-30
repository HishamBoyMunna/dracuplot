import { useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import type { GameData, PuzzleModalBaseProps } from '../../types/game';
import PuzzleModalWrapper, { RuneAwardPanel } from './PuzzleModalWrapper';
import {
  HINT_THREAT_COST,
  matchesAnswer,
  splitClue,
  usePuzzleFeedback,
} from './puzzleHelpers';

type CauldronPuzzle = GameData['puzzles']['cauldron'];

interface CauldronModalProps extends PuzzleModalBaseProps {
  data: CauldronPuzzle;
}

export default function CauldronModal({
  data,
  accentColor,
  onSolve,
  onMistake,
  onThreatCost,
  onClose,
}: CauldronModalProps) {
  const [input, setInput] = useState('');
  const [hintRevealed, setHintRevealed] = useState(false);
  const [solved, setSolved] = useState(false);

  const { shakeSignal, feedback, fail, notify, clear } = usePuzzleFeedback(onMistake);

  const [before, after] = splitClue(data.clue);

  const cast = () => {
    if (!input.trim()) {
      notify('The brew needs a word to swallow.');
      return;
    }

    if (matchesAnswer(input, data.answer)) {
      setSolved(true);
      clear();
      return;
    }

    fail(`The cauldron spits "${input.trim()}" back at you, scalding.`, [
      {
        questionContext: data.clue.replace('[BLANK]', '______'),
        correctTakeaway: data.answer,
      },
    ]);
  };

  const revealHint = () => {
    if (hintRevealed) return;
    setHintRevealed(true);
    onThreatCost(HINT_THREAT_COST, 'Cauldron hint');
    notify(`The vapour whispers — and the shadows lengthen (+${HINT_THREAT_COST}% threat).`);
  };

  return (
    <PuzzleModalWrapper
      propId="cauldron"
      mechanic="Mechanic V · Keyword Recall"
      accentColor={accentColor}
      shakeSignal={shakeSignal}
      feedback={feedback}
      solved={solved}
      onClose={onClose}
      footer={
        solved ? undefined : (
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={revealHint}
              disabled={hintRevealed}
              className="flex items-center justify-center gap-2 rounded-lg border border-wraith-400/50 bg-wraith-400/10 px-4 py-3 text-sm font-semibold text-wraith-400 transition hover:bg-wraith-400/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-56"
            >
              <Eye size={16} />
              {hintRevealed ? 'Hint revealed' : `Reveal Hint (+${HINT_THREAT_COST}% threat)`}
            </button>
            <button
              type="button"
              onClick={cast}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-ember-400/60 bg-ember-400/12 px-4 py-3 font-semibold text-ember-400 transition hover:bg-ember-400/22"
            >
              <Sparkles size={17} />
              Cast Incantation
            </button>
          </div>
        )
      }
    >
      {solved ? (
        <RuneAwardPanel
          takeaways={[
            {
              heading: data.clue.replace('[BLANK]', data.answer.toUpperCase()),
              body: data.hint,
            },
          ]}
          onClaim={onSolve}
        />
      ) : (
        <div className="space-y-6">
          {/* Bubbling brew */}
          <div className="relative mx-auto h-28 w-44 overflow-hidden rounded-b-full border-4 border-[#3c3a46] bg-gradient-to-b from-[#4ad66a] via-[#1f8f4a] to-[#0d4f2a]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(216,255,176,0.65),transparent_60%)]" />
            {[0, 1, 2, 3, 4, 5].map((bubble) => (
              <span
                key={bubble}
                className="animate-bubble absolute bottom-0 rounded-full bg-[#eaffd0]"
                style={{
                  left: `${10 + bubble * 15}%`,
                  width: `${5 + (bubble % 3) * 3}px`,
                  height: `${5 + (bubble % 3) * 3}px`,
                  animationDelay: `${bubble * 0.45}s`,
                  animationDuration: `${2.2 + (bubble % 3) * 0.6}s`,
                }}
              />
            ))}
          </div>

          <p className="text-center text-lg leading-relaxed text-[#cfc9dd]">
            {before}
            <span className="mx-1 inline-block min-w-[110px] border-b-2 border-dashed border-rune-400/60 px-2 text-center font-semibold text-rune-400">
              {input.trim() || '…'}
            </span>
            {after}
          </p>

          <div>
            <label
              htmlFor="cauldron-answer"
              className="mb-2 block text-center text-xs tracking-[0.25em] text-[#7b7490] uppercase"
            >
              Speak the missing word
            </label>
            <input
              id="cauldron-answer"
              type="text"
              value={input}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                clear();
                setInput(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') cast();
              }}
              className="w-full rounded-lg border-2 border-rune-400/40 bg-crypt-950/80 px-5 py-3.5 text-center text-xl text-rune-400 shadow-[0_0_30px_-10px_rgba(60,226,192,0.6)] outline-none transition focus:border-rune-400/80 focus:shadow-[0_0_35px_-6px_rgba(60,226,192,0.75)]"
            />
          </div>

          {hintRevealed && (
            <p className="rounded-lg border border-wraith-400/40 bg-wraith-400/8 px-4 py-3 text-sm text-[#d6c6f0] italic">
              {data.hint}
            </p>
          )}
        </div>
      )}
    </PuzzleModalWrapper>
  );
}
