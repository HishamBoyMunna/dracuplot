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
        <div className="grid gap-6 lg:grid-cols-[1fr_230px]">
          <div className="space-y-3">
            <p className="text-sm text-[#9d96b0]">
              Answer each question, then punch its option number into the dial. Four questions, four
              digits, in order.
            </p>

            {questions.map((question, index) => (
              <div
                key={question.q}
                className="rounded-lg border border-crypt-600 bg-crypt-950/60 p-4"
              >
                <p className="text-sm font-semibold text-[#d9d5e4]">
                  <span className="mr-2 text-ember-400">Q{index + 1}.</span>
                  {question.q}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {question.options.map((option, optionIndex) => (
                    <li
                      key={option}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-[#b7b1c6]"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-crypt-500 text-[11px] font-bold text-[#8a83a0]">
                        {optionIndex + 1}
                      </span>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Brass keypad */}
          <div
            className="h-fit rounded-xl border-2 p-4 lg:sticky lg:top-4"
            style={{
              borderColor: 'rgba(201,154,63,0.45)',
              background: 'linear-gradient(165deg, #241f16 0%, #15120d 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,220,150,0.12)',
            }}
          >
            {/* Rune indicator lights */}
            <div className="mb-4 flex justify-center gap-2.5">
              {questions.map((question, index) => {
                const filled = index < entry.length;
                return (
                  <div
                    key={question.q}
                    className="flex h-11 w-11 items-center justify-center rounded-md border font-mono text-lg font-bold transition"
                    style={{
                      borderColor: filled ? 'rgba(60,226,192,0.7)' : 'rgba(201,154,63,0.3)',
                      background: filled ? 'rgba(60,226,192,0.12)' : 'rgba(0,0,0,0.5)',
                      color: filled ? '#3ce2c0' : '#4a4234',
                      boxShadow: filled ? '0 0 14px rgba(60,226,192,0.35)' : 'none',
                    }}
                  >
                    {filled ? entry[index] : '·'}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => press(key)}
                  className="rounded-md border border-[#6b5a32] bg-gradient-to-b from-[#4a3d22] to-[#2c2415] py-2.5 font-mono text-lg font-bold text-[#f0d79a] transition hover:from-[#5c4b29] hover:to-[#372d19] active:translate-y-px"
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
                className="flex items-center justify-center rounded-md border border-blood-500/50 bg-blood-500/10 py-2.5 text-blood-400 transition hover:bg-blood-500/20 active:translate-y-px"
              >
                <Delete size={17} />
              </button>

              <button
                type="button"
                onClick={() => press('0')}
                className="rounded-md border border-[#6b5a32] bg-gradient-to-b from-[#4a3d22] to-[#2c2415] py-2.5 font-mono text-lg font-bold text-[#f0d79a] transition hover:from-[#5c4b29] hover:to-[#372d19] active:translate-y-px"
              >
                0
              </button>

              <button
                type="button"
                onClick={unlock}
                aria-label="Unlock the safe"
                className="flex items-center justify-center rounded-md border border-rune-400/60 bg-rune-400/12 py-2.5 text-rune-400 transition hover:bg-rune-400/22 active:translate-y-px"
              >
                <LockKeyhole size={17} />
              </button>
            </div>

            <p className="mt-3 text-center text-[10px] tracking-[0.2em] text-[#6b5f45] uppercase">
              Clear · 0 · Unlock
            </p>
          </div>
        </div>
      )}
    </PuzzleModalWrapper>
  );
}
