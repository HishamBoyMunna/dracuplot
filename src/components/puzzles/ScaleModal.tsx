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
          <button type="button" onClick={submit} className="btn w-full">
            <ScaleIcon size={16} />
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
        <div className="space-y-3">
          <p className="hidden text-sm text-bone-dim compact:hidden sm:block">
            Lay each claim on a pan. The scale judges all four at once — partial honesty earns
            nothing.
          </p>

          <div className="grid gap-2 landscape:grid-cols-2 md:grid-cols-2">
            {statements.map((statement, index) => {
              const verdict = verdicts[index];
              const isWrong = wrongIndices.has(index);
              return (
                <div
                  key={statement.text}
                  className={`etch etch-flat flex flex-col p-2.5 transition ${
                    isWrong ? 'etch-blood' : ''
                  }`}
                >
                  <p className="flex-1 text-[13px] leading-snug text-bone sm:text-sm">
                    {statement.text}
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVerdict(index, true)}
                      className={`btn btn-sm flex-1 ${
                        verdict === true ? 'btn-verd' : 'btn-iron'
                      }`}
                    >
                      [TRUTH]
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerdict(index, false)}
                      className={`btn btn-sm flex-1 ${
                        verdict === false ? 'btn-blood' : 'btn-iron'
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
