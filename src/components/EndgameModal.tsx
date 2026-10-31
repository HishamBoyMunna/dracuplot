import { useMemo } from 'react';
import {
  AlertTriangle,
  BookOpenText,
  Clock3,
  DoorOpen,
  FlaskConical,
  KeyRound,
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

/** A single floating Syndicate Key for the victory skyline. */
function FloatingKey({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} opacity="0.9">
      <circle r="3.2" fill="none" stroke="#e6c98a" strokeWidth="1.8" />
      <path d="M3 0h9M9 0v3.4M12.5 0v2.6" stroke="#e6c98a" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

function EndgameArt({ won, accent }: { won: boolean; accent: string }) {
  const frame = 'block w-full';
  const ratio = { aspectRatio: '800 / 170' };

  if (won) {
    return (
      <div className="relative">
        <svg viewBox="0 0 800 170" className={frame} style={ratio} role="presentation">
          <defs>
            <linearGradient id="bm-dawn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070a12" />
              <stop offset="55%" stopColor="#141725" />
              <stop offset="100%" stopColor="#26141b" />
            </linearGradient>
            <radialGradient id="bm-bat" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#e4f1ff" stopOpacity="0.8" />
              <stop offset="55%" stopColor="#9fc6ec" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#9fc6ec" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bm-exit" cx="50%" cy="78%">
              <stop offset="0%" stopColor="#ffe7b8" stopOpacity="0.85" />
              <stop offset="48%" stopColor="#d32035" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#d32035" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bm-sign" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a0b11" />
              <stop offset="100%" stopColor="#12060a" />
            </linearGradient>
          </defs>

          <rect width="800" height="170" fill="url(#bm-dawn)" />

          {/* Bat signal over the Gotham skyline */}
          <circle cx="646" cy="40" r="42" fill="url(#bm-bat)" />
          <ellipse cx="646" cy="40" rx="18" ry="9" fill="#dbeaff" opacity="0.55" />
          <path
            d="M634 41l4-5 4 4 4-4 4 5-4 2 2 4-6-2-6 2 2-4Z"
            fill="#0a0d16"
            opacity="0.9"
          />

          {/* Far skyline */}
          <g fill="#0b0d16">
            {[
              [20, 78, 54, 92],
              [78, 96, 42, 74],
              [124, 60, 34, 110],
              [162, 88, 58, 82],
              [486, 82, 46, 88],
              [536, 64, 38, 106],
              [578, 92, 54, 78],
              [684, 72, 48, 98],
              [736, 96, 44, 74],
            ].map(([x, y, width, height]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} />
            ))}
            {/* Rooftop antennas and water tower */}
            <rect x="138" y="46" width="3" height="16" />
            <rect x="548" y="52" width="3" height="14" />
            <rect x="706" y="58" width="3" height="16" />
            <circle cx="188" cy="78" r="7" />
            <rect x="183" y="84" width="10" height="6" />
          </g>

          {/* Lit windows */}
          <g fill="#b39660" opacity="0.45">
            {[
              [30, 88], [46, 88], [62, 100], [92, 106], [108, 106], [134, 72],
              [174, 98], [190, 98], [500, 94], [548, 76], [590, 102], [606, 102],
              [696, 84], [712, 84], [748, 106],
            ].map(([x, y]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="4" height="6" />
            ))}
          </g>

          {/* Neon: Black Mask Club */}
          <g transform="translate(58 30)">
            <rect width="112" height="21" fill="url(#bm-sign)" stroke="#5e0c18" strokeWidth="1.5" />
            <text
              x="56"
              y="14"
              textAnchor="middle"
              fontFamily="'Bebas Neue', 'Oswald', sans-serif"
              fontSize="11"
              letterSpacing="1.6"
              fill="#ff4a5c"
              opacity="0.9"
            >
              BLACK MASK CLUB
            </text>
          </g>

          {/* Rain over Gotham */}
          <g stroke="#cfe2f5" strokeWidth="1" opacity="0.14">
            {Array.from({ length: 26 }, (_, index) => {
              const x = 8 + index * 31;
              return <path key={index} d={`M${x} 0l-5 22`} />;
            })}
          </g>

          <ellipse cx="400" cy="130" rx="260" ry="84" fill="url(#bm-exit)" />

          {/* Fire exit, thrown open */}
          <path
            d="M330 170 L330 92 Q400 54 470 92 L470 170 Z"
            fill="none"
            stroke="#3d414b"
            strokeWidth="10"
          />
          <path d="M344 170 L344 98 Q400 66 456 98 L456 170 Z" fill="#ffe7b8" opacity="0.16" />
          <path d="M456 98 L484 112 L484 170 L456 170 Z" fill="#1b1d24" opacity="0.85" />

          {/* Batman walking out of the deathtrap */}
          <ellipse cx="400" cy="158" rx="20" ry="5" fill="#000" opacity="0.6" />
          {/* Cape */}
          <path d="M382 124c8-5 28-5 36 0l9 34h-54Z" fill="#080b12" />
          {/* Torso */}
          <path d="M391 119c6-3 12-3 18 0l4 24h-26Z" fill="#141a26" />
          {/* Utility belt */}
          <rect x="391" y="132" width="18" height="3.4" fill="#b39660" />
          <rect x="398.4" y="132" width="3.2" height="3.4" fill="#e6c98a" />
          {/* Cowl */}
          <circle cx="400" cy="111" r="8" fill="#0e131d" stroke="#2c3546" strokeWidth="1" />
          {/* Ears */}
          <path d="M393.6 104.4l2-7 4 6.2ZM406.4 104.4l-2-7-4 6.2Z" fill="#0b0f17" />
          {/* Eye slits */}
          <path d="M396.2 111h4M403.8 111h-4" stroke="#dff1ff" strokeWidth="1.5" strokeLinecap="round" />
          {/* Chest emblem */}
          <path
            d="M400 124.6l-2.6-1.6-2.2.6 1 1.3-1 1.2 2.4-.8 2.4 1.6 2.4-1.6 2.4.8-1-1.2 1-1.3-2.2-.6Z"
            fill="#d8c18c"
            opacity="0.92"
          />

          {/* Six stolen keys drifting free */}
          <FloatingKey x={148} y={28} rotate={-18} />
          <FloatingKey x={222} y={44} rotate={12} />
          <FloatingKey x={286} y={24} rotate={-6} />
          <FloatingKey x={514} y={26} rotate={10} />
          <FloatingKey x={580} y={44} rotate={-14} />
          <FloatingKey x={652} y={108} rotate={7} />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0c0d11] to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 800 170" className={frame} style={ratio} role="presentation">
        <defs>
          <radialGradient id="bm-dread" cx="50%" cy="58%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.46" />
            <stop offset="52%" stopColor={accent} stopOpacity="0.12" />
            <stop offset="100%" stopColor="#05050a" stopOpacity="0" />
          </radialGradient>
          <filter id="bm-eye-glow" x="-90%" y="-90%" width="280%" height="280%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <rect width="800" height="170" fill="#060609" />
        <rect width="800" height="170" fill="url(#bm-dread)" />

        {/* Alley searchlights raking the frame */}
        <path d="M0 0 L250 170 L0 170Z" fill={accent} opacity="0.07" />
        <path d="M800 0 L550 170 L800 170Z" fill={accent} opacity="0.07" />

        {/* Rain in the red light */}
        <g stroke="#ff8b96" strokeWidth="1" opacity="0.12">
          {Array.from({ length: 24 }, (_, index) => {
            const x = 12 + index * 34;
            return <path key={index} d={`M${x} 0l-6 26`} />;
          })}
        </g>

        {/* Black Mask himself */}
        <path
          d="M400 8C478 8 522 58 522 110c0 32-24 52-48 68-18 12-26 26-28 46H354c-2-20-10-34-28-46-24-16-48-36-48-68C278 58 322 8 400 8Z"
          fill="#101116"
          stroke="#4a0d16"
          strokeWidth="2"
        />
        <path
          d="M296 100c10-44 50-74 96-80"
          stroke="#6b707a"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.42"
        />
        <path
          d="M516 96c-4 34-22 56-42 72"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Hollow sockets */}
        <ellipse cx="344" cy="88" rx="42" ry="25" transform="rotate(-7 344 88)" fill="#030304" />
        <ellipse cx="456" cy="88" rx="42" ry="25" transform="rotate(7 456 88)" fill="#030304" />
        <ellipse
          cx="344"
          cy="88"
          rx="34"
          ry="21"
          transform="rotate(-7 344 88)"
          fill={accent}
          opacity="0.4"
          filter="url(#bm-eye-glow)"
        />
        <ellipse
          cx="456"
          cy="88"
          rx="34"
          ry="21"
          transform="rotate(7 456 88)"
          fill={accent}
          opacity="0.4"
          filter="url(#bm-eye-glow)"
        />
        <ellipse cx="344" cy="88" rx="15" ry="8" transform="rotate(-7 344 88)" fill="#ff4a5c" />
        <ellipse cx="456" cy="88" rx="15" ry="8" transform="rotate(7 456 88)" fill="#ff4a5c" />
        <ellipse cx="344" cy="88" rx="5" ry="3" fill="#ffe9eb" opacity="0.9" />
        <ellipse cx="456" cy="88" rx="5" ry="3" fill="#ffe9eb" opacity="0.9" />

        {/* Nasal cavity */}
        <path d="M400 112l-14 26h28Z" fill="#030304" />

        {/* Steel grin */}
        <path
          d="M354 152c18-8 74-8 92 0l-6 20c-16 7-64 7-80 0Z"
          fill="#030304"
          stroke="#3a3d44"
          strokeWidth="1.5"
        />
        <path
          d="M368 150v20M383 148v23M400 147v24M417 148v23M432 150v20"
          stroke="#8b909a"
          strokeWidth="1.5"
          opacity="0.7"
        />

        {/* Cracks through the mask */}
        <path
          d="M400 8l-3 16 7 11M522 102l-14 6 3 10M278 102l14 7-3 10"
          stroke="#5c606a"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Tally slashes raking both edges */}
        {[0, 1, 2].map((index) => (
          <g key={index}>
            <path
              d={`M${62 + index * 34} 4 Q${108 + index * 34} 86 ${52 + index * 34} 166`}
              stroke={accent}
              strokeWidth="3"
              fill="none"
              opacity={0.4 - index * 0.09}
            />
            <path
              d={`M${738 - index * 34} 4 Q${692 - index * 34} 86 ${748 - index * 34} 166`}
              stroke={accent}
              strokeWidth="3"
              fill="none"
              opacity={0.4 - index * 0.09}
            />
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0c0d11] to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CaseFileSection({
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

function CaseFileRow({
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
    { label: 'Time on the clock', value: `${minutes}:${String(seconds).padStart(2, '0')}` },
    { label: 'Final heat', value: `${threat.toFixed(0)}%` },
    { label: 'Accuracy', value: accuracy === null ? '—' : `${accuracy}%` },
    { label: 'Hunter', value: villain.name },
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
              style={{ color: won ? '#55d99f' : villain.accentColor }}
            >
              {won ? 'The Dark Knight is out' : 'The trap closes'}
            </p>
            <h2
              className="font-display mt-1.5 text-2xl sm:text-4xl"
              style={{
                color: won ? '#55d99f' : villain.accentColor,
                textShadow: '3px 3px 0 #040306',
              }}
            >
              {won ? 'Batman is out.' : `${villain.name} keeps him.`}
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-sm text-bone-dim italic sm:text-base">
              {won
                ? `Six keys, one sealed gate, and a head full of "${gameData.documentTitle}" that actually got him out.`
                : `The heat maxed out before the sixth key did. ${villain.name} drags Batman back into the dark — but the Case File below is yours to keep.`}
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
            <KeyRound size={12} className="shrink-0 text-brass-lit" />
            {runesCollected}/{totalRunes} Syndicate Keys · {uniqueMistakes.length} distinct concept
            {uniqueMistakes.length === 1 ? '' : 's'} missed across {wrongSubmissions} wrong attempt
            {wrongSubmissions === 1 ? '' : 's'}
          </div>

          {/* ---------------- The Case File ---------------- */}
          <div className="mt-6">
            <div className="rule-orn">
              <h3 className="font-display shrink-0 text-xl text-bone sm:text-2xl">
                The Case File
              </h3>
            </div>
            <p className="mt-1 text-center text-sm text-bone-faint italic">
              Debrief · every concept this rescue tested
            </p>

            {uniqueMistakes.length > 0 && (
              <div className="etch etch-blood etch-flat mt-4 p-3">
                <h4 className="flex items-center gap-2 text-sm tracking-[0.15em] text-blood-glow uppercase">
                  <AlertTriangle size={14} />
                  Review these first
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
              <CaseFileSection propId="bookshelf" missedCount={missedPerProp.bookshelf ?? 0}>
                {puzzles.bookshelf.pairs.map((pair) => (
                  <CaseFileRow
                    key={pair.term}
                    heading={pair.term}
                    body={pair.definition}
                    missed={wasMissed(pair.definition, pair.term)}
                  />
                ))}
              </CaseFileSection>

              <CaseFileSection propId="clock" missedCount={missedPerProp.clock ?? 0}>
                <p className="text-sm text-bone-faint italic">{puzzles.clock.prompt}</p>
                {puzzles.clock.orderedSteps.map((step, index) => (
                  <CaseFileRow
                    key={step}
                    heading={`Step ${index + 1}`}
                    body={step}
                    missed={wasMissed(step)}
                  />
                ))}
              </CaseFileSection>

              <CaseFileSection propId="scale" missedCount={missedPerProp.scale ?? 0}>
                {puzzles.scale.statements.map((statement) => (
                  <CaseFileRow
                    key={statement.text}
                    heading={`${statement.isTrue ? 'TRUE' : 'FALSE'} — ${statement.text}`}
                    body={statement.explanation}
                    missed={wasMissed(statement.explanation, statement.text)}
                  />
                ))}
              </CaseFileSection>

              <CaseFileSection propId="safe" missedCount={missedPerProp.safe ?? 0}>
                {puzzles.safe.questions.map((question, index) => (
                  <CaseFileRow
                    key={question.q}
                    heading={`Q${index + 1}. ${question.q}`}
                    body={`Correct answer: ${question.options[question.correctIndex]}`}
                    missed={wasMissed(question.q)}
                  />
                ))}
              </CaseFileSection>

              <CaseFileSection propId="cauldron" missedCount={missedPerProp.cauldron ?? 0}>
                <CaseFileRow
                  heading={puzzles.cauldron.clue.replace('[BLANK]', puzzles.cauldron.answer.toUpperCase())}
                  body={puzzles.cauldron.hint}
                  missed={wasMissed(puzzles.cauldron.clue.replace('[BLANK]', '______'))}
                />
              </CaseFileSection>

              <CaseFileSection propId="gargoyle" missedCount={missedPerProp.gargoyle ?? 0}>
                <CaseFileRow
                  heading={puzzles.gargoyle.scenario}
                  body={`${puzzles.gargoyle.options[puzzles.gargoyle.correctIndex]} — ${puzzles.gargoyle.explanation}`}
                  missed={wasMissed(puzzles.gargoyle.scenario)}
                />
              </CaseFileSection>
            </div>
          </div>

          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t-2 border-iron-2 p-3 sm:flex-row">
          <button type="button" onClick={onReplay} className="btn flex-1">
            <RotateCcw size={15} />
            Run the Rescue Again
          </button>
          <button type="button" onClick={onNewDocument} className="btn btn-iron flex-1">
            <Upload size={15} />
            Upload a New File
          </button>
        </div>
      </div>
    </div>
  );
}
