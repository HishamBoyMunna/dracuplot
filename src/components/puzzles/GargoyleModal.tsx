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
          <button
            type="button"
            onClick={answer}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-blood-400/60 bg-gradient-to-r from-[#6d0d1c] via-[#a81c31] to-[#6d0d1c] px-4 py-3 font-bold tracking-wide text-white transition hover:brightness-115"
          >
            <DoorOpen size={18} />
            Answer the Warden
          </button>
        )
      }
    >
      {solved ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <DoorOpen size={38} className="animate-rune-pop text-rune-400" />
            <p className="text-gothic text-2xl text-rune-400">The jaws fall open.</p>
            <p className="text-sm text-[#9d96b0] italic">
              The sixth Elder Rune burns itself into your palm. Cold air pours in from the corridor
              beyond.
            </p>
          </div>

          <div className="rounded-lg border border-rune-400/40 bg-rune-400/8 px-4 py-3">
            <p className="text-sm font-semibold text-rune-400">
              {data.options[data.correctIndex]}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#bdc9c6]">{data.explanation}</p>
          </div>

          <button
            type="button"
            onClick={onSolve}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-rune-400/60 bg-rune-400/12 px-4 py-3 font-semibold text-rune-400 transition hover:bg-rune-400/22"
          >
            <Gem size={17} />
            Claim the Sixth Rune & Escape
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: runesRequired }, (_, index) => (
              <span
                key={index}
                className={`h-3 w-3 rotate-45 rounded-[2px] ${
                  index < runesCollected ? 'bg-rune-400 shadow-[0_0_10px_#3ce2c0]' : 'bg-crypt-600'
                }`}
              />
            ))}
          </div>

          <p className="rounded-lg border border-crypt-600/70 bg-crypt-950/60 px-4 py-4 text-sm leading-relaxed text-[#cfc9dd]">
            {data.scenario}
          </p>

          <div className="space-y-2.5">
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
                  className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm leading-relaxed transition ${
                    isEliminated
                      ? 'cursor-not-allowed border-crypt-700 bg-crypt-950/40 text-[#4f4a5e] line-through'
                      : isSelected
                        ? 'border-blood-400/70 bg-blood-500/12 text-[#f4dde1]'
                        : 'border-crypt-600 bg-crypt-950/60 text-[#cfc9dd] hover:border-crypt-500 hover:bg-crypt-800/60'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                      isSelected ? 'border-blood-400 text-blood-400' : 'border-crypt-500 text-[#8a83a0]'
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
