import { useId } from 'react';

interface BlackMaskMarkProps {
  className?: string;
}

/**
 * Roman Sionis' black skull mask, drawn procedurally as inline SVG.
 * Used as the app's masthead emblem and favicon motif — no image assets.
 */
export default function BlackMaskMark({ className = '' }: BlackMaskMarkProps) {
  const uid = useId().replace(/:/g, '');
  const maskId = `bm-mask-${uid}`;
  const eyeId = `bm-eye-${uid}`;
  const glowId = `bm-glow-${uid}`;

  return (
    <svg
      viewBox="0 0 120 150"
      className={className}
      role="presentation"
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id={maskId} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#2b2d34" />
          <stop offset="42%" stopColor="#101116" />
          <stop offset="100%" stopColor="#030304" />
        </linearGradient>
        <radialGradient id={eyeId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff2f3" />
          <stop offset="26%" stopColor="#ff5e6f" />
          <stop offset="70%" stopColor="#d32035" />
          <stop offset="100%" stopColor="#6b0b18" stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>

      {/* Cranium and jaw */}
      <path
        d="M60 5c27 0 45 19 45 47 0 16-6 28-13 39-7 10-11 22-12 35-1 10-8 16-20 16s-19-6-20-16c-1-13-5-25-12-35C21 80 15 68 15 52 15 24 33 5 60 5Z"
        fill={`url(#${maskId})`}
        stroke="#4a4d56"
        strokeWidth="1.6"
      />

      {/* Rim light down the left cheek */}
      <path
        d="M27 42c6-17 20-27 35-28"
        stroke="#666a74"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M95 62c-1 16-6 27-12 36-5 8-8 17-9 27"
        stroke="#d32035"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.42"
      />

      {/* Hollow eye sockets with crimson glow */}
      <ellipse cx="41" cy="57" rx="15" ry="11.5" transform="rotate(-8 41 57)" fill="#040405" />
      <ellipse cx="79" cy="57" rx="15" ry="11.5" transform="rotate(8 79 57)" fill="#040405" />
      <ellipse
        cx="41"
        cy="57"
        rx="13"
        ry="10"
        transform="rotate(-8 41 57)"
        fill={`url(#${eyeId})`}
        opacity="0.55"
        filter={`url(#${glowId})`}
      />
      <ellipse
        cx="79"
        cy="57"
        rx="13"
        ry="10"
        transform="rotate(8 79 57)"
        fill={`url(#${eyeId})`}
        opacity="0.55"
        filter={`url(#${glowId})`}
      />
      <ellipse cx="41" cy="57" rx="6.5" ry="4.5" transform="rotate(-8 41 57)" fill="#ff5e6f" />
      <ellipse cx="79" cy="57" rx="6.5" ry="4.5" transform="rotate(8 79 57)" fill="#ff5e6f" />

      {/* Nasal cavity */}
      <path d="M60 68l-8 17h16Z" fill="#040405" />

      {/* Grinning steel teeth */}
      <path
        d="M39 101c6-5 36-5 42 0l-4 17c-5 5-29 5-34 0Z"
        fill="#040405"
        stroke="#3a3d44"
        strokeWidth="1.2"
      />
      <path
        d="M47 99v18M55 98v19M65 98v19M73 99v18"
        stroke="#6f747e"
        strokeWidth="1.4"
        opacity="0.75"
      />

      {/* Cracks across the porcelain */}
      <path
        d="M60 5l-2 13 5 8M96 55l-8 5 2 7M24 55l8 6-2 7"
        stroke="#5c606a"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
