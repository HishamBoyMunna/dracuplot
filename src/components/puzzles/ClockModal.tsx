import { useMemo, useState } from 'react';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';
import type { GameData, PuzzleModalBaseProps } from '../../types/game';
import PuzzleModalWrapper, { RuneAwardPanel } from './PuzzleModalWrapper';
import { shuffle, usePuzzleFeedback } from './puzzleHelpers';

type ClockPuzzle = GameData['puzzles']['clock'];

interface ClockModalProps extends PuzzleModalBaseProps {
  data: ClockPuzzle;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export default function ClockModal({
  data,
  accentColor,
  onSolve,
  onMistake,
  onClose,
}: ClockModalProps) {
  const steps = data.orderedSteps;

  // Work with indices into orderedSteps so comparison stays trivial.
  const [order, setOrder] = useState<number[]>(() => {
    const indices = steps.map((_, index) => index);
    let shuffled = shuffle(indices);
    // Never hand the player the finished sequence.
    let guard = 0;
    while (shuffled.every((value, index) => value === index) && guard < 12) {
      shuffled = shuffle(indices);
      guard += 1;
    }
    return shuffled;
  });
  const [solved, setSolved] = useState(false);

  const { shakeSignal, feedback, fail, clear } = usePuzzleFeedback(onMistake);

  const correctCount = useMemo(
    () => order.filter((value, index) => value === index).length,
    [order],
  );

  const move = (position: number, direction: -1 | 1) => {
    const target = position + direction;
    if (solved || target < 0 || target >= order.length) return;
    clear();
    setOrder((current) => {
      const next = [...current];
      [next[position], next[target]] = [next[target], next[position]];
      return next;
    });
  };

  const submit = () => {
    const isCorrect = order.every((value, index) => value === index);
    if (isCorrect) {
      setSolved(true);
      clear();
      return;
    }

    const misplaced = order
      .map((value, index) => ({ value, index }))
      .filter((entry) => entry.value !== entry.index);

    fail(
      `The chime rings flat. ${correctCount} of ${steps.length} are in their true position — the clock will not be fooled.`,
      [
        {
          questionContext: data.prompt,
          correctTakeaway: `The true order is:\n${steps
            .map((step, index) => `${index + 1}. ${step}`)
            .join('\n')}`,
        },
        ...misplaced.slice(0, 1).map((entry) => ({
          questionContext: `Which step comes at position ${entry.index + 1}?`,
          correctTakeaway: steps[entry.index],
        })),
      ],
    );
  };

  return (
    <PuzzleModalWrapper
      propId="clock"
      mechanic="Mechanic II · Sequence Ordering"
      accentColor={accentColor}
      shakeSignal={shakeSignal}
      feedback={feedback}
      progress={`${order.length} steps`}
      solved={solved}
      onClose={onClose}
      footer={
        solved ? undefined : (
          <button
            type="button"
            onClick={submit}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-ember-400/60 bg-ember-400/12 px-4 py-3 font-semibold text-ember-400 transition hover:bg-ember-400/22"
          >
            <Bell size={17} />
            Strike the Chime (Submit)
          </button>
        )
      }
    >
      {solved ? (
        <RuneAwardPanel
          takeaways={steps.map((step, index) => ({
            heading: `Step ${index + 1}`,
            body: step,
          }))}
          onClaim={onSolve}
        />
      ) : (
        <div className="space-y-5">
          <p className="rounded-lg border border-crypt-600/70 bg-crypt-950/60 px-4 py-3 text-sm text-[#cfc9dd] italic">
            {data.prompt}
          </p>

          <div className="space-y-2.5">
            {order.map((stepIndex, position) => (
              <div
                key={stepIndex}
                className="flex items-stretch gap-3 rounded-lg border border-crypt-600 bg-crypt-950/60 p-3 transition hover:border-crypt-500"
              >
                <div
                  className="flex w-10 shrink-0 flex-col items-center justify-center rounded-md border text-sm font-bold"
                  style={{
                    borderColor: 'rgba(201,154,63,0.5)',
                    background: 'rgba(201,154,63,0.08)',
                    color: '#e0b85c',
                  }}
                >
                  {ROMAN[position]}
                </div>

                <p className="flex-1 self-center text-sm leading-relaxed text-[#cfc9dd]">
                  {steps[stepIndex]}
                </p>

                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(position, -1)}
                    disabled={position === 0}
                    aria-label="Move this step earlier"
                    className="rounded border border-crypt-600 p-1 text-[#9d96b0] transition hover:border-ember-400/60 hover:text-ember-400 disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(position, 1)}
                    disabled={position === order.length - 1}
                    aria-label="Move this step later"
                    className="rounded border border-crypt-600 p-1 text-[#9d96b0] transition hover:border-ember-400/60 hover:text-ember-400 disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PuzzleModalWrapper>
  );
}
