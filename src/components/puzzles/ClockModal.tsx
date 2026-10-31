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
      `The gears jam. ${correctCount} of ${steps.length} steps are in the right slot — the clock will not be fooled.`,
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
          <button type="button" onClick={submit} className="btn w-full">
            <Bell size={16} />
            Lock the Sequence (Submit)
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
        <div className="space-y-3">
          <p className="etch etch-flat border-l-[3px] border-l-brass-dim px-3 py-2 text-sm text-bone-dim italic">
            {data.prompt}
          </p>

          <div className="space-y-2">
            {order.map((stepIndex, position) => (
              <div
                key={stepIndex}
                className="etch etch-flat flex items-stretch gap-2.5 p-2 transition hover:border-iron-2"
              >
                <div className="font-display flex w-9 shrink-0 items-center justify-center border border-brass-dim bg-brass/8 text-sm text-brass-lit">
                  {ROMAN[position]}
                </div>

                <p className="flex-1 self-center text-[13px] leading-snug text-bone sm:text-sm">
                  {steps[stepIndex]}
                </p>

                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(position, -1)}
                    disabled={position === 0}
                    aria-label="Move this step earlier"
                    className="btn btn-sm btn-icon btn-iron"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(position, 1)}
                    disabled={position === order.length - 1}
                    aria-label="Move this step later"
                    className="btn btn-sm btn-icon btn-iron"
                  >
                    <ChevronDown size={14} />
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
