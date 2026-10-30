import { useState } from 'react';
import { DoorOpen, Gem } from 'lucide-react';
import type { GameData, PuzzleModalBaseProps } from '../../types/game';
import PuzzleModalWrapper from './PuzzleModalWrapper';
import { usePuzzleFeedback } from './puzzleHelpers';

type GargoylePuzzle = GameData['puzzles']['gargoyle'];

interface GargoyleModalProps extends PuzzleModalBaseProps {
  data: GargoylePuzzle;
  runesCollected: number;
  runesRequired: number;
}

export default function GargoyleModal({
  data,
  runesCollected,
  runesRequired,
  accentColor,
  onSolve,
  onMistake,
  onClose,
}: GargoyleModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [eliminated, setEliminated] = useState<ReadonlySet<number>>(() => new Set<number>());
  const [solved, setSolved] = useState(false);

  const { shakeSignal, feedback, fail, notify, clear } = usePuzzleFeedback(onMistake);

  const answer = () => {
    if (selected === null) {
      notify('The warden waits. Choose an answer.');
      return;
    }

    if (selected === data.correctIndex) {
      setSolved(true);
      clear();
      return;
    }

    setEliminated((current) => new Set(current).add(selected));
    fail('Stone grinds on stone. The jaws stay shut — that reading does not hold.', [
      {
        questionContext: data.scenario,
        correctTakeaway: `${data.options[data.correctIndex]} — ${data.explanation}`,
      },
    ]);
    setSelected(null);
  };

  return (
    <PuzzleModalWrapper
      propId="gargoyle"
      mechanic="Final Trial · Synthesis"
      accentColor={accentColor}
      shakeSignal={shakeSignal}
      feedback={feedback}
      progress={`${runesCollected} / ${runesRequired} runes`}
      solved={solved}
      onClose={onClose}
      footer={
        solved ? undefined : (
          <button type="button" onClick={answer} className="btn btn-blood w-full">
            <DoorOpen size={17} />
            Answer the Warden
          </button>
        )
      }
    >
      {solved ? (
        <div className="space-y-3.5">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <DoorOpen size={34} className="animate-rune-pop text-verdigris-lit" />
            <p className="font-display text-xl text-verdigris-lit sm:text-2xl">
              The jaws fall open.
            </p>
            <p className="text-sm text-bone-dim italic">
              The sixth Elder Rune burns itself into your palm. Cold air pours in from the corridor
              beyond.
            </p>
          </div>

          <div className="etch etch-flat border-l-[3px] border-l-verdigris px-3 py-2.5">
            <p className="text-sm font-semibold text-verdigris-lit">
              {data.options[data.correctIndex]}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-bone-dim">{data.explanation}</p>
          </div>

          <button type="button" onClick={onSolve} className="btn btn-verd w-full">
            <Gem size={16} />
            Claim the Sixth Rune &amp; Escape
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {Array.from({ length: runesRequired }, (_, index) => (
              <span
                key={index}
                className={`h-3 w-3 rotate-45 border ${
                  index < runesCollected
                    ? 'border-verdigris-lit bg-verdigris-lit shadow-[0_0_9px_#4fbf9e]'
                    : 'border-iron-2'
                }`}
              />
            ))}
          </div>

          <p className="etch etch-flat border-l-[3px] border-l-blood px-3 py-2.5 text-[13px] leading-snug text-bone sm:text-sm">
            {data.scenario}
          </p>

          <div className="grid gap-2 landscape:grid-cols-2 md:grid-cols-2">
            {data.options.map((option, index) => {
              const isSelected = selected === index;
              const isEliminated = eliminated.has(index);
              return (
                <button
                  key={option}
                  type="button"
                  disabled={isEliminated}
                  onClick={() => {
                    clear();
                    setSelected(index);
                  }}
                  className={`etch etch-flat flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-[13px] leading-snug transition ${
                    isEliminated
                      ? 'cursor-not-allowed text-bone-faint line-through opacity-50'
                      : isSelected
                        ? 'etch-blood text-[#f3d9d6]'
                        : 'text-bone hover:border-iron-2'
                  }`}
                >
                  <span
                    className={`num mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center border text-[10px] ${
                      isSelected ? 'border-blood-lit text-blood-glow' : 'border-iron-2 text-bone-faint'
                    }`}
                  >
                    {index + 1}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </PuzzleModalWrapper>
  );
}
