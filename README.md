# Dracuplot: The Anti-Brainrot AI Escape Room

Drop in the PDF you have been avoiding and Dracuplot turns it into a gothic top-down escape
room. Six relics guard six Elder Runes, every puzzle is generated from your own study material,
and a villain's threat meter climbs the whole time. The only way out is actually knowing the
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

Click **Play Haunted Demo** to try the pre-built room with no API key. To generate a room from
your own document, open **Conjuration Settings** and add a key for Gemini, any OpenAI-compatible
endpoint (OpenAI, Groq, OpenRouter, Ollama) or Anthropic. Keys live only in your browser's
`localStorage`.

## Project layout

```text
src/
├── types/game.ts            # Shared interfaces, villain profiles, prop lore
├── data/fallbackData.ts     # Built-in demo room (neural networks / cognitive atrophy)
├── services/
│   ├── pdfParser.ts         # Browser PDF/TXT/MD text extraction via pdfjs-dist
│   └── llmService.ts        # Multi-provider LLM adapter + strict schema validation
├── components/
│   └── SetupScreen.tsx      # Dropzone, villain picker, API settings, demo launcher
└── App.tsx                  # SETUP -> LOADING -> PLAYING -> WON/LOST state machine
```

See `AGENTS.md` for the full specification and the phased build plan.

## Build phases

- [x] **Phase 1** — Scaffold, PDF parser, multi-LLM pipeline, setup screen
- [ ] **Phase 2** — 800x600 top-down canvas, click-to-move, torchlight
- [ ] **Phase 3** — The six interactive puzzle modals
- [ ] **Phase 4** — Villain HUD, Web Audio synth, endgame grimoire

## Tech stack

Vite · React · TypeScript · Tailwind CSS v4 · lucide-react · pdfjs-dist · HTML5 Canvas · Web Audio API
