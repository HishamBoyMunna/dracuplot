import { useId, type CSSProperties } from 'react';

interface BatMarkProps {
  className?: string;
}

/* One half of the bat silhouette — the other is mirrored across x = 100. */
const BAT_WING =
  'M100 34C122 16 158 15 188 28L186 38Q168 44 160 58Q148 44 138 60Q126 48 116 62Q108 54 104 60Z';
const BAT_BODY =
  'M100 14c5 0 9 4 10 10L111 7L117 32c4 8 4 18-1 26L108 72L100 84L92 72L84 58c-5-8-5-18-1-26L89 7L90 24c1-6 5-10 10-10Z';

/**
 * Batman's emblem, drawn procedurally as inline SVG.
 * Used as the app's masthead mark and favicon motif — no image assets.
 */
export default function BatMark({ className = '' }: BatMarkProps) {
  const uid = useId().replace(/:/g, '');
  const steelId = `bat-steel-${uid}`;
  const sheenId = `bat-sheen-${uid}`;

  return (
    <svg
      viewBox="0 0 200 100"
      className={className}
      role="presentation"
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id={steelId} x1="0.15" y1="0" x2="0.55" y2="1">
          <stop offset="0%" stopColor="#5d6778" />
          <stop offset="38%" stopColor="#1e232e" />
          <stop offset="100%" stopColor="#040508" />
        </linearGradient>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a8d2ff" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#a8d2ff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#a8d2ff" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <g fill={`url(#${steelId})`} stroke="#7f8a9c" strokeWidth="1.3" strokeLinejoin="round">
        <path d={BAT_WING} />
        <path d={BAT_WING} transform="translate(200 0) scale(-1 1)" />
        <path d={BAT_BODY} />
      </g>

      {/* Cold rim light tracing the leading edge of each wing */}
      <path
        d="M100 34C122 19 156 18 184 29"
        stroke={`url(#${sheenId})`}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M100 34C78 19 44 18 16 29"
        stroke={`url(#${sheenId})`}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* The cowl's white eye slits */}
      <g fill="#e8f6ff">
        <path d="M91.5 31l5.5 1.1-1 3-5-1.2Z" opacity="0.9" />
        <path d="M108.5 31l-5.5 1.1 1 3 5-1.2Z" opacity="0.9" />
      </g>
    </svg>
  );
}

/** A compact monochrome bat for the HUD rail and inline labels. */
export function BatGlyph({
  size = 16,
  className = '',
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 200 100"
      className={className}
      style={style}
      fill="currentColor"
      role="presentation"
      aria-hidden="true"
    >
      <path d={BAT_WING} />
      <path d={BAT_WING} transform="translate(200 0) scale(-1 1)" />
      <path d={BAT_BODY} />
    </svg>
  );
}
