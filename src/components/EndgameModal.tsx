import { useMemo } from 'react';
import {
  AlertTriangle,
  BookOpenText,
  Clock3,
  DoorOpen,
  FlaskConical,
  Gem,
  Lock,
  RotateCcw,
  Scale,
  Upload,
} from 'lucide-react';
import type { GameData, MistakeLog, PropId, VillainProfile } from '../types/game';
import { PROP_LORE } from '../types/game';

interface EndgameModalProps {
  won: boolean;
  gameData: GameData;
  villain: VillainProfile;
  elapsed: number;
  threat: number;
  runesCollected: number;
  totalRunes: number;
  mistakeLogs: MistakeLog[];
  wrongSubmissions: number;
  onReplay: () => void;
  onNewDocument: () => void;
}

const SECTION_ICONS: Record<PropId, typeof BookOpenText> = {
  bookshelf: BookOpenText,
  clock: Clock3,
  scale: Scale,
  safe: Lock,
  cauldron: FlaskConical,
  gargoyle: DoorOpen,
};

/* ------------------------------------------------------------------ *
 * Procedural artwork — drawn as inline SVG, no image assets
 * ------------------------------------------------------------------ */

function EndgameArt({ won, accent }: { won: boolean; accent: string }) {
  const frame = 'block w-full';
  const ratio = { aspectRatio: '800 / 170' };

  if (won) {
    return (
      <div className="relative">
        <svg viewBox="0 0 800 170" className={frame} style={ratio} role="presentation">
          <defs>
            <linearGradient id="dp-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#090912" />
              <stop offset="100%" stopColor="#16142a" />
            </linearGradient>
            <radialGradient id="dp-spill" cx="50%" cy="62%">
              <stop offset="0%" stopColor="#f8ecc8" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#3ce2c0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3ce2c0" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="800" height="170" fill="url(#dp-sky)" />

          {/* Crescent moon */}
          <circle cx="678" cy="40" r="19" fill="#e8e2cf" opacity="0.85" />
          <circle cx="670" cy="35" r="18" fill="#0b0b16" />

          {/* Distant spires */}
          {[60, 120, 700, 760].map((x) => (
            <path
              key={x}
              d={`M${x - 16} 170 L${x - 16} 96 L${x} 68 L${x + 16} 96 L${x + 16} 170 Z`}
              fill="#0c0c18"
            />
          ))}

          <ellipse cx="400" cy="112" rx="250" ry="86" fill="url(#dp-spill)" />

          {/* Stone archway, thrown open */}
          <path
            d="M296 170 L296 86 Q400 22 504 86 L504 170 Z"
            fill="none"
            stroke="#4b4a56"
            strokeWidth="11"
          />
          <path d="M312 170 L312 94 Q400 40 488 94 L488 170 Z" fill="#f6e8c2" opacity="0.2" />

          {/* Scholar walking out */}
          <ellipse cx="400" cy="156" rx="16" ry="5" fill="#000" opacity="0.5" />
          <ellipse cx="400" cy="136" rx="13" ry="18" fill="#241d38" />
          <circle cx="400" cy="120" r="8.5" fill="#50446f" />
          <circle cx="418" cy="130" r="4" fill="#ffd98a" opacity="0.9" />

          {/* Six claimed runes drifting free */}
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const x = 150 + index * 100;
            const y = index % 2 === 0 ? 30 : 46;
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width="11"
                height="11"
                transform={`rotate(45 ${x + 5.5} ${y + 5.5})`}
                fill="#3ce2c0"
                opacity="0.9"
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#15151f] to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 800 170" className={frame} style={ratio} role="presentation">
        <defs>
          <radialGradient id="dp-dread" cx="50%" cy="58%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
            <stop offset="55%" stopColor={accent} stopOpacity="0.13" />
            <stop offset="100%" stopColor="#05050a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="800" height="170" fill="#07070e" />
        <rect width="800" height="170" fill="url(#dp-dread)" />

        {/* Looming silhouette */}
        <path
          d="M400 170 Q268 170 256 104 Q252 44 400 34 Q548 44 544 104 Q532 170 400 170 Z"
          fill="#0a0a12"
        />
        <path d="M316 58 L292 10 L356 44 Z" fill="#0a0a12" />
        <path d="M484 58 L508 10 L444 44 Z" fill="#0a0a12" />

        {/* Burning eyes */}
        <ellipse cx="356" cy="96" rx="30" ry="18" fill={accent} opacity="0.18" />
        <ellipse cx="444" cy="96" rx="30" ry="18" fill={accent} opacity="0.18" />
        <ellipse cx="356" cy="96" rx="12" ry="6" fill={accent} opacity="0.95" />
        <ellipse cx="444" cy="96" rx="12" ry="6" fill={accent} opacity="0.95" />

        {/* Claw slashes raking both edges */}
        {[0, 1, 2].map((index) => (
          <g key={index}>
            <path
              d={`M${62 + index * 34} 4 Q${108 + index * 34} 86 ${52 + index * 34} 166`}
              stroke={accent}
              strokeWidth="3"
              fill="none"
              opacity={0.38 - index * 0.09}
            />
            <path
              d={`M${738 - index * 34} 4 Q${692 - index * 34} 86 ${748 - index * 34} 166`}
              stroke={accent}
              strokeWidth="3"
              fill="none"
              opacity={0.38 - index * 0.09}
            />
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#15151f] to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function GrimoireSection({
  propId,
  children,
  missedCount,
}: {
  propId: PropId;
  children: React.ReactNode;
  missedCount: number;
}) {
  const Icon = SECTION_ICONS[propId];
  return (
    <section className="etch etch-flat p-3">
      <header className="mb-2.5 flex items-center gap-2.5 border-b border-iron pb-2">
        <Icon size={14} className="shrink-0 text-brass" />
        <h4 className="font-display text-base text-bone">{PROP_LORE[propId].name}</h4>
        {missedCount > 0 && (
          <span className="ml-auto border border-blood px-2 py-0.5 text-[10px] tracking-wider text-blood-glow uppercase">
            {missedCount} missed
          </span>
        )}
      </header>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function GrimoireRow({
  heading,
  body,
  missed,
}: {
  heading: string;
  body: string;
  missed: boolean;
}) {
  return (
    <div
      className={`border-l-[3px] px-3 py-2 ${
        missed ? 'border-l-blood-lit bg-blood/12' : 'border-l-iron-2 bg-ink/50'
      }`}
    >
      <p className="flex items-start gap-2 text-sm font-semibold text-bone">
        {missed && <AlertTriangle size={13} className="mt-1 shrink-0 text-blood-glow" />}
        {heading}
      </p>
      <p className="mt-0.5 text-sm leading-relaxed text-bone-dim">{body}</p>
    </div>
  );
}

export default function EndgameModal({
  won,
  gameData,
  villain,
  elapsed,
  threat,
  runesCollected,
  totalRunes,
  mistakeLogs,
  wrongSubmissions,
  onReplay,
  onNewDocument,
}: EndgameModalProps) {
  const { puzzles } = gameData;

  const missedText = useMemo(
    () => mistakeLogs.map((log) => `${log.questionContext}\u0000${log.correctTakeaway}`).join('\u0001'),
    [mistakeLogs],
  );

  /** A concept counts as missed when it appears in any logged mistake. */
  const wasMissed = (...needles: string[]) =>
    needles.some((needle) => needle.length > 8 && missedText.includes(needle));

  /** The same concept can be missed repeatedly — collapse it into one entry. */
  const uniqueMistakes = useMemo(() => {
    const seen = new Map<string, { log: MistakeLog; count: number }>();
    for (const log of mistakeLogs) {
      const key = `${log.propId}|${log.questionContext}|${log.correctTakeaway}`;
      const existing = seen.get(key);
      if (existing) existing.count += 1;
      else seen.set(key, { log, count: 1 });
    }
    return [...seen.values()];
  }, [mistakeLogs]);

  const missedPerProp = useMemo(() => {
    const counts = {} as Record<PropId, number>;
    for (const { log } of uniqueMistakes) counts[log.propId] = (counts[log.propId] ?? 0) + 1;
    return counts;
  }, [uniqueMistakes]);

  const totalAttempts = runesCollected + wrongSubmissions;
  const accuracy = totalAttempts === 0 ? null : Math.round((runesCollected / totalAttempts) * 100);
  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);

  const stats = [
    { label: 'Time elapsed', value: `${minutes}:${String(seconds).padStart(2, '0')}` },
    { label: 'Final threat', value: `${threat.toFixed(0)}%` },
    { label: 'Accuracy', value: accuracy === null ? '—' : `${accuracy}%` },
    { label: 'Villain faced', value: villain.name },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/92 p-2 sm:p-4">
      <div
        className="etch etch-heavy flex max-h-[94dvh] w-[96vw] max-w-3xl flex-col overflow-hidden"
        style={{
          borderColor: won ? '#1d4b3f' : villain.accentColor,
          outlineColor: won ? 'rgba(79,191,158,0.45)' : `${villain.accentColor}70`,
        }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <EndgameArt won={won} accent={villain.accentColor} />

          <div className="px-4 pb-5 sm:px-7">
          <header className="mt-3 text-center">
            <p
              className="text-[10px] tracking-[0.4em] uppercase"
              style={{ color: won ? '#4fbf9e' : villain.accentColor }}
            >
              {won ? 'Escape achieved' : 'The study keeps you'}
            </p>
            <h2
              className="font-display mt-1.5 text-2xl sm:text-4xl"
              style={{
                color: won ? '#4fbf9e' : villain.accentColor,
                textShadow: '3px 3px 0 #040306',
              }}
            >
              {won ? 'You walked out alive.' : `${villain.name} caught you.`}
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-sm text-bone-dim italic sm:text-base">
              {won
                ? `Six Elder Runes, one sealed door, and a head full of "${gameData.documentTitle}" that you actually understand now.`
                : `The threat meter filled before the sixth rune did. ${villain.title} drags you back into the dark — but the Grimoire below is yours to keep.`}
            </p>
          </header>

          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="etch etch-flat px-3 py-2">
                <dt className="label-etched text-[9px]">{stat.label}</dt>
                <dd className="num mt-1 truncate text-sm font-bold text-bone">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-2.5 flex items-center justify-center gap-2 text-center text-xs text-bone-faint">
            <Gem size={12} className="shrink-0 text-verdigris-lit" />
            {runesCollected}/{totalRunes} Elder Runes · {uniqueMistakes.length} distinct concept
            {uniqueMistakes.length === 1 ? '' : 's'} missed across {wrongSubmissions} wrong attempt
            {wrongSubmissions === 1 ? '' : 's'}
          </div>

          {/* ---------------- The Grimoire ---------------- */}
          <div className="mt-6">
            <div className="rule-orn">
              <h3 className="font-display shrink-0 text-xl text-bone sm:text-2xl">
                The Grimoire of Knowledge
              </h3>
            </div>
            <p className="mt-1 text-center text-sm text-bone-faint italic">
              Post-game study review · everything the room tested you on
            </p>

            {uniqueMistakes.length > 0 && (
              <div className="etch etch-blood etch-flat mt-4 p-3">
                <h4 className="flex items-center gap-2 text-sm tracking-[0.15em] text-blood-glow uppercase">
                  <AlertTriangle size={14} />
                  Revise these first
                </h4>
                <ol className="mt-2.5 space-y-2">
                  {uniqueMistakes.map(({ log, count }, index) => (
                    <li
                      key={`${log.propId}-${index}`}
                      className="border-l-[3px] border-l-blood-lit bg-ink/60 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[10px] tracking-[0.18em] text-blood-glow/85 uppercase">
                          {log.puzzleName}
                        </p>
                        {count > 1 && (
                          <span className="num shrink-0 border border-blood px-1.5 text-[10px] text-blood-glow">
                            ×{count}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-bone">{log.questionContext}</p>
                      <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-verdigris-lit">
                        {log.correctTakeaway}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-4 grid gap-2.5">
              <GrimoireSection propId="bookshelf" missedCount={missedPerProp.bookshelf ?? 0}>
                {puzzles.bookshelf.pairs.map((pair) => (
                  <GrimoireRow
                    key={pair.term}
                    heading={pair.term}
                    body={pair.definition}
                    missed={wasMissed(pair.definition, pair.term)}
                  />
                ))}
              </GrimoireSection>

              <GrimoireSection propId="clock" missedCount={missedPerProp.clock ?? 0}>
                <p className="text-sm text-bone-faint italic">{puzzles.clock.prompt}</p>
                {puzzles.clock.orderedSteps.map((step, index) => (
                  <GrimoireRow
                    key={step}
                    heading={`Step ${index + 1}`}
                    body={step}
                    missed={wasMissed(step)}
                  />
                ))}
              </GrimoireSection>

              <GrimoireSection propId="scale" missedCount={missedPerProp.scale ?? 0}>
                {puzzles.scale.statements.map((statement) => (
                  <GrimoireRow
                    key={statement.text}
                    heading={`${statement.isTrue ? 'TRUE' : 'FALSE'} — ${statement.text}`}
                    body={statement.explanation}
                    missed={wasMissed(statement.explanation, statement.text)}
                  />
                ))}
              </GrimoireSection>

              <GrimoireSection propId="safe" missedCount={missedPerProp.safe ?? 0}>
                {puzzles.safe.questions.map((question, index) => (
                  <GrimoireRow
                    key={question.q}
                    heading={`Q${index + 1}. ${question.q}`}
                    body={`Correct answer: ${question.options[question.correctIndex]}`}
                    missed={wasMissed(question.q)}
                  />
                ))}
              </GrimoireSection>

              <GrimoireSection propId="cauldron" missedCount={missedPerProp.cauldron ?? 0}>
                <GrimoireRow
                  heading={puzzles.cauldron.clue.replace('[BLANK]', puzzles.cauldron.answer.toUpperCase())}
                  body={puzzles.cauldron.hint}
                  missed={wasMissed(puzzles.cauldron.clue.replace('[BLANK]', '______'))}
                />
              </GrimoireSection>

              <GrimoireSection propId="gargoyle" missedCount={missedPerProp.gargoyle ?? 0}>
                <GrimoireRow
                  heading={puzzles.gargoyle.scenario}
                  body={`${puzzles.gargoyle.options[puzzles.gargoyle.correctIndex]} — ${puzzles.gargoyle.explanation}`}
                  missed={wasMissed(puzzles.gargoyle.scenario)}
                />
              </GrimoireSection>
            </div>
          </div>

          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t-2 border-iron-2 p-3 sm:flex-row">
          <button type="button" onClick={onReplay} className="btn flex-1">
            <RotateCcw size={15} />
            Replay Same Study Material
          </button>
          <button type="button" onClick={onNewDocument} className="btn btn-iron flex-1">
            <Upload size={15} />
            Upload New PDF
          </button>
        </div>
      </div>
    </div>
  );
}
