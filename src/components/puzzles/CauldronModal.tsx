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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={revealHint}
              disabled={hintRevealed}
              className="btn btn-iron btn-sm shrink-0 sm:w-52"
            >
              <Eye size={15} />
              {hintRevealed ? 'Hint revealed' : `Hint (+${HINT_THREAT_COST}%)`}
            </button>
            <button type="button" onClick={cast} className="btn flex-1">
              <Sparkles size={16} />
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
        <div className="grid items-center gap-4 landscape:grid-cols-[150px_1fr] md:grid-cols-[170px_1fr]">
          {/* Bubbling brew in its iron pot */}
          <div className="mx-auto w-full max-w-[170px]">
            <div
              className="relative h-24 overflow-hidden border-4 border-iron-2 border-t-0"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 86% 100%, 14% 100%)',
                background: 'linear-gradient(180deg, #4ad66a 0%, #1f8f4a 55%, #0a3d21 100%)',
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(216,255,176,0.7),transparent_62%)]" />
              {[0, 1, 2, 3, 4, 5].map((bubble) => (
                <span
                  key={bubble}
                  className="animate-bubble absolute bottom-0 rounded-full bg-[#eaffd0]"
                  style={{
                    left: `${14 + bubble * 13}%`,
                    width: `${4 + (bubble % 3) * 3}px`,
                    height: `${4 + (bubble % 3) * 3}px`,
                    animationDelay: `${bubble * 0.45}s`,
                    animationDuration: `${2.2 + (bubble % 3) * 0.6}s`,
                  }}
                />
              ))}
            </div>
            <div className="mx-auto h-1.5 w-2/3 bg-iron-2" />
          </div>

          <div className="space-y-3">
            <p className="text-center text-base leading-relaxed text-bone sm:text-lg">
              {before}
              <span className="num mx-1 inline-block min-w-[96px] border-b-2 border-verdigris px-2 text-center font-bold text-verdigris-lit">
                {input.trim() || '…'}
              </span>
              {after}
            </p>

            <div>
              <label htmlFor="cauldron-answer" className="label-etched mb-1.5 block text-center">
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
                className="field num text-center text-lg text-verdigris-lit"
                style={{ borderColor: '#1d4b3f', outlineColor: 'rgba(79,191,158,0.4)' }}
              />
            </div>

            {hintRevealed && (
              <p className="etch etch-flat border-l-[3px] border-l-brass-dim px-3 py-2 text-sm text-brass-lit italic">
                {data.hint}
              </p>
            )}
          </div>
        </div>
      )}
    </PuzzleModalWrapper>
  );
}
