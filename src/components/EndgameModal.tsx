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
    <section className="rounded-xl border border-crypt-600/80 bg-crypt-950/50 p-4">
      <header className="mb-3 flex items-center gap-2.5">
        <Icon size={15} className="shrink-0 text-ember-400" />
        <h4 className="text-gothic text-base text-[#ead9b9]">{PROP_LORE[propId].name}</h4>
        {missedCount > 0 && (
          <span className="ml-auto rounded-full bg-blood-500/18 px-2.5 py-0.5 text-[10px] tracking-wider text-blood-400 uppercase">
            {missedCount} missed
          </span>
        )}
      </header>
      <div className="space-y-2">{children}</div>
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
      className={`rounded-lg border px-3.5 py-2.5 ${
        missed ? 'border-blood-500/55 bg-blood-500/10' : 'border-crypt-700/70 bg-crypt-900/40'
      }`}
    >
      <p className="flex items-start gap-2 text-sm font-semibold text-[#d9d5e4]">
        {missed && <AlertTriangle size={13} className="mt-1 shrink-0 text-blood-400" />}
        {heading}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[#9d96b0]">{body}</p>
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
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/90 p-4 py-8 backdrop-blur-md">
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl border-2 shadow-[0_0_110px_rgba(0,0,0,0.95)]"
        style={{
          borderColor: won ? 'rgba(60,226,192,0.6)' : `${villain.accentColor}aa`,
          background: 'linear-gradient(170deg, #15151f 0%, #0c0c15 55%, #110f18 100%)',
        }}
      >
        <EndgameArt won={won} accent={villain.accentColor} />

        <div className="px-6 pb-6 sm:px-8">
          <header className="mt-3 text-center">
            <p
              className="text-[11px] tracking-[0.4em] uppercase"
              style={{ color: won ? '#3ce2c0' : villain.accentColor }}
            >
              {won ? 'Escape achieved' : 'The study keeps you'}
            </p>
            <h2
              className="text-gothic mt-2 text-3xl sm:text-4xl"
              style={{ color: won ? '#3ce2c0' : villain.accentColor }}
            >
              {won ? 'You walked out alive.' : `${villain.name} caught you.`}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[#9d96b0] italic">
              {won
                ? `Six Elder Runes, one sealed door, and a head full of "${gameData.documentTitle}" that you actually understand now.`
                : `The threat meter filled before the sixth rune did. ${villain.title} drags you back into the dark — but the Grimoire below is yours to keep.`}
            </p>
          </header>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-crypt-600 bg-crypt-950/60 px-3.5 py-3"
              >
                <dt className="text-[10px] tracking-[0.18em] text-[#6f6880] uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-[#e6e2ef]">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[#7b7490]">
            <Gem size={13} className="shrink-0 text-rune-400" />
            {runesCollected}/{totalRunes} Elder Runes · {uniqueMistakes.length} distinct concept
            {uniqueMistakes.length === 1 ? '' : 's'} missed across {wrongSubmissions} wrong attempt
            {wrongSubmissions === 1 ? '' : 's'}
          </div>

          {/* ---------------- The Grimoire ---------------- */}
          <div className="mt-8">
            <div className="text-center">
              <h3 className="text-gothic text-2xl text-[#ead9b9]">The Grimoire of Knowledge</h3>
              <p className="mt-1 text-sm text-[#7b7490] italic">
                Post-game study review · everything the room tested you on
              </p>
            </div>

            {uniqueMistakes.length > 0 && (
              <div className="mt-5 rounded-xl border border-blood-500/45 bg-blood-500/8 p-4">
                <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] text-blood-400 uppercase">
                  <AlertTriangle size={15} />
                  Revise these first
                </h4>
                <ol className="mt-3 space-y-2.5">
                  {uniqueMistakes.map(({ log, count }, index) => (
                    <li
                      key={`${log.propId}-${index}`}
                      className="rounded-lg border border-blood-500/30 bg-crypt-950/50 px-3.5 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[10px] tracking-[0.18em] text-blood-400/80 uppercase">
                          {log.puzzleName}
                        </p>
                        {count > 1 && (
                          <span className="shrink-0 rounded-full bg-blood-500/20 px-2 py-0.5 text-[10px] text-blood-400">
                            missed ×{count}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#d9d5e4]">{log.questionContext}</p>
                      <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-rune-400">
                        {log.correctTakeaway}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-5 grid gap-3">
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
                <p className="text-sm text-[#8a83a0] italic">{puzzles.clock.prompt}</p>
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

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={onReplay}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-ember-400/60 bg-ember-400/12 px-4 py-3 font-semibold text-ember-400 transition hover:bg-ember-400/22"
            >
              <RotateCcw size={16} />
              Replay Same Study Material
            </button>
            <button
              type="button"
              onClick={onNewDocument}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-crypt-500 px-4 py-3 font-semibold text-[#b7b1c6] transition hover:border-crypt-400 hover:text-white"
            >
              <Upload size={16} />
              Upload New PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
