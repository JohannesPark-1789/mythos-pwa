// Client-side IndexedDB schema (Dexie). All persisted state lives here:
// SRS card state, raw attempt log, per-tier progression, and user settings.
// Import only from client components — Dexie touches IndexedDB on method call,
// not on module load, so importing from a server component is safe but useless.
import Dexie, { type Table } from 'dexie';
import type { Tier } from '@/types/character';

export type Language = 'ko' | 'en' | 'grc' | 'la';
export type FontSize = 'small' | 'normal' | 'large';

export type SrsCard = {
  id?: number;
  characterId: string;
  ef: number;          // SM-2 easiness factor (init 2.5, min 1.3)
  interval: number;    // days until next review
  reps: number;        // consecutive successful reps
  due: number;         // epoch ms; <= Date.now() ⇒ due today
  lastReview: number | null;
};

export type AttemptMode =
  | 'flashcard'
  | 'lang_match'
  | 'reverse_lang'
  | 'role'
  | 'symbol'
  | 'family';

export type Attempt = {
  id?: number;
  characterId: string;
  mode: AttemptMode;
  correct: boolean;
  timestamp: number;
};

export type ProgressionRow = {
  tier: Tier;
  masteredCount: number;
  unlockedAt: number | null;  // null until tier unlocked (Tier 1 unlocks at install)
};

export const SETTINGS_KEY = 'singleton';

export type SettingsRow = {
  id: typeof SETTINGS_KEY;
  frontLanguage: Language;
  displayLanguages: Language[];
  fontSize: FontSize;
  forceUnlock: boolean;
};

export const DEFAULT_SETTINGS: SettingsRow = {
  id: SETTINGS_KEY,
  frontLanguage: 'ko',
  displayLanguages: ['en', 'grc', 'la'],
  fontSize: 'normal',
  forceUnlock: false,
};

class MythosDB extends Dexie {
  cards!: Table<SrsCard, number>;
  attempts!: Table<Attempt, number>;
  progression!: Table<ProgressionRow, number>;
  settings!: Table<SettingsRow, string>;

  constructor() {
    super('MythosDB');
    this.version(1).stores({
      cards: '++id, &characterId, due',
      attempts: '++id, characterId, timestamp, mode',
      progression: '&tier',
      settings: '&id',
    });
  }
}

export const db = new MythosDB();

export async function getSettings(): Promise<SettingsRow> {
  const row = await db.settings.get(SETTINGS_KEY);
  return row ?? DEFAULT_SETTINGS;
}

export async function saveSettings(patch: Partial<Omit<SettingsRow, 'id'>>): Promise<SettingsRow> {
  const current = await getSettings();
  const next: SettingsRow = { ...current, ...patch, id: SETTINGS_KEY };
  await db.settings.put(next);
  return next;
}

export async function resetAllProgress(): Promise<void> {
  await db.transaction('rw', db.cards, db.attempts, db.progression, async () => {
    await db.cards.clear();
    await db.attempts.clear();
    await db.progression.clear();
  });
}
