import { useId } from 'react';
import { VECTORS } from '../data/blackMask';
import type { VectorId } from '../types/plan';

const LAND =
  'M150 96C196 74 236 86 268 96c32 10 62-4 98 4 44 10 74 32 70 64-4 26 16 42 26 68 12 30-4 56 8 82 12 30-4 58-28 74-22 14-30 42-58 56-32 16-64 8-92 16-34 10-66 2-90-20-22-20-50-26-64-52-14-26-6-58-18-86-12-28-2-58-12-86-10-28-2-60 10-84 8-18 20-28 32-36Z';

const ARKHAM = 'M528 128c20-10 42-2 46 18 4 20-14 34-34 32-18-2-28-16-24-32 2-8 6-14 12-18Z';

const RIVER = 'M118 300c38 20 58 0 88 30 30 30 44 20 80 54 26 24 24 46 36 72';

const ROADS = [
  'M152 158c70 20 110-10 180 20 50 22 70 70 110 92',
  'M172 382c60-30 110-80 160-80s70 30 110 60',
  'M204 118c10 80-10 180 0 300',
  'M352 108c-10 90 10 190 30 330',
];

const LABELS: Array<{ x: number; y: number; text: string; key?: boolean }> = [
  { x: 130, y: 136, text: 'Old Gotham' },
  { x: 258, y: 114, text: 'Park Row' },
  { x: 306, y: 150, text: 'Diamond District' },
  { x: 330, y: 308, text: 'Crime Alley', key: true },
  { x: 148, y: 322, text: 'Burnley' },
  { x: 274, y: 422, text: 'The Narrows' },
  { x: 386, y: 272, text: 'Wayne Tower', key: true },
  { x: 454, y: 502, text: 'Gotham Harbour' },
  { x: 502, y: 208, text: 'Arkham' },
];

export default function GothamMap({
  active,
  onSelect,
}: {
  active: VectorId;
  onSelect: (id: VectorId) => void;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const hatch = `hatch-${uid}`;
  const clip = `clip-${uid}`;

  return (
    <svg
      viewBox="0 0 640 560"
      className="map-svg"
      role="group"
      aria-label="Approach chart of Gotham City with six plotted vectors"
    >
      <defs>
        <pattern id={hatch} width="7" height="7" patternTransform="rotate(38)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(232,226,213,0.16)" strokeWidth="0.6" />
        </pattern>
        <clipPath id={clip}>
          <path d={LAND} />
        </clipPath>
      </defs>

      {/* graticule */}
      <g stroke="rgba(232,226,213,0.07)" strokeWidth="0.6">
        {[80, 160, 240, 320, 400, 480, 560].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="560" />
        ))}
        {[80, 160, 240, 320, 400, 480].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="640" y2={y} />
        ))}
      </g>

      {/* water contours */}
      <g transform="translate(320 280) scale(1.055) translate(-320 -280)">
        <path d={LAND} fill="none" stroke="rgba(232,226,213,0.12)" strokeWidth="0.7" strokeDasharray="4 5" />
      </g>
      <path d={LAND} className="land" />

      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="640" height="560" fill={`url(#${hatch})`} opacity="0.7" />
        {ROADS.map((d) => (
          <path key={d} d={d} className="road" />
        ))}
        <path d={RIVER} fill="none" stroke="#08080a" strokeWidth="17" />
        <path d={RIVER} fill="none" stroke="rgba(232,226,213,0.34)" strokeWidth="0.8" />
        <path d={RIVER} fill="none" stroke="rgba(232,226,213,0.14)" strokeWidth="5" />
      </g>

      <path d={ARKHAM} className="land" />
      <path d="M472 212L526 198" stroke="rgba(232,226,213,0.4)" strokeWidth="0.8" strokeDasharray="3 3" />

      {/* targeting reticle over Wayne Tower */}
      <g className="plot-line">
        <circle cx="386" cy="252" r="62" />
        <circle cx="386" cy="252" r="118" strokeDasharray="2 7" />
        <path d="M386 118v-14M386 400v-14M250 252h-14M536 252h-14" strokeDasharray="0" />
      </g>
      <rect x="382" y="248" width="8" height="8" fill="rgba(232,226,213,0.75)" />

      {LABELS.map((label) => (
        <text
          key={label.text}
          x={label.x}
          y={label.y}
          className={label.key ? 'district district--key' : 'district'}
        >
          {label.text}
        </text>
      ))}

      {/* compass */}
      <g transform="translate(84 470)" stroke="rgba(232,226,213,0.42)" fill="none">
        <circle r="21" strokeWidth="0.8" />
        <circle r="15" strokeWidth="0.5" strokeDasharray="1 4" />
        <path d="M0 -21V21M-21 0H21" strokeWidth="0.5" />
        <path d="M0 -19l5 20-5-4-5 4Z" fill="rgba(232,226,213,0.55)" stroke="none" />
        <text x="0" y="-26" textAnchor="middle" fill="rgba(232,226,213,0.6)" style={{ fontSize: 7, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.2em' }}>
          N
        </text>
      </g>

      {/* plotted vectors */}
      {VECTORS.map((vector) => {
        const selected = vector.id === active;
        return (
          <g
            key={vector.id}
            className="pin"
            data-active={selected}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={`Vector ${vector.code}: ${vector.name}. ${vector.claim}`}
            onClick={() => onSelect(vector.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(vector.id);
              }
            }}
          >
            <circle className="halo" cx={vector.at.x} cy={vector.at.y} r="13" />
            <circle className="hit" cx={vector.at.x} cy={vector.at.y} r="28" />
            <circle className="dot" cx={vector.at.x} cy={vector.at.y} r="5.4" />
            <text x={vector.at.x} y={vector.at.y + 2.7}>
              {vector.code}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
