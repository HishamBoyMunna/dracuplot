# Batman Trapped: The Anti-Brainrot AI Escape Room

Black Mask has Batman in a deathtrap under Gotham, and the only way out is the PDF you have been
avoiding. Drop in your study material and it becomes a Gotham noir top-down escape room: six locks,
six keys, and a heat meter that climbs the whole time. Guide the Dark Knight through every puzzle
before the trap closes. The only way out is actually knowing the content.

Everything runs client-side: PDF parsing, LLM calls, canvas rendering and audio. There is no
backend.

## Getting started

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production bundle
npm run lint
```

Click **Run the Demo Rescue** to try the pre-built deathtrap with no API key. To generate a rescue
from your own document, open **Syndicate Settings** and add a key for Gemini, any
OpenAI-compatible endpoint (OpenAI, Groq, OpenRouter, Ollama) or Anthropic. Keys live only in your
browser's `localStorage`.

## Choose the hunter

- **Black Mask** — slow heat, but every mistake kills another of Batman's lights.
- **The Penguin** — patient, then a brutal +20% heat spike per wrong answer.
- **Scarecrow** — fast-burning clock and a fear-toxin haze once heat passes 60%.

## Project layout

```text
src/
├── types/game.ts            # Shared interfaces, villain profiles, prop lore
├── data/fallbackData.ts     # Built-in demo deathtrap (neural networks / cognitive atrophy)
├── data/roomLayout.ts       # Room geometry, prop boxes, movement constants
├── services/
│   ├── pdfParser.ts         # Browser PDF/TXT/MD text extraction via pdfjs-dist
│   ├── llmService.ts        # Multi-provider LLM adapter + strict schema validation
│   └── soundEngine.ts       # Procedural Web Audio synth (no audio files)
├── components/
│   ├── BatMark.tsx          # Procedural SVG bat emblem + HUD glyph
│   ├── SetupScreen.tsx      # Dropzone, hunter picker, API settings, demo launcher
│   ├── TopHud.tsx           # Heat meter, keys, light, mute, Scarecrow haze
│   ├── EscapeRoomCanvas.tsx # 800x600 procedural room, click-to-move, bat-light
│   ├── EndgameModal.tsx     # Escape / capture + The Case File study review
│   └── puzzles/             # The six puzzle modals and their shared frame
└── App.tsx                  # SETUP -> LOADING -> PLAYING -> WON/LOST state machine
```

See `AGENTS.md` for the original full specification and phased build plan.

## Build phases

- [x] **Phase 1** — Scaffold, PDF parser, multi-LLM pipeline, setup screen
- [x] **Phase 2** — 800x600 top-down canvas, click-to-move, bat-light
- [x] **Phase 3** — The six interactive puzzle modals
- [x] **Phase 4** — Villain HUD, Web Audio synth, endgame case file
- [x] **Batman Trapped** — Rescue framing, bat emblem, Batman sprite and endgame art

## Tech stack

Vite · React · TypeScript · Tailwind CSS v4 · lucide-react · pdfjs-dist · HTML5 Canvas · Web Audio API
