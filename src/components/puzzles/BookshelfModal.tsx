import { useMemo, useState } from 'react';
import { BookMarked, Link2 } from 'lucide-react';
import type { GameData, PuzzleModalBaseProps } from '../../types/game';
import PuzzleModalWrapper, { RuneAwardPanel } from './PuzzleModalWrapper';
import { shuffle, usePuzzleFeedback } from './puzzleHelpers';

type Pairs = GameData['puzzles']['bookshelf']['pairs'];

interface BookshelfModalProps extends PuzzleModalBaseProps {
  data: { pairs: Pairs };
}

const SPINE_COLORS = ['#8d2230', '#2f6b5a', '#7a5c1f', '#3b3f7a', '#6b2f6b', '#1f5e7a'];

export default function BookshelfModal({
  data,
  accentColor,
  onSolve,
  onMistake,
  onClose,
}: BookshelfModalProps) {
  const pairs = data.pairs;
  const terms = useMemo(() => shuffle(pairs.map((pair, index) => ({ index, text: pair.term }))), [pairs]);
  const definitions = useMemo(
    () => shuffle(pairs.map((pair, index) => ({ index, text: pair.definition }))),
    [pairs],
  );

  const [bound, setBound] = useState<ReadonlySet<number>>(() => new Set<number>());
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [wrongPair, setWrongPair] = useState<{ term: number; definition: number } | null>(null);
  const [complete, setComplete] = useState(false);

  const { shakeSignal, feedback, fail, notify, clear } = usePuzzleFeedback(onMistake);

  const selectTerm = (index: number) => {
    if (bound.has(index) || complete) return;
    clear();
    setWrongPair(null);
    setSelectedTerm((current) => (current === index ? null : index));
  };

  const selectDefinition = (definitionIndex: number) => {
    if (bound.has(definitionIndex) || complete) return;
    if (selectedTerm === null) {
      notify('Choose a tome from the left shelf first.');
      return;
    }

    if (selectedTerm === definitionIndex) {
      const next = new Set(bound).add(definitionIndex);
      setBound(next);
      setSelectedTerm(null);
      setWrongPair(null);
      if (next.size === pairs.length) {
        setComplete(true);
        clear();
      } else {
        notify(`"${pairs[definitionIndex].term}" slides back into place.`, 'success');
      }
      return;
    }

    setWrongPair({ term: selectedTerm, definition: definitionIndex });
    fail(
      `"${pairs[selectedTerm].term}" does not belong to that passage. The shelf shudders.`,
      [
        {
          questionContext: `Match the term "${pairs[selectedTerm].term}" to its definition.`,
          correctTakeaway: pairs[selectedTerm].definition,
        },
      ],
    );
    setSelectedTerm(null);
  };

  return (
    <PuzzleModalWrapper
      propId="bookshelf"
      mechanic="Mechanic I · Concept Matching"
      accentColor={accentColor}
      shakeSignal={shakeSignal}
      feedback={feedback}
      progress={`${bound.size} / ${pairs.length} bound`}
      solved={complete}
      onClose={onClose}
    >
      {complete ? (
        <RuneAwardPanel
          takeaways={pairs.map((pair) => ({ heading: pair.term, body: pair.definition }))}
          onClaim={onSolve}
        />
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-[#9d96b0]">
            Pick a scattered term, then the passage that defines it. Bind all four and the shelf
            surrenders its rune.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2.5">
              <h3 className="flex items-center gap-2 text-xs tracking-[0.25em] text-[#7b7490] uppercase">
                <BookMarked size={13} />
                Scattered tomes
              </h3>
              {terms.map((term, position) => {
                const isBound = bound.has(term.index);
                const isSelected = selectedTerm === term.index;
                const isWrong = wrongPair?.term === term.index;
                return (
                  <button
                    key={term.index}
                    type="button"
                    disabled={isBound}
                    onClick={() => selectTerm(term.index)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                      isBound
                        ? 'cursor-default border-rune-400/50 bg-rune-400/10 text-rune-400'
                        : isWrong
                          ? 'border-blood-500/70 bg-blood-500/12 text-[#f4c6cd]'
                          : isSelected
                            ? 'border-ember-400/80 bg-ember-400/12 text-[#f3e3c6]'
                            : 'border-crypt-600 bg-crypt-950/60 text-[#cfc9dd] hover:border-crypt-500 hover:bg-crypt-800/60'
                    }`}
                  >
                    <span
                      className="h-7 w-2 shrink-0 rounded-sm"
                      style={{
                        background: isBound ? '#3ce2c0' : SPINE_COLORS[position % SPINE_COLORS.length],
                      }}
                    />
                    <span className="font-semibold">{term.text}</span>
                    {isBound && <Link2 size={14} className="ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs tracking-[0.25em] text-[#7b7490] uppercase">
                Unbound passages
              </h3>
              {definitions.map((definition) => {
                const isBound = bound.has(definition.index);
                const isWrong = wrongPair?.definition === definition.index;
                return (
                  <button
                    key={definition.index}
                    type="button"
                    disabled={isBound}
                    onClick={() => selectDefinition(definition.index)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm leading-relaxed transition ${
                      isBound
                        ? 'cursor-default border-rune-400/50 bg-rune-400/10 text-rune-400'
                        : isWrong
                          ? 'border-blood-500/70 bg-blood-500/12 text-[#f4c6cd]'
                          : 'border-crypt-600 bg-crypt-950/60 text-[#b7b1c6] hover:border-crypt-500 hover:bg-crypt-800/60'
                    }`}
                  >
                    {isBound ? `${pairs[definition.index].term} — ${definition.text}` : definition.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PuzzleModalWrapper>
  );
}
