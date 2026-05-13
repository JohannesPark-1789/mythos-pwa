// Tier unlock evaluation. Phase 3+ will call this after every review/quiz.
//
//   Tier N → N+1 requires:
//     - >= MASTERY_RATIO of Tier N cards have SRS interval >= MASTERY_INTERVAL_DAYS
//     - last RECENT_ATTEMPTS attempts have accuracy >= RECENT_ACCURACY
//   Forced unlock bypasses both gates.
import type { Attempt, SrsCard } from './db';
import type { Tier } from '@/types/character';
import { allCharacters } from './data';

export const MASTERY_RATIO = 0.85;
export const MASTERY_INTERVAL_DAYS = 7;
export const RECENT_ATTEMPTS = 50;
export const RECENT_ACCURACY = 0.8;

export function tierCharacterIds(tier: Tier): string[] {
  return allCharacters.filter((c) => c.tier === tier).map((c) => c.id);
}

export function masteredCount(tier: Tier, cards: ReadonlyArray<SrsCard>): number {
  const ids = new Set(tierCharacterIds(tier));
  return cards.filter((c) => ids.has(c.characterId) && c.interval >= MASTERY_INTERVAL_DAYS).length;
}

export function recentAccuracy(attempts: ReadonlyArray<Attempt>): number {
  if (attempts.length === 0) return 0;
  const slice = attempts.slice(-RECENT_ATTEMPTS);
  const hits = slice.filter((a) => a.correct).length;
  return hits / slice.length;
}

export type UnlockEval = {
  tier: Tier;
  totalCards: number;
  mastered: number;
  masteryRatio: number;
  accuracy: number;
  accuracySampleSize: number;
  meetsMastery: boolean;
  meetsAccuracy: boolean;
  unlocked: boolean;
};

export function evaluateUnlock(
  tier: Tier,
  cards: ReadonlyArray<SrsCard>,
  attempts: ReadonlyArray<Attempt>,
  forced = false,
): UnlockEval {
  const total = tierCharacterIds(tier).length;
  const mastered = masteredCount(tier, cards);
  const ratio = total > 0 ? mastered / total : 0;
  const acc = recentAccuracy(attempts);
  const meetsMastery = ratio >= MASTERY_RATIO;
  const meetsAccuracy = attempts.length >= RECENT_ATTEMPTS && acc >= RECENT_ACCURACY;
  return {
    tier,
    totalCards: total,
    mastered,
    masteryRatio: ratio,
    accuracy: acc,
    accuracySampleSize: Math.min(attempts.length, RECENT_ATTEMPTS),
    meetsMastery,
    meetsAccuracy,
    unlocked: forced || (meetsMastery && meetsAccuracy),
  };
}
