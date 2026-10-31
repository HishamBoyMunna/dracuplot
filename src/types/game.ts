export type VillainId = 'dracula' | 'werewolf' | 'banshee';

export interface VillainProfile {
  id: VillainId;
  name: string;
  title: string;
  description: string;
  passiveThreatPerSecond: number; // Base % increase per second
  wrongAnswerPenalty: number; // Instant % spike on mistake
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
      clue: string; // Sentence with [BLANK] placeholder
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

export type GamePhase = 'SETUP' | 'LOADING' | 'PLAYING' | 'WON' | 'LOST';

/** A missed concept reported by a puzzle modal, before the prop is attached. */
export interface PuzzleMistake {
  questionContext: string;
  correctTakeaway: string;
}

/** Contract every puzzle modal shares with App's state machine. */
export interface PuzzleModalBaseProps {
  accentColor: string;
  /** Awards the Syndicate Key and closes the modal. */
  onSolve: () => void;
  /** Logs the missed concepts and triggers the villain's penalty exactly once. */
  onMistake: (mistakes: PuzzleMistake[]) => void;
  /** Charges extra threat outside of a wrong answer (the cauldron hint). */
  onThreatCost: (amount: number, reason: string) => void;
  onClose: () => void;
}

export const VILLAINS: Record<VillainId, VillainProfile> = {
  dracula: {
    id: 'dracula',
    name: 'Black Mask',
    title: 'Kingpin of Gotham',
    description:
      'Roman Sionis has Batman chained in a deathtrap under the city — and he is cutting the lights one by one. Every blunder kills another lamp until the cell goes pitch black.',
    passiveThreatPerSecond: 0.25,
    wrongAnswerPenalty: 10,
    specialEffect: "Lights Out: each wrong answer shrinks Batman's light radius by 18px (min 75px).",
    accentColor: '#d32035',
  },
  werewolf: {
    id: 'werewolf',
    name: 'The Penguin',
    title: 'The Gentleman of Crime',
    description:
      'A patient crime lord with an umbrella full of tricks. He gives Batman time to think — then makes an example of him the moment he guesses.',
    passiveThreatPerSecond: 0.18,
    wrongAnswerPenalty: 20,
    specialEffect: 'Umbrella Blitz: a brutal +20% heat spike and a violent screen shake on mistakes.',
    accentColor: '#6fb6d9',
  },
  banshee: {
    id: 'banshee',
    name: 'Scarecrow',
    title: 'The Fearmonger',
    description:
      'Fear gas creeps through the ducts. Mistakes barely sting, but the minutes burn away fast.',
    passiveThreatPerSecond: 0.38,
    wrongAnswerPenalty: 7,
    specialEffect: 'Fear Toxin: above 60% heat a toxic violet haze flickers across the cell.',
    accentColor: '#9b7bea',
  },
};

export const VILLAIN_LIST: VillainProfile[] = [
  VILLAINS.dracula,
  VILLAINS.werewolf,
  VILLAINS.banshee,
];

export const PROP_LORE: Record<PropId, { name: string; lore: string }> = {
  bookshelf: {
    name: 'The Ledger Archive',
    lore: 'The syndicate records are scrambled. Put every term back with its file.',
  },
  clock: {
    name: 'The Vault Clock',
    lore: 'The timeline is out of order. Set the sequence before the vault locks.',
  },
  scale: {
    name: 'The Weighing Table',
    lore: 'Weigh each claim: truth on one pan, fallacy on the other.',
  },
  safe: {
    name: 'The Iron Safe',
    lore: 'Four questions, four digits. The vault respects nothing else.',
  },
  cauldron: {
    name: 'The Chem Vat',
    lore: 'Name the missing term or the vat takes its price.',
  },
  gargoyle: {
    name: 'The Gargoyle Gate',
    lore: "Black Mask's last warden tests whether Batman truly understood.",
  },
};
