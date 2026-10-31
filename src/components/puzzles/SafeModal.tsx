import { useState } from 'react';
import { Delete, LockKeyhole } from 'lucide-react';
import type { GameData, PuzzleModalBaseProps } from '../../types/game';
import { soundEngine } from '../../services/soundEngine';
import PuzzleModalWrapper, { RuneAwardPanel } from './PuzzleModalWrapper';
import { usePuzzleFeedback } from './puzzleHelpers';

type Questions = GameData['puzzles']['safe']['questions'];

interface SafeModalProps extends PuzzleModalBaseProps {
  data: { questions: Questions };
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function SafeModal({
  data,
  accentColor,
  onSolve,
  onMistake,
  onClose,
}: SafeModalProps) {
  const questions = data.questions;
  const combination = questions.map((question) => String(question.correctIndex + 1)).join('');

  const [entry, setEntry] = useState('');
  const [solved, setSolved] = useState(false);

  const { shakeSignal, feedback, fail, notify, clear } = usePuzzleFeedback(onMistake);

  const press = (digit: string) => {
    if (solved || entry.length >= questions.length) return;
    soundEngine.keypad();
    clear();
    setEntry((current) => current + digit);
  };

  const unlock = () => {
    soundEngine.clack();
    if (entry.length < questions.length) {
      notify(`The vault wants all ${questions.length} digits before it will turn.`);
      return;
    }

    if (entry === combination) {
      setSolved(true);
      clear();
      return;
    }

    const wrong = questions
      .map((question, index) => ({ question, index }))
      .filter(({ question, index }) => entry[index] !== String(question.correctIndex + 1));

    fail(
      `The tumblers grind and reset. ${wrong.length} of the ${questions.length} digits are wrong.`,
      wrong.map(({ question }) => ({
        questionContext: question.q,
        correctTakeaway: `${question.options[question.correctIndex]} (option ${question.correctIndex + 1})`,
      })),
    );
    setEntry('');
  };

  return (
    <PuzzleModalWrapper
      propId="safe"
      mechanic="Mechanic IV · Four-Digit Vault"
      accentColor={accentColor}
      shakeSignal={shakeSignal}
      feedback={feedback}
      progress={`${entry.length} / ${questions.length} digits`}
      solved={solved}
      onClose={onClose}
    >
      {solved ? (
        <RuneAwardPanel
          takeaways={questions.map((question, index) => ({
            heading: `Q${index + 1}. ${question.q}`,
            body: `${question.options[question.correctIndex]} (option ${question.correctIndex + 1})`,
          }))}
          onClaim={onSolve}
        />
      ) : (
        <div className="grid gap-4 landscape:grid-cols-[1fr_200px] md:grid-cols-[1fr_210px]">
          <div className="space-y-2">
            <p className="hidden text-sm text-bone-dim compact:hidden sm:block">
              Answer each question, then punch its option number into the dial. Four questions, four
              digits, in order.
            </p>

            {questions.map((question, index) => (
              <div key={question.q} className="etch etch-flat p-2.5">
                <p className="text-[13px] font-semibold text-bone sm:text-sm">
                  <span className="font-display mr-1.5 text-brass">Q{index + 1}.</span>
                  {question.q}
                </p>
                <ul className="mt-2 space-y-1">
                  {question.options.map((option, optionIndex) => (
                    <li
                      key={option}
                      className="flex items-start gap-2 text-[13px] leading-snug text-bone-dim"
                    >
                      <span className="num mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-iron-2 text-[10px] text-brass-dim">
                        {optionIndex + 1}
                      </span>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Steel keypad bolted to the vault door */}
          <div
            className="etch etch-brass bracket h-fit p-2.5 compact:p-1.5 landscape:sticky landscape:top-0"
            style={{ background: 'linear-gradient(168deg, #2a2117 0%, #130f0a 100%)' }}
          >
            {/* Key indicator lamps */}
            <div className="mb-3 flex justify-center gap-1.5 compact:mb-1.5">
              {questions.map((question, index) => {
                const filled = index < entry.length;
                return (
                  <div
                    key={question.q}
                    className="num chamfer-sm flex h-9 w-9 items-center justify-center border-2 text-base font-bold transition compact:h-7 compact:w-7 compact:text-sm"
                    style={{
                      borderColor: filled ? '#1d4b3f' : '#4a3b22',
                      background: filled ? 'rgba(85,217,159,0.12)' : '#070509',
                      color: filled ? '#55d99f' : '#3f382c',
                      boxShadow: filled
                        ? '0 0 12px rgba(85,217,159,0.42), inset 0 0 8px rgba(85,217,159,0.18)'
                        : 'inset 2px 2px 5px rgba(0,0,0,0.9)',
                    }}
                  >
                    {filled ? entry[index] : '·'}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-1.5 compact:gap-1">
              {KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => press(key)}
                  className="btn num chamfer-sm px-0 py-2 text-base compact:py-1 compact:text-sm"
                >
                  {key}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  soundEngine.clack();
                  clear();
                  setEntry('');
                }}
                aria-label="Clear the dial"
                className="btn btn-blood chamfer-sm px-0 py-2 compact:py-1"
              >
                <Delete size={16} />
              </button>

              <button
                type="button"
                onClick={() => press('0')}
                className="btn num chamfer-sm px-0 py-2 text-base compact:py-1 compact:text-sm"
              >
                0
              </button>

              <button
                type="button"
                onClick={unlock}
                aria-label="Unlock the safe"
                className="btn btn-verd chamfer-sm px-0 py-2 compact:py-1"
              >
                <LockKeyhole size={16} />
              </button>
            </div>

            <p className="label-etched mt-2.5 text-center text-[9px] compact:hidden">Clear · 0 · Unlock</p>
          </div>
        </div>
      )}
    </PuzzleModalWrapper>
  );
}
