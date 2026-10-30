# Dracuplot: The Anti-Brainrot AI Escape Room

**Project Specification & OpenCode Build Guide**

---

## PART 1: How to Use OpenCode to Build This Game

OpenCode automatically reads a file named `AGENTS.md` in the root of your project directory to understand your architecture, coding conventions, and rules. By saving this file as `AGENTS.md`, OpenCode will have the entire blueprint and Git workflow in memory at all times.

### Step 1: Set Up Your Project Folder & Git Repository
Open your terminal and run the following commands to create your `Dracuplot` workspace and initialize your Git branches (`main` for active building and `prod` for the latest working version):

```bash
mkdir Dracuplot
cd Dracuplot
git init -b main
```

Save this entire markdown file inside `Dracuplot/` as **`AGENTS.md`**, then create your initial baseline commit and `prod` branch:

```bash
git add AGENTS.md
git commit -m "chore: initial Dracuplot AGENTS.md specification"
git branch prod
```

### Step 2: Launch OpenCode
Start OpenCode in your terminal from inside the `Dracuplot/` directory:

```bash
opencode
```

*(Tip: If you haven't connected a coding model inside OpenCode yet, run `/connect` or `/models` inside the OpenCode TUI to select your coding LLM, such as Claude Sonnet, Gemini 2.5 Pro, or GPT-4o).*

### Step 3: Use the "Plan -> Build -> Verify -> Promote to `prod`" Loop
Do **not** ask OpenCode to build the entire game in a single prompt. Instead, scroll down to **Part 6 of this file** and copy-paste **Phase 1, Phase 2, Phase 3, and Phase 4** one at a time.

1. **Tab Key (Plan vs. Build Mode)**:
   * Press `Tab` in OpenCode to switch between **Plan** mode (read-only architecting) and **Build** mode (writes files and runs terminal commands).
   * Start in **Build** mode and paste **Phase 1**.
2. **Reference the Spec**:
   * In each prompt, reference `@AGENTS.md` so OpenCode strictly follows the TypeScript interfaces, JSON schemas, and Git rules defined below.
3. **Test Between Phases**:
   * Keep a second terminal tab open running `npm run dev`.
   * After OpenCode finishes a phase, test it in your browser at `http://localhost:5173`. If there is a TypeScript or runtime error, copy the terminal/console error and paste it directly into OpenCode—it will fix it immediately.
4. **Revert Anytime with Git or `/undo`**:
   * **Quick Undo in OpenCode**: Type `/undo` in the OpenCode prompt to revert the last AI file edit.
   * **Instant Rollback to `prod`**: Because every verified phase is promoted to the `prod` branch, if a new change ever breaks the app, you can tell OpenCode: *"Revert the working tree back to the `prod` branch"* (or run `git reset --hard prod` in your terminal) to restore your latest 100% working version immediately.

---

## PART 2: Project Architecture, Git Workflow & Tech Stack (Rules for OpenCode)

You are building **Dracuplot**, a browser-based 2D top-down Halloween escape room game designed to fight "AI brainrot" by turning passive PDF study material into an active, high-stakes survival puzzle game.

### Git Workflow & `prod` Branch Rules (CRITICAL FOR OPENCODE)
1. **Branch Structure**:
   * `main`: Active development branch where each phase and feature is implemented.
   * `prod`: Stable production branch that **always** points to the latest verified, working build of **Dracuplot**.
2. **Proper `.gitignore`**:
   * Ensure `.gitignore` includes `node_modules/`, `dist/`, `.env`, `.env.*`, and `.DS_Store` before staging files.
3. **End-of-Phase Commit & `prod` Promotion**:
   * At the end of every phase (ONLY after `npm run build` succeeds with zero TypeScript or bundler errors), OpenCode must:
     1. Stage and commit all changes on `main` with a descriptive commit message (e.g., `git add -A && git commit -m "feat(phase-1): scaffold Dracuplot, PDF parser, and LLM service"`).
     2. Promote the verified commit to the `prod` branch without disrupting the running dev server using:
        ```bash
        git branch -f prod main
        ```
4. **Emergency Recovery**:
   * If asked to revert or recover from a broken state, run `git reset --hard prod && git clean -fd` on `main` to restore the exact state of the `prod` branch.

### Tech Stack Constraints
- **Framework**: Vite + React 18 + TypeScript (`npm create vite@latest . -- --template react-ts`)
- **Styling**: Tailwind CSS + `lucide-react` for horror/gothic icons.
- **PDF Parsing**: `pdfjs-dist` (pure browser-side text extraction; configure worker via CDN or Vite `?url` import so it works out of the box without backend dependencies).
- **2D Game Engine**: Native HTML5 `<canvas>` with `requestAnimationFrame`. **Zero external image sprites required**—all floor tiles, gothic furniture, player avatar, rune glow effects, and torchlight lighting must be rendered procedurally via the Canvas 2D Context API.
- **Audio Engine**: Native browser `AudioContext` (Web Audio API) procedural synthesizer for footsteps, puzzle unlock chimes, wrong-answer buzzers, and a rising heartbeat. No external `.mp3` files required.
- **Architecture**: 100% Client-Side SPA (Single Page Application). No backend server required.

### Target Directory Structure
Always maintain this clean modular file structure:
```text
src/
├── types/
│   └── game.ts              # All shared interfaces (GameData, Villain, Props, LLMConfig)
├── data/
│   └── fallbackData.ts      # Built-in Demo Mode JSON (Neural Networks / Biology theme)
├── services/
│   ├── pdfParser.ts         # Browser PDF-to-text extraction via pdfjs-dist
│   ├── llmService.ts        # Multi-provider LLM adapter (Gemini, OpenAI/Groq, Anthropic)
│   └── soundEngine.ts       # Procedural Web Audio API sound effects & heartbeat
├── components/
│   ├── SetupScreen.tsx      # PDF Dropzone, Villain Picker, API Config & "Play Demo" button
│   ├── TopHud.tsx           # Villain Threat Meter bar, Collected Runes (0/6), Torch status
│   ├── EscapeRoomCanvas.tsx # 800x600 2D Top-Down Canvas, Click-to-move, Torchlight mask
│   ├── EndgameModal.tsx     # Victory Escape / Villain Jumpscare + Study Review Sheet
│   └── puzzles/
│       ├── PuzzleModalWrapper.tsx
│       ├── BookshelfModal.tsx   # Mechanic 1: Concept Matching (4 pairs)
│       ├── ClockModal.tsx       # Mechanic 2: Sequence Ordering (4 steps)
│       ├── ScaleModal.tsx       # Mechanic 3: True/False Triage (4 claims)
│       ├── SafeModal.tsx        # Mechanic 4: 4-Digit Keypad (4 MCQs)
│       ├── CauldronModal.tsx    # Mechanic 5: Keyword Recall (Fill-in-the-blank)
│       └── GargoyleModal.tsx    # Mechanic 6: Synthesis Boss Question (Unlocks Exit)
└── App.tsx                  # Main state machine (SETUP -> LOADING -> PLAYING -> WON/LOST)
```

---

## PART 3: TypeScript Interfaces & Strict LLM JSON Schema

All puzzles and LLM responses must strictly adhere to these TypeScript types in `src/types/game.ts`:

```typescript
export type VillainId = 'dracula' | 'werewolf' | 'banshee';

export interface VillainProfile {
  id: VillainId;
  name: string;
  title: string;
  description: string;
  passiveThreatPerSecond: number; // Base % increase per second
  wrongAnswerPenalty: number;     // Instant % spike on mistake
  specialEffect: string;
  accentColor: string;
}

export type PropId = 'bookshelf' | 'clock' | 'scale' | 'safe' | 'cauldron' | 'gargoyle';

export interface GameData {
  documentTitle: string;
  storyIntro: string;
  puzzles: {
    bookshelf: {
      pairs: Array<{ term: string; definition: string }>; // Exactly 4 pairs
    };
    clock: {
      prompt: string;
      orderedSteps: string[]; // Exactly 4 chronological/logical steps in CORRECT order
    };
    scale: {
      statements: Array<{ text: string; isTrue: boolean; explanation: string }>; // Exactly 4 items
    };
    safe: {
      questions: Array<{
        q: string;
        options: [string, string, string, string];
        correctIndex: number; // 0 to 3 (maps to keypad digits 1 to 4)
      }>; // Exactly 4 questions
    };
    cauldron: {
      clue: string;   // Sentence with [BLANK] placeholder
      answer: string; // Single word or short 2-word key term (case-insensitive check)
      hint: string;
    };
    gargoyle: {
      scenario: string;
      options: [string, string, string, string];
      correctIndex: number;
      explanation: string;
    };
  };
}

export type LLMProvider = 'gemini' | 'openai_compatible' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseUrl?: string; // Used for OpenAI/Groq/OpenRouter/Local Ollama
}

export interface MistakeLog {
  propId: PropId;
  puzzleName: string;
  questionContext: string;
  correctTakeaway: string;
}
```

### LLM System Prompt (Use in `src/services/llmService.ts`)
When sending extracted PDF text (truncate extracted text to the first `35,000` characters to fit all provider limits cleanly), use this exact prompt structure:

```text
You are the Game Master of Dracuplot, a Gothic Horror Escape Room designed to test deep comprehension of study material.
Analyze the provided study text and generate a complete 6-puzzle escape room dataset.

CRITICAL RULES:
1. Return ONLY raw, valid JSON matching the exact schema requested. Do not wrap in markdown code blocks if possible.
2. Every single puzzle MUST test real factual concepts, definitions, processes, or applications directly from the provided study text.
3. "bookshelf.pairs" must contain EXACTLY 4 distinct term/definition pairs.
4. "clock.orderedSteps" must contain EXACTLY 4 sequential steps, phases, or chronological events in their TRUE order.
5. "scale.statements" must contain EXACTLY 4 statements (mix of true and false misconceptions).
6. "safe.questions" must contain EXACTLY 4 multiple-choice questions, each with 4 options and a correctIndex (0-3).
7. "cauldron" must have a clue with "[BLANK]" and a single critical keyword as "answer".
8. "gargoyle" is the final boss door: create a challenging applied scenario question synthesizing the main theme of the text.
```

### Multi-Provider API Details
1. **Gemini Free API (Default)**:
   * Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
   * Default model: `gemini-2.5-flash`
   * Payload config: `generationConfig: { responseMimeType: "application/json" }`
2. **OpenAI / Groq / OpenRouter Compatible**:
   * Default Base URL: `https://api.openai.com/v1` (allow user to change to `https://api.groq.com/openai/v1` or `https://openrouter.ai/api/v1`).
   * Endpoint: `${baseUrl}/chat/completions`
   * Payload config: `response_format: { type: "json_object" }`
3. **Anthropic (Claude)**:
   * Endpoint: `https://api.anthropic.com/v1/messages`
   * Headers: `x-api-key`, `anthropic-version: 2023-06-01`, `anthropic-dangerous-direct-browser-access: true`

---

## PART 4: Villain Profiles & Threat Mechanics

The **Villain Threat Meter** runs from `0%` to `100%`. When it reaches `100%`, the villain catches the player and triggers the Game Over screen.
- Pause the passive threat timer ONLY when the game is over (`WON` or `LOST`). Keep it ticking while puzzle modals are open to create real escape-room urgency!

| Villain | Passive Tick | Mistake Penalty | Unique Gameplay Modifier |
| :--- | :--- | :--- | :--- |
| **Count Dracula** (*The Mind Drainer*) | `+0.25% / sec` (~6.5 mins max) | `+10% Threat` | **Blood Eclipse**: Every wrong answer permanently shrinks the player's canvas torchlight radius by `18px` (minimum `75px`). |
| **The Werewolf** (*The Relentless Hunter*) | `+0.18% / sec` (~9 mins max) | `+20% Threat` | **Bloodlust Lunge**: Slow passive stalker, but punishes guessing brutally with a massive `+20%` jump and screen shake. |
| **The Banshee** (*The Time Wraith*) | `+0.38% / sec` (~4.3 mins max) | `+7% Threat` | **Spectral Haunt**: Fast passive tick; when threat exceeds `60%`, a creepy pulsing violet/red vignette flickers over the screen. |

---

## PART 5: 2D Top-Down Canvas Map & 6 Props Specification

The `<canvas>` has a fixed logical resolution of **`800x600`** (scaled responsively via CSS).

### Movement & Interaction Loop
- **Click-to-Move**: Clicking anywhere on the canvas sets `targetX, targetY`. If the user clicks inside a Prop's bounding box, set the target to the interaction point just in front of that prop and mark it as `pendingProp`.
- **Interpolation**: The player avatar moves toward `(targetX, targetY)` at `220px / second`.
- **Auto-Open Modal**: When the player gets within `45px` of `pendingProp`, stop movement and open that prop's Puzzle Modal.
- **Gargoyle Door Lock**: Props 1–5 (`bookshelf`, `clock`, `scale`, `safe`, `cauldron`) can be solved in any order. Each awards **1 Elder Rune** (`5` total). The `gargoyle` exit door can only be attempted once the player holds all `5` runes; solving the Gargoyle awards the **6th Elder Rune** and immediately triggers the **Escape Victory**.

### Procedural Room Layout (800x600 Coordinates)
Draw a gothic stone tile grid (`40x40px` tiles with alternating dark slate colors `#181824` and `#14141f`), a thick stone wall perimeter (`24px`), and procedural top-down illustrations for the 6 props:

1. **The Cursed Bookshelf (`bookshelf`)**
   * **Position**: Top-Left wall (`x: 60, y: 30, width: 150, height: 45`)
   * **Visual**: Dark mahogany rectangle with colorful vertical book spine stripes.
   * **Mechanic**: Click a Term on the left, then click the matching Definition on the right. Correct pairs lock in green; a wrong pair triggers the Villain Penalty.
2. **The Grandfather Clock (`clock`)**
   * **Position**: Top-Right wall (`x: 590, y: 30, width: 80, height: 55`)
   * **Visual**: Ornate brass & wood clock face with Roman numerals and pendulum glow.
   * **Mechanic**: Display the 4 shuffled steps from `clock.orderedSteps`. Provide Up/Down arrow buttons (or click-to-order slots) and a "Strike the Chime (Submit)" button.
3. **The Alchemist's Scale (`scale`)**
   * **Position**: Left-Center table (`x: 50, y: 260, width: 95, height: 110`)
   * **Visual**: Alchemy desk with twin golden balance pans and glowing vials.
   * **Mechanic**: Show the 4 statements from `scale.statements`, each with `[TRUTH]` and `[FALLACY]` toggle buttons. Clicking "Weigh Souls (Submit)" checks all 4 at once.
4. **The Iron Safe (`safe`)**
   * **Position**: Right-Center alcove (`x: 655, y: 260, width: 95, height: 100`)
   * **Visual**: Heavy riveted steel vault with a gold dial.
   * **Mechanic**: Display the 4 multiple-choice questions (numbered Q1 to Q4, options `[1]`, `[2]`, `[3]`, `[4]`). On the right side of the modal, render a tactile 4-digit numeric keypad (`1-9, 0, Clear, Unlock`). Entering the 4 correct option numbers (`correctIndex + 1`) unlocks the safe!
5. **The Ritual Cauldron (`cauldron`)**
   * **Position**: Center of the Study (`x: 355, y: 255, width: 90, height: 90`)
   * **Visual**: Circular iron cauldron with bubbling neon-green concentric rings and animated particles.
   * **Mechanic**: Display `cauldron.clue` with a glowing input box for the `[BLANK]` keyword, a "Reveal Hint" button (costs `+4%` threat), and a "Cast Incantation" submit button. Checks case-insensitively with trimmed whitespace (also accept if user's input is a close substring match of at least 4 characters).
6. **The Gargoyle Exit Door (`gargoyle`)**
   * **Position**: Bottom-Center wall (`x: 330, y: 535, width: 140, height: 55`)
   * **Visual**: Heavy double iron doors flanked by two horned stone gargoyles and 5 glowing rune sockets.
   * **Mechanic**: If `< 5` runes are solved, display a spooky toast message: *"The Gargoyle's jaws remain sealed. Collect all 5 Elder Runes from the study first!"* Once 5 runes are collected, open the final synthesis boss question modal.

### Torchlight & Solved Aura Effect
- Draw the room and furniture first.
- Draw a glowing emerald/cyan aura ring around any solved prop, and a pulsing amber beacon around unsolved props.
- Overlay a full-canvas darkness layer using `ctx.createRadialGradient(player.x, player.y, 20, player.x, player.y, torchRadius)` transitioning from `rgba(0,0,0,0)` at the center to `rgba(5, 5, 10, 0.94)` outside the torch radius.
- Render floating label badges above each prop when the cursor hovers over it or when the player is nearby.

---

## PART 6: Copy-Paste Phased Prompts for OpenCode

Copy and paste these prompts **one by one** into OpenCode after saving this file as `AGENTS.md`.

---

### PHASE 1 PROMPT (Scaffold, PDF Parser, Multi-LLM Pipeline & Git Init)
> Read `@AGENTS.md` carefully. Let's execute **Phase 1** for **Dracuplot**:
> 1. Ensure Git is initialized with a `main` branch, a `prod` branch, and a clean `.gitignore` (`node_modules/`, `dist/`, `.env*`).
> 2. Initialize the Vite + React + TypeScript project with Tailwind CSS and `lucide-react`, and install `pdfjs-dist`. Set the page title to **Dracuplot: The Anti-Brainrot AI Escape Room**.
> 3. Create `src/types/game.ts` with all interfaces defined in `@AGENTS.md`.
> 4. Create `src/data/fallbackData.ts` containing a rich, entertaining pre-built `GameData` object about "The Architecture of Artificial Neural Networks & Preventing AI Cognitive Atrophy" so we can test and demo **Dracuplot** immediately without an API call.
> 5. Create `src/services/pdfParser.ts` using `pdfjs-dist` to extract plain text from an uploaded `.pdf` file in the browser. Configure the PDF.js worker cleanly via CDN (`https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`) so there are zero bundler issues. Also allow pasting raw study text or uploading `.txt`/`.md` files as a backup.
> 6. Create `src/services/llmService.ts` supporting Gemini Free API (`gemini-2.5-flash` as default), OpenAI/Groq/OpenRouter compatible endpoints, and Anthropic, enforcing the strict JSON schema in `@AGENTS.md`. Save user API settings in `localStorage`.
> 7. Build `src/components/SetupScreen.tsx` branded as **Dracuplot** with a Gothic Halloween aesthetic: PDF drag-and-drop zone, Villain selector cards (Dracula, Werewolf, Banshee with their stats), collapsible LLM Provider/API Key settings modal, a "Summon the Escape Room (Generate from PDF)" button, and an instant "Play Haunted Demo (No API Key Needed)" button.
> 8. Wire `App.tsx` so generating or clicking Demo transitions to a debug preview of the loaded `GameData` (we will replace the debug view with the 2D Canvas in Phase 2).
> 9. Verify that `npm run build` succeeds with zero TypeScript errors, commit all changes to `main` (`feat(phase-1): scaffold Dracuplot, PDF parser, and LLM pipeline`), and update the `prod` branch (`git branch -f prod main`).

---

### PHASE 2 PROMPT (2D Top-Down Canvas Map, Movement & Torchlight)
> Refer to `@AGENTS.md` and let's execute **Phase 2** for **Dracuplot**:
> 1. Build `src/components/EscapeRoomCanvas.tsx` implementing the `800x600` top-down 2D gothic study room using HTML5 `<canvas>` and `requestAnimationFrame`.
> 2. Render procedural stone floor tiles, gothic walls, candlesticks, rugs, and the 6 distinct interactive props (`bookshelf`, `clock`, `scale`, `safe`, `cauldron`, `gargoyle`) at the coordinates specified in `@AGENTS.md`.
> 3. Implement smooth click-to-move player navigation (`220px/sec`), a walk-cycle bobbing animation for the player scholar sprite, click target ripple indicators, and hover tooltips showing each prop's name and solved status.
> 4. Add the dynamic radial gradient torchlight darkness mask centered on the player, respecting the `torchRadius` state (which shrinks when Dracula's penalty triggers).
> 5. When the player clicks a prop and walks within `45px` of it, trigger `onInteractProp(propId)`. If they click `gargoyle` before solving the other 5 props, display an atmospheric in-game warning banner instead.
> 6. Integrate `EscapeRoomCanvas` into `App.tsx` and verify smooth 60fps canvas rendering and click-to-move interaction.
> 7. Run `npm run build` to verify zero TypeScript errors, commit all Phase 2 changes to `main` (`feat(phase-2): add 2D top-down canvas map, click-to-move, and torchlight`), and promote the working build to `prod` (`git branch -f prod main`).

---

### PHASE 3 PROMPT (The 6 Interactive Puzzle Modals)
> Refer to `@AGENTS.md` and let's execute **Phase 3** for **Dracuplot**:
> 1. Create `src/components/puzzles/PuzzleModalWrapper.tsx` with a dark gothic parchment/stone modal frame, header showing the prop's lore title, and close button.
> 2. Build all 6 puzzle modal components in `src/components/puzzles/`:
>    - `BookshelfModal.tsx`: Interactive concept-matching between the 4 shuffled terms and 4 shuffled definitions.
>    - `ClockModal.tsx`: Reordering the 4 shuffled process steps into chronological sequence.
>    - `ScaleModal.tsx`: True/False triage for the 4 statements with instant explanations upon solving.
>    - `SafeModal.tsx`: Shows the 4 multiple-choice questions alongside an interactive 4-digit brass keypad (`1-4` digits corresponding to the 4 answers) with LED/rune indicator lights.
>    - `CauldronModal.tsx`: Fill-in-the-blank incantation input with optional hint button (`+4%` threat cost) and bubbling animation.
>    - `GargoyleModal.tsx`: The final synthesis boss question that unlocks the exit door once the first 5 Elder Runes are collected.
> 3. Connect all 6 modals to `App.tsx`. On a correct completion, mark the prop as solved, award its Elder Rune, and close the modal. On an incorrect submission, log the missed concept to `mistakeLogs`, trigger the active Villain's threat penalty (including Dracula's torchlight reduction), flash the modal red with a shake animation, and allow the player to keep trying.
> 4. Run `npm run build` to verify zero TypeScript errors, commit all Phase 3 changes to `main` (`feat(phase-3): implement 6 interactive study puzzle modals and villain penalties`), and promote the working build to `prod` (`git branch -f prod main`).

---

### PHASE 4 PROMPT (Villain HUD, Web Audio Synth & Endgame Study Report)
> Refer to `@AGENTS.md` and let's execute **Phase 4** to complete the **Dracuplot** hackathon polish:
> 1. Create `src/services/soundEngine.ts` using the browser's native Web Audio API (`AudioContext`) to synthesize:
>    - Soft stone footsteps while walking
>    - Mystical chord chime when earning an Elder Rune
>    - Dissonant horror chord + low rumble on a wrong answer
>    - Keypad button clicks
>    - A dynamic low-frequency heartbeat pulse that speeds up as Villain Threat passes 50% and 75%
>    - Include a Mute/Unmute toggle in the HUD.
> 2. Create `src/components/TopHud.tsx` featuring:
>    - The animated Villain Threat Meter bar (`0%` to `100%`) with the chosen Villain's icon creeping closer to the player scholar icon.
>    - Elder Runes progress tracker (`0/6` glowing runes).
>    - Torchlight percentage indicator and sound mute toggle.
>    - Banshee's flickering screen vignette overlay when threat exceeds `60%`.
> 3. Create `src/components/EndgameModal.tsx` for both the **Escape Victory** and **Villain Caught You (Game Over)** states:
>    - Dramatic thematic artwork/header and survival stats (Time Elapsed, Final Threat %, Accuracy, Villain Faced).
>    - **"The Grimoire of Knowledge (Post-Game Study Review)"**: Display a clean study guide summarizing all concepts from the PDF, specifically highlighting any questions the player got wrong (`mistakeLogs`) so **Dracuplot** genuinely reinforces learning.
>    - Buttons to "Replay Same Study Material" or "Upload New PDF".
> 4. Run `npm run build` and verify there are zero TypeScript or bundling issues. Commit all Phase 4 changes to `main` (`feat(phase-4): add villain HUD, procedural audio synth, and endgame grimoire`), and promote the final release to `prod` (`git branch -f prod main`).