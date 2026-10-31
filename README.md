# Black Mask: The Anti-Brainrot AI Escape Room

Drop in the PDF you have been avoiding and Black Mask turns it into a Gotham noir top-down
escape room. Six locks guard six Syndicate Keys, every puzzle is generated from your own study
material, and the syndicate heat climbs the whole time. The only way out is actually knowing the
content.

Everything runs client-side: PDF parsing, LLM calls, canvas rendering and audio. There is no
backend.

## Getting started

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production bundle
npm run lint
```

Click **Play the Demo Job** to try the pre-built room with no API key. To generate a room from
your own document, open **Syndicate Settings** and add a key for Gemini, any OpenAI-compatible
endpoint (OpenAI, Groq, OpenRouter, Ollama) or Anthropic. Keys live only in your browser's
`localStorage`.

## Pick your hunter

- **Black Mask** — slow heat, but every mistake kills another light.
- **The Penguin** — patient, then a brutal +20% heat spike per wrong answer.
- **Scarecrow** — fast-burning clock and a fear-toxin haze once heat passes 60%.

## Project layout

```text
src/
├── types/game.ts            # Shared interfaces, villain profiles, prop lore
├── data/fallbackData.ts     # Built-in demo room (neural networks / cognitive atrophy)
├── data/roomLayout.ts       # Room geometry, prop boxes, movement constants
├── services/
│   ├── pdfParser.ts         # Browser PDF/TXT/MD text extraction via pdfjs-dist
│   ├── llmService.ts        # Multi-provider LLM adapter + strict schema validation
│   └── soundEngine.ts       # Procedural Web Audio synth (no audio files)
├── components/
│   ├── BlackMaskMark.tsx    # Procedural SVG skull-mask emblem
│   ├── SetupScreen.tsx      # Dropzone, villain picker, API settings, demo launcher
│   ├── TopHud.tsx           # Heat meter, Syndicate Keys, light, mute, Scarecrow haze
│   ├── EscapeRoomCanvas.tsx # 800x600 procedural room, click-to-move, lamp-light
│   ├── EndgameModal.tsx     # Victory / game over + The Case File study review
│   └── puzzles/             # The six puzzle modals and their shared frame
└── App.tsx                  # SETUP -> LOADING -> PLAYING -> WON/LOST state machine
```

See `AGENTS.md` for the full specification and the phased build plan.

## Build phases

- [x] **Phase 1** — Scaffold, PDF parser, multi-LLM pipeline, setup screen
- [x] **Phase 2** — 800x600 top-down canvas, click-to-move, lamp-light
- [x] **Phase 3** — The six interactive puzzle modals
- [x] **Phase 4** — Villain HUD, Web Audio synth, endgame case file

## Tech stack

Vite · React · TypeScript · Tailwind CSS v4 · lucide-react · pdfjs-dist · HTML5 Canvas · Web Audio API
