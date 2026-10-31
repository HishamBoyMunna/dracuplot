import { useCallback, useState } from 'react';
import type { PuzzleMistake } from '../../types/game';

export type FeedbackTone = 'error' | 'info' | 'success';

export interface PuzzleFeedback {
  tone: FeedbackTone;
  message: string;
}

/** Heat charged when the player peeks at the Chem Vat hint. */
export const HINT_THREAT_COST = 4;

/**
 * Shared wrong-answer plumbing: bumps the shake signal, surfaces a message and
 * reports the missed concepts upward exactly once per submission.
 */
export function usePuzzleFeedback(onMistake: (mistakes: PuzzleMistake[]) => void) {
  const [shakeSignal, setShakeSignal] = useState(0);
  const [feedback, setFeedback] = useState<PuzzleFeedback | null>(null);
  const [attempts, setAttempts] = useState(0);

  const fail = useCallback(
    (message: string, mistakes: PuzzleMistake[]) => {
      onMistake(mistakes);
      setFeedback({ tone: 'error', message });
      setShakeSignal((signal) => signal + 1);
      setAttempts((count) => count + 1);
    },
    [onMistake],
  );

  const notify = useCallback((message: string, tone: FeedbackTone = 'info') => {
    setFeedback({ tone, message });
  }, []);

  const clear = useCallback(() => setFeedback(null), []);

  return { shakeSignal, feedback, attempts, fail, notify, clear };
}

/** Fisher-Yates — a fresh order every time a puzzle mounts. */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalise(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?'"]/g, '');
}

/** Case-insensitive, whitespace-trimmed, with a 4+ character substring allowance. */
export function matchesAnswer(input: string, answer: string): boolean {
  const guess = normalise(input);
  const truth = normalise(answer);
  if (!guess || !truth) return false;
  if (guess === truth) return true;
  if (guess.length >= 4 && truth.includes(guess)) return true;
  if (truth.length >= 4 && guess.includes(truth)) return true;
  return false;
}

/** Splits a Chem Vat clue around its [BLANK] placeholder. */
export function splitClue(clue: string): [string, string] {
  const index = clue.indexOf('[BLANK]');
  if (index === -1) return [clue, ''];
  return [clue.slice(0, index), clue.slice(index + '[BLANK]'.length)];
}
