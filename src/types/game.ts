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

export const VILLAINS: Record<VillainId, VillainProfile> = {
  dracula: {
    id: 'dracula',
    name: 'Count Dracula',
    title: 'The Mind Drainer',
    description:
      'He sips slowly at your focus. Every blunder swallows another ring of torchlight until the study is pitch black.',
    passiveThreatPerSecond: 0.25,
    wrongAnswerPenalty: 10,
    specialEffect: 'Blood Eclipse: each wrong answer shrinks your torchlight by 18px (min 75px).',
    accentColor: '#c2213a',
  },
  werewolf: {
    id: 'werewolf',
    name: 'The Werewolf',
    title: 'The Relentless Hunter',
    description:
      'A patient stalker that gives you time to think — and tears a huge chunk out of you the moment you guess.',
    passiveThreatPerSecond: 0.18,
    wrongAnswerPenalty: 20,
    specialEffect: 'Bloodlust Lunge: a brutal +20% threat spike and violent screen shake on mistakes.',
    accentColor: '#c47a2a',
  },
  banshee: {
    id: 'banshee',
    name: 'The Banshee',
    title: 'The Time Wraith',
    description:
      'Her wail devours the clock itself. Mistakes barely sting, but the minutes bleed away fast.',
    passiveThreatPerSecond: 0.38,
    wrongAnswerPenalty: 7,
    specialEffect: 'Spectral Haunt: above 60% threat a violet vignette flickers across the room.',
    accentColor: '#a06ce8',
  },
};

export const VILLAIN_LIST: VillainProfile[] = [
  VILLAINS.dracula,
  VILLAINS.werewolf,
  VILLAINS.banshee,
];

export const PROP_LORE: Record<PropId, { name: string; lore: string }> = {
  bookshelf: {
    name: 'The Cursed Bookshelf',
    lore: 'Scattered tomes demand their true meanings be restored.',
  },
  clock: {
    name: 'The Grandfather Clock',
    lore: 'Time has come undone. Restore the proper order of events.',
  },
  scale: {
    name: "The Alchemist's Scale",
    lore: 'Weigh each claim: truth on one pan, fallacy on the other.',
  },
  safe: {
    name: 'The Iron Safe',
    lore: 'Four questions, four digits. The vault respects nothing else.',
  },
  cauldron: {
    name: 'The Ritual Cauldron',
    lore: 'Speak the missing word and the brew will answer.',
  },
  gargoyle: {
    name: 'The Gargoyle Exit Door',
    lore: 'The final warden tests whether you truly understood.',
  },
};
