export function BlackMaskMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" role="presentation">
      <path
        d="M32 5C46 5 54 15 55 29c1 11-3 21-10 27l-13 8-13-8C12 50 8 40 9 29 10 15 18 5 32 5Z"
        fill="currentColor"
      />
      <path
        d="M17 28l12-3-1.7 7.5L18 35Zm30 0-12-3 1.7 7.5L46 35Z"
        fill="#070708"
      />
      <path d="M32 37l3.5 7-3.5 5-3.5-5Z" fill="#070708" opacity="0.8" />
      <path d="M26 52h12" stroke="#070708" strokeWidth="1.3" opacity="0.55" />
    </svg>
  );
}

export function BatGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" className={className} aria-hidden="true" role="presentation">
      <path
        fill="currentColor"
        d="M100 34C122 16 158 15 188 28L186 38Q168 44 160 58Q148 44 138 60Q126 48 116 62Q108 54 104 60ZM100 34C78 16 42 15 12 28L14 38Q32 44 40 58Q52 44 62 60Q74 48 84 62Q92 54 96 60Z"
      />
      <path
        fill="currentColor"
        d="M100 14c5 0 9 4 10 10L111 7l6 25c4 8 4 18-1 26l-8 14-8 12-8-12-8-14c-5-8-5-18-1-26l6-25 1 17c1-6 5-10 10-10Z"
      />
    </svg>
  );
}

export function Reticle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" role="presentation">
      <circle cx="40" cy="40" r="26" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="40" cy="40" r="3" fill="currentColor" />
      <path d="M40 6v14M40 60v14M6 40h14M60 40h14" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
