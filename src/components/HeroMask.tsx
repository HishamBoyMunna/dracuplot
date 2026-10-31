export default function HeroMask() {
  return (
    <div className="hero-mask-wrap relative mx-auto w-full max-w-[540px] select-none">
      <div className="hero-mask-glow" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

      <div className="absolute left-0 top-10 z-20 hidden flex-col gap-1 sm:flex">
        <span className="eyebrow text-bone-faint">SUBJECT</span>
        <span className="font-mono text-[11px] tracking-[0.16em] text-bone">
          SIONIS, ROMAN
        </span>
        <span className="mt-2 h-px w-16 bg-blood" />
      </div>

      <div className="absolute right-0 top-24 z-20 hidden flex-col items-end gap-1 sm:flex">
        <span className="eyebrow text-bone-faint">STATUS</span>
        <span className="font-mono text-[11px] tracking-[0.16em] text-blood-glow">
          AT LARGE
        </span>
      </div>

      <div className="absolute bottom-20 left-0 z-20 hidden flex-col gap-1 sm:flex">
        <span className="eyebrow text-bone-faint">MATERIAL</span>
        <span className="font-mono text-[11px] tracking-[0.16em] text-bone">
          EBONY / COFFIN WOOD
        </span>
      </div>

      <div className="absolute right-0 bottom-28 z-20 hidden flex-col items-end gap-1 sm:flex">
        <span className="eyebrow text-bone-faint">THREAT INDEX</span>
        <span className="font-display text-3xl leading-none text-bone">
          09<span className="text-blood">.</span>7
        </span>
      </div>

      <svg
        viewBox="0 0 560 780"
        className="hero-mask-art relative z-10 w-full"
        role="img"
        aria-label="A gothic illustration of Black Mask's ebony skull mask with burning red eye holes"
      >
        <defs>
          <radialGradient id="mask-aura" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#e01b36" stopOpacity="0.2" />
            <stop offset="55%" stopColor="#9d1024" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#060607" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mask-ebony" x1="0.1" y1="0" x2="0.92" y2="1">
            <stop offset="0%" stopColor="#6e686d" />
            <stop offset="12%" stopColor="#35333a" />
            <stop offset="38%" stopColor="#1c1b20" />
            <stop offset="68%" stopColor="#111115" />
            <stop offset="88%" stopColor="#18171b" />
            <stop offset="100%" stopColor="#37333a" />
          </linearGradient>
          <linearGradient id="mask-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ded6cb" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#8d8785" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="shoulder-suit" x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#2b2b32" />
            <stop offset="45%" stopColor="#111116" />
            <stop offset="100%" stopColor="#050506" />
          </linearGradient>
          <radialGradient id="eye-fire" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fff3f3" />
            <stop offset="18%" stopColor="#ff6a78" />
            <stop offset="55%" stopColor="#e01b36" />
            <stop offset="100%" stopColor="#7e0818" />
          </radialGradient>
          <filter id="red-bloom" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <clipPath id="mask-clip">
            <path d="M280 88C363 80 421 128 427 207l-7 103c-6 63-34 116-73 157l-67 73-67-73c-39-41-67-94-73-157l-7-103C127 128 197 80 280 88Z" />
          </clipPath>
        </defs>

        <ellipse cx="280" cy="344" rx="260" ry="338" fill="url(#mask-aura)" />

        <g opacity="0.55">
          <path
            d="M48 780V622c0-55 45-100 100-126l89-36 43 72 43-72 89 36c55 26 100 71 100 126v158Z"
            fill="url(#shoulder-suit)"
            stroke="#2d2b30"
            strokeWidth="1"
          />
          <path d="M236 528h88v106h-88Z" fill="#0b0b0e" />
          <path d="M186 780l94-252 43 67-77 185ZM374 780l-94-252-43 67 77 185Z" fill="#15151a" />
          <path d="M280 595v185" stroke="#8f1021" strokeWidth="1" opacity="0.55" />
          <path d="M218 640l-26 140M342 640l26 140" stroke="#2f2d32" />
        </g>

        <g filter="url(#red-bloom)" opacity="0.45">
          <ellipse cx="280" cy="347" rx="173" ry="210" fill="none" stroke="#e01b36" strokeWidth="1.2" />
        </g>

        <g>
          <path
            d="M280 88C363 80 421 128 427 207l-7 103c-6 63-34 116-73 157l-67 73-67-73c-39-41-67-94-73-157l-7-103C127 128 197 80 280 88Z"
            fill="url(#mask-ebony)"
            stroke="#2b292e"
            strokeWidth="3"
          />
          <path
            d="M280 88C363 80 421 128 427 207l-7 103c-6 63-34 116-73 157l-67 73-67-73c-39-41-67-94-73-157l-7-103C127 128 197 80 280 88Z"
            fill="url(#mask-edge)"
            opacity="0.4"
          />
          <path
            d="M134 207l7 103c6 63 34 116 73 157l67 73"
            fill="none"
            stroke="#d7cdc3"
            strokeOpacity="0.3"
            strokeWidth="1.4"
          />
          <path
            d="M426 207l-7 103c-6 63-34 116-73 157l-67 73"
            fill="none"
            stroke="#e01b36"
            strokeOpacity="0.24"
            strokeWidth="1.4"
          />

          <g clipPath="url(#mask-clip)">
            <path
              d="M126 250c71-31 127-21 154 17 27-38 83-48 154-17"
              fill="none"
              stroke="#878183"
              strokeOpacity="0.17"
              strokeWidth="1.5"
            />
            <path
              d="M136 394c48 20 94 8 144 35 50-27 96-15 144-35"
              fill="none"
              stroke="#8d8686"
              strokeOpacity="0.14"
              strokeWidth="1"
            />
            <path
              d="M280 102v436"
              stroke="#9b9290"
              strokeOpacity="0.13"
              strokeWidth="1.3"
            />
            <path
              d="M189 469c25 20 49 31 91 28M371 469c-25 20-49 31-91 28"
              fill="none"
              stroke="#a09a96"
              strokeOpacity="0.16"
            />

            <g stroke="#d7cbc1" strokeOpacity="0.12" strokeWidth="1">
              <path d="M188 503v30M216 516v35M244 524v30M272 528v25M300 528v25M328 524v30M356 516v35M384 503v30" />
            </g>

            <path
              d="M172 228c28-18 66-22 88-1l-7 31c-30-9-54-11-83 1ZM408 228c-28-18-66-22-88-1l7 31c30-9 54-11 83 1Z"
              fill="#040405"
              stroke="#8b8482"
              strokeOpacity="0.22"
            />
          </g>

          <path d="M231 259l-67 2-19 20 74 6 14-24Z" fill="#0a0305" stroke="#720b1a" />
          <path d="M329 259l67 2 19 20-74 6-14-24Z" fill="#0a0305" stroke="#720b1a" />
          <path d="M153 268l60 5-9 20-52-3Z" fill="url(#eye-fire)" filter="url(#red-bloom)" />
          <path d="M407 268l-60 5 9 20 52-3Z" fill="url(#eye-fire)" filter="url(#red-bloom)" />
          <path d="M162 274l44 4-6 9-39-2Z" fill="#ffe3e4" opacity="0.9" />
          <path d="M398 274l-44 4 6 9 39-2Z" fill="#ffe3e4" opacity="0.9" />

          <path d="M280 318l9 34-9 19-9-19Z" fill="#050506" />
          <path d="M250 389c18 7 42 7 60 0" fill="none" stroke="#7b7272" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M263 419c12 5 22 5 34 0M258 441c15 6 29 6 44 0M266 463c9 4 19 4 28 0" fill="none" stroke="#857b79" strokeOpacity="0.32" strokeWidth="1.4" />

          <g fill="none" stroke="#aaa09a" strokeOpacity="0.28">
            <circle cx="145" cy="307" r="4" />
            <circle cx="415" cy="307" r="4" />
            <circle cx="155" cy="451" r="3" />
            <circle cx="405" cy="451" r="3" />
          </g>
          <path d="M145 307h-15M415 307h15M155 451h-13M405 451h13" stroke="#8e8581" strokeOpacity="0.35" />

          <path
            d="M280 88C363 80 421 128 427 207l-7 103c-6 63-34 116-73 157l-67 73-67-73c-39-41-67-94-73-157l-7-103C127 128 197 80 280 88Z"
            fill="none"
            stroke="#b3aaa2"
            strokeOpacity="0.2"
            strokeWidth="1"
          />
        </g>

        <g filter="url(#soft-glow)" opacity="0.3">
          <path d="M172 228c28-18 66-22 88-1" stroke="#ff4a5c" strokeWidth="2" fill="none" />
          <path d="M388 228c-28-18-66-22-88-1" stroke="#ff4a5c" strokeWidth="2" fill="none" />
        </g>
      </svg>

      <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.34em] text-bone-faint">
        NO FACE / NO MERCY
      </div>
    </div>
  );
}
