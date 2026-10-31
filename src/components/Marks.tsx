import { useId } from 'react';

/* ------------------------------------------------------------------ *
 * Janus — the two-faced masthead mark.
 * ------------------------------------------------------------------ */

export function JanusMark({ className }: { className?: string }) {
  const face = 'M11.4 3.2C7.6 3.2 5 6 5.2 9.6c.2 2.4 1.8 3 1.4 5-.4 1.8-1.6 2.4-1.2 4 .5 1.8 3.2 2.2 6 2.2';
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d={face} stroke="currentColor" strokeWidth="1.15" strokeLinecap="square" />
      <g transform="translate(24 0) scale(-1 1)">
        <path d={face} stroke="currentColor" strokeWidth="1.15" strokeLinecap="square" />
      </g>
      <path d="M12 2.6v18.8" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * The mask. Two renderings of the same geometry:
 *   solid — black plate on paper, for the dossier
 *   wire  — engraved outline on ink, for the cover
 * ------------------------------------------------------------------ */

const SKULL =
  'M200 26C254 26 292 62 296 118c2 22 10 50 12 68 2 16-8 26-11 40l-5 28c-3 18 8 34 10 60 3 42-44 90-102 90s-105-48-102-90c2-26 13-42 10-60l-5-28c-3-14-13-24-11-40 2-18 10-46 12-68C108 62 146 26 200 26Z';
const EYE_L = 'M136 174c16-8 40-12 56-13l-3 42c-15 7-37 8-50 2Z';
const EYE_R = 'M264 174c-16-8-40-12-56-13l3 42c15 7 37 8 50 2Z';
const NOSE = 'M200 232l-14 52c8 6 20 6 28 0Z';

export function MaskMark({
  variant = 'solid',
  className,
}: {
  variant?: 'solid' | 'wire';
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const plate = `plate-${uid}`;
  const glow = `glow-${uid}`;
  const soft = `soft-${uid}`;

  if (variant === 'wire') {
    return (
      <svg viewBox="0 0 400 440" className={className} role="img" aria-label="Engraved outline of the Black Mask">
        <defs>
          <radialGradient id={glow}>
            <stop offset="0%" stopColor="#ff2b3a" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#b2121b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#b2121b" stopOpacity="0" />
          </radialGradient>
          <filter id={soft} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        {/* construction geometry */}
        <g stroke="#e8e2d5" strokeWidth="0.6" opacity="0.22">
          <circle cx="200" cy="215" r="186" fill="none" strokeDasharray="1 5" />
          <circle cx="200" cy="215" r="150" fill="none" strokeDasharray="1 9" />
          <path d="M8 215h384M200 12v416" strokeDasharray="2 10" />
          <path d="M296 96h58M104 96H46M296 340h40M104 340H64" />
        </g>

        {/* sockets */}
        <ellipse cx="164" cy="186" rx="30" ry="26" fill={`url(#${glow})`} filter={`url(#${soft})`} />
        <ellipse cx="236" cy="186" rx="30" ry="26" fill={`url(#${glow})`} filter={`url(#${soft})`} />

        {/* plate */}
        <path d={SKULL} fill="rgba(232,226,213,0.03)" stroke="#e8e2d5" strokeWidth="1.05" />
        <path d={EYE_L} fill="#08080a" stroke="#e8e2d5" strokeWidth="0.85" />
        <path d={EYE_R} fill="#08080a" stroke="#e8e2d5" strokeWidth="0.85" />
        <path d={NOSE} fill="#08080a" stroke="#e8e2d5" strokeWidth="0.85" />

        {/* jaw structure + cracks */}
        <g stroke="#e8e2d5" strokeWidth="0.6" opacity="0.4" fill="none">
          <path d="M148 336c20 12 84 12 104 0" />
          <path d="M156 354h88M164 372h72" strokeDasharray="3 4" />
          <path d="M296 134l-12 34 6 26" strokeWidth="0.8" />
          <path d="M120 300l14 30-6 34" strokeWidth="0.8" />
        </g>

        {/* registration ticks */}
        <g fill="#b2121b">
          <circle cx="200" cy="26" r="2" />
          <circle cx="200" cy="404" r="2" />
          <circle cx="104" cy="118" r="2" />
          <circle cx="296" cy="118" r="2" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 440" className={className} role="img" aria-label="The Black Mask: ebony skull plate with red eye slits">
      <defs>
        <linearGradient id={plate} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#232327" />
          <stop offset="38%" stopColor="#101013" />
          <stop offset="100%" stopColor="#040405" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor="#ff3a44" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#a50f18" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#a50f18" stopOpacity="0" />
        </radialGradient>
        <filter id={soft} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="164" cy="186" rx="27" ry="21" fill={`url(#${glow})`} filter={`url(#${soft})`} />
      <ellipse cx="236" cy="186" rx="27" ry="21" fill={`url(#${glow})`} filter={`url(#${soft})`} />

      <path d={SKULL} fill={`url(#${plate})`} stroke="#000" strokeWidth="2" />
      <path d={EYE_L} fill="#030304" stroke="#2b2b30" strokeWidth="1" />
      <path d={EYE_R} fill="#030304" stroke="#2b2b30" strokeWidth="1" />
      <path d={NOSE} fill="#020203" stroke="#26262b" strokeWidth="1" />

      {/* specular break along the brow */}
      <path
        d="M126 156c10-46 34-78 62-96"
        stroke="#ffffff"
        strokeOpacity="0.09"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M284 210c-2 22-9 30-11 44l-4 24"
        stroke="#ffffff"
        strokeOpacity="0.07"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* jaw scoring */}
      <g stroke="#e8e2d5" strokeOpacity="0.13" strokeWidth="1">
        <path d="M158 336v44M176 342v50M200 344v54M224 342v50M242 336v44" />
        <path d="M148 332c20 12 84 12 104 0" strokeOpacity="0.22" />
      </g>

      {/* red rim light */}
      <path
        d="M296 118c2 22 10 50 12 68 2 16-8 26-11 40l-5 28c-3 18 8 34 10 60 3 42-44 90-102 90"
        fill="none"
        stroke="#b2121b"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function CrossMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function FileMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 3h10l6 6v12H4V3Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M14 3v6h6M7 13h10M7 17h6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
