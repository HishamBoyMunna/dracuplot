import { useState } from 'react';
import { Scale as ScaleIcon } from 'lucide-react';
import type { GameData, PuzzleModalBaseProps } from '../../types/game';
import PuzzleModalWrapper, { RuneAwardPanel } from './PuzzleModalWrapper';
import { usePuzzleFeedback } from './puzzleHelpers';

type Statements = GameData['puzzles']['scale']['statements'];

interface ScaleModalProps extends PuzzleModalBaseProps {
  data: { statements: Statements };
}

export default function ScaleModal({
  data,
  accentColor,
  onSolve,
  onMistake,
  onClose,
}: ScaleModalProps) {
  const statements = data.statements;
  const [verdicts, setVerdicts] = useState<Array<boolean | null>>(() => statements.map(() => null));
  const [wrongIndices, setWrongIndices] = useState<ReadonlySet<number>>(() => new Set<number>());
  const [solved, setSolved] = useState(false);

  const { shakeSignal, feedback, fail, notify, clear } = usePuzzleFeedback(onMistake);

  const answered = verdicts.filter((verdict) => verdict !== null).length;

  const setVerdict = (index: number, value: boolean) => {
    if (solved) return;
    clear();
    setWrongIndices((current) => {
      if (!current.has(index)) return current;
      const next = new Set(current);
      next.delete(index);
      return next;
    });
    setVerdicts((current) => current.map((verdict, i) => (i === index ? value : verdict)));
  };

  const submit = () => {
    if (answered < statements.length) {
      notify('Every claim must sit on a pan before the scale will settle.');
      return;
    }

    const wrong = statements
      .map((statement, index) => ({ statement, index }))
      .filter(({ statement, index }) => verdicts[index] !== statement.isTrue);

    if (wrong.length === 0) {
      setSolved(true);
      clear();
      return;
    }

    setWrongIndices(new Set(wrong.map((entry) => entry.index)));
    fail(
      `The pans crash. ${wrong.length} of ${statements.length} claim${wrong.length === 1 ? ' was' : 's were'} weighed wrongly — the mis-weighed ones are marked in red.`,
      wrong.map(({ statement }) => ({
        questionContext: `Is this true or false? "${statement.text}"`,
        correctTakeaway: `${statement.isTrue ? 'TRUE' : 'FALSE'} — ${statement.explanation}`,
      })),
    );
  };

  return (
    <PuzzleModalWrapper
      propId="scale"
      mechanic="Mechanic III · Truth Triage"
      accentColor={accentColor}
      shakeSignal={shakeSignal}
      feedback={feedback}
      progress={`${answered} / ${statements.length} weighed`}
      solved={solved}
      onClose={onClose}
      footer={
        solved ? undefined : (
          <button
            type="button"
            onClick={submit}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-ember-400/60 bg-ember-400/12 px-4 py-3 font-semibold text-ember-400 transition hover:bg-ember-400/22"
          >
            <ScaleIcon size={17} />
            Weigh Souls (Submit)
          </button>
        )
      }
    >
      {solved ? (
        <RuneAwardPanel
          takeaways={statements.map((statement) => ({
            heading: `${statement.isTrue ? 'TRUTH' : 'FALLACY'} — ${statement.text}`,
            body: statement.explanation,
          }))}
          onClaim={onSolve}
        />
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-[#9d96b0]">
            Lay each claim on a pan. The scale judges all four at once — partial honesty earns
            nothing.
          </p>

          <div className="space-y-3">
            {statements.map((statement, index) => {
              const verdict = verdicts[index];
              const isWrong = wrongIndices.has(index);
              return (
                <div
                  key={statement.text}
                  className={`rounded-lg border p-4 transition ${
                    isWrong
                      ? 'border-blood-500/70 bg-blood-500/10'
                      : 'border-crypt-600 bg-crypt-950/60'
                  }`}
                >
                  <p className="text-sm leading-relaxed text-[#cfc9dd]">{statement.text}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVerdict(index, true)}
                      className={`flex-1 rounded-md border px-3 py-2 text-xs font-bold tracking-[0.18em] transition ${
                        verdict === true
                          ? 'border-rune-400/70 bg-rune-400/15 text-rune-400'
                          : 'border-crypt-600 text-[#8a83a0] hover:border-rune-400/40 hover:text-rune-400'
                      }`}
                    >
                      [TRUTH]
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerdict(index, false)}
                      className={`flex-1 rounded-md border px-3 py-2 text-xs font-bold tracking-[0.18em] transition ${
                        verdict === false
                          ? 'border-blood-400/70 bg-blood-500/15 text-blood-400'
                          : 'border-crypt-600 text-[#8a83a0] hover:border-blood-400/40 hover:text-blood-400'
                      }`}
                    >
                      [FALLACY]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PuzzleModalWrapper>
  );
}
