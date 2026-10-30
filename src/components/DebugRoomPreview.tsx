import {
  ArrowLeft,
  BookOpenText,
  Clock3,
  DoorClosed,
  FlaskConical,
  Lock,
  Scale,
} from 'lucide-react';
import type { GameData, PropId, VillainId } from '../types/game';
import { PROP_LORE, VILLAINS } from '../types/game';

const PROP_ICONS: Record<PropId, typeof BookOpenText> = {
  bookshelf: BookOpenText,
  clock: Clock3,
  scale: Scale,
  safe: Lock,
  cauldron: FlaskConical,
  gargoyle: DoorClosed,
};

interface DebugRoomPreviewProps {
  gameData: GameData;
  villainId: VillainId;
  isDemo: boolean;
  onExit: () => void;
}

function Section({ propId, children }: { propId: PropId; children: React.ReactNode }) {
  const Icon = PROP_ICONS[propId];
  const lore = PROP_LORE[propId];
  return (
    <section className="rounded-2xl border border-crypt-600/80 bg-crypt-900/70 p-5">
      <header className="mb-3 flex items-center gap-3 border-b border-crypt-600/60 pb-3">
        <Icon size={18} className="text-ember-400" />
        <div>
          <h3 className="text-gothic text-lg text-[#ead9b9]">{lore.name}</h3>
          <p className="text-xs text-[#7b7490] italic">{lore.lore}</p>
        </div>
      </header>
      <div className="space-y-2 text-sm text-[#b7b1c6]">{children}</div>
    </section>
  );
}

export default function DebugRoomPreview({
  gameData,
  villainId,
  isDemo,
  onExit,
}: DebugRoomPreviewProps) {
  const villain = VILLAINS[villainId];
  const { puzzles } = gameData;

  return (
    <div className="fog-backdrop min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex w-fit items-center gap-2 text-sm text-[#8a83a0] transition hover:text-ember-400"
        >
          <ArrowLeft size={15} />
          Back to the setup altar
        </button>

        <header className="rounded-2xl border border-crypt-600/80 bg-crypt-900/70 p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs tracking-[0.25em] uppercase">
            <span className="rounded-full bg-crypt-700 px-3 py-1 text-[#9d96b0]">
              Phase 1 debug preview
            </span>
            {isDemo && (
              <span className="rounded-full bg-rune-400/15 px-3 py-1 text-rune-400">Demo data</span>
            )}
            <span
              className="rounded-full px-3 py-1"
              style={{ background: `${villain.accentColor}22`, color: villain.accentColor }}
            >
              {villain.name}
            </span>
          </div>
          <h1 className="text-gothic mt-4 text-3xl text-[#f0ebf7]">{gameData.documentTitle}</h1>
          <p className="mt-3 leading-relaxed text-[#a9a2bb] italic">{gameData.storyIntro}</p>
          <p className="mt-4 text-xs text-[#6f6880]">
            The 2D top-down escape room canvas replaces this view in Phase 2.
          </p>
        </header>

        <Section propId="bookshelf">
          {puzzles.bookshelf.pairs.map((pair) => (
            <p key={pair.term}>
              <span className="text-rune-400">{pair.term}</span> — {pair.definition}
            </p>
          ))}
        </Section>

        <Section propId="clock">
          <p className="text-[#8a83a0] italic">{puzzles.clock.prompt}</p>
          <ol className="list-decimal space-y-1 pl-5">
            {puzzles.clock.orderedSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Section>

        <Section propId="scale">
          {puzzles.scale.statements.map((statement) => (
            <p key={statement.text}>
              <span className={statement.isTrue ? 'text-rune-400' : 'text-blood-400'}>
                [{statement.isTrue ? 'TRUTH' : 'FALLACY'}]
              </span>{' '}
              {statement.text}
              <span className="block pl-4 text-xs text-[#7b7490]">{statement.explanation}</span>
            </p>
          ))}
        </Section>

        <Section propId="safe">
          {puzzles.safe.questions.map((question, index) => (
            <div key={question.q}>
              <p className="text-[#d9d5e4]">
                Q{index + 1}. {question.q}
              </p>
              <ul className="pl-4 text-xs">
                {question.options.map((option, optionIndex) => (
                  <li
                    key={option}
                    className={optionIndex === question.correctIndex ? 'text-rune-400' : undefined}
                  >
                    [{optionIndex + 1}] {option}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="pt-2 text-xs text-ember-400">
            Keypad combination:{' '}
            {puzzles.safe.questions.map((question) => question.correctIndex + 1).join('')}
          </p>
        </Section>

        <Section propId="cauldron">
          <p>{puzzles.cauldron.clue}</p>
          <p className="text-rune-400">Answer: {puzzles.cauldron.answer}</p>
          <p className="text-xs text-[#7b7490]">Hint: {puzzles.cauldron.hint}</p>
        </Section>

        <Section propId="gargoyle">
          <p>{puzzles.gargoyle.scenario}</p>
          <ul className="pl-4 text-xs">
            {puzzles.gargoyle.options.map((option, index) => (
              <li
                key={option}
                className={index === puzzles.gargoyle.correctIndex ? 'text-rune-400' : undefined}
              >
                [{index + 1}] {option}
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#7b7490]">{puzzles.gargoyle.explanation}</p>
        </Section>
      </div>
    </div>
  );
}
