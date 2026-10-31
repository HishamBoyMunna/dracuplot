# Black Mask // The Batman Protocol

A Gotham noir fan site built around Roman Sionis. Three acts: the origin of Black Mask, an
interactive 3D Batman target dossier, and a Gemini-powered war room that turns a criminal
objective into a four-phase operation.

> Fictional fan project. Roman Sionis, Batman and Gotham City are property of DC Comics. The
> generated operations are fiction, not real-world guidance.

## What is inside

- **The Origin** — a cinematic hero dossier covering the Sionis inheritance, the fire, the ebony
  coffin mask, and the motive behind Black Mask's war on Batman.
- **The Target** — a procedurally built low-poly Batman rendered with Three.js. Drag to rotate,
  hover or tap a body part, and the seven fault-line dossier updates. Each fault line includes a
  severity score, an observed tell, and the exploit Black Mask would use.
- **The War Room** — choose an objective, a fault line, and a rules-of-engagement intensity. Gemini
  returns a structured four-phase operation with success/exposure estimates, assets, contingencies,
  and an interactive tactical map. A pre-built sample plan works without an API key.

The generated plan is validated client-side before it renders. API keys live only in
`localStorage` and are sent directly to Google.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production bundle
npm run lint
```

To use the live plan generator, open **Gemini Uplink** in the war room and paste a key from
[aistudio.google.com](https://aistudio.google.com/app/apikey). The default model is
`gemini-2.5-flash`. The sample protocol does not require a key.

## Project layout

```text
src/
├── components/
│   ├── Navbar.tsx          # Fixed noir navigation
│   ├── Hero.tsx            # Black Mask origin + motive
│   ├── HeroMask.tsx        # Procedural SVG mask portrait
│   ├── TargetSection.tsx   # Fault-line dossier + 3D stage
│   ├── Batman3D.tsx        # Three.js Batman model, raycasting, highlights
│   ├── PlanGenerator.tsx   # Objective controls + Gemini uplink
│   ├── PlanVisualizer.tsx  # Tactical map, phase dossier, gauges
│   ├── Footer.tsx
│   └── Glyphs.tsx          # Procedural skull/bat marks
├── data/
│   ├── weaknesses.ts       # Seven fault lines and exploit copy
│   └── demoPlan.ts         # No-key sample operation
├── services/geminiPlanner.ts # Gemini request, JSON validation, local config
├── hooks/useScrollReveal.ts
├── types/plan.ts
├── App.tsx
└── index.css               # Tailwind v4 theme + noir component layer
```

## Tech

Vite · React 19 · TypeScript · Tailwind CSS v4 · Three.js · Gemini API · lucide-react
