// SuperMemo 2 (SM-2) scheduling. Phase 3 will wire this to the flashcard UI.
// User responses map to SM-2 quality: 다시(1) / 어려움(3) / 괜찮음(4) / 쉬움(5).
import type { SrsCard } from './db';

export type ReviewQuality = 1 | 3 | 4 | 5;

export const INITIAL_EF = 2.5;
export const MIN_EF = 1.3;

export function newCard(characterId: string, now: number = Date.now()): SrsCard {
  return {
    characterId,
    ef: INITIAL_EF,
    interval: 0,
    reps: 0,
    due: now,
    lastReview: null,
  };
}

// Apply a review and return the next card state.
// quality < 3 ⇒ reset rep streak and reschedule for tomorrow.
export function applyReview(
  card: SrsCard,
  quality: ReviewQuality,
  now: number = Date.now(),
): SrsCard {
  const next: SrsCard = { ...card, lastReview: now };
  const failed = quality < 3;

  if (failed) {
    next.reps = 0;
    next.interval = 1;
  } else {
    next.reps = card.reps + 1;
    if (next.reps === 1) next.interval = 1;
    else if (next.reps === 2) next.interval = 6;
    else next.interval = Math.round(card.interval * card.ef);
  }

  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  next.ef = Math.max(MIN_EF, card.ef + efDelta);
  next.due = now + next.interval * 24 * 60 * 60 * 1000;
  return next;
}
