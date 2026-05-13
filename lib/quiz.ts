import type { Character, Category } from '@/types/character';
import type { AttemptMode, Language } from './db';
import { getCharacter } from './data';

export type QuizOption = {
  text: string;
  lang?: Language;
  correct: boolean;
  characterId: string;
};

export type Question = {
  mode: AttemptMode;
  prompt: string;
  promptLang?: Language;
  hint?: string;
  options: QuizOption[];
  targetCharacterId: string;
};

function pickRandom<T>(arr: ReadonlyArray<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function distractors(
  target: Character,
  pool: ReadonlyArray<Character>,
  n: number,
  preferCategory?: Category,
): Character[] {
  const same = pool.filter(
    (c) => c.id !== target.id && (!preferCategory || c.category === preferCategory),
  );
  const others = pool.filter(
    (c) => c.id !== target.id && (!preferCategory || c.category !== preferCategory),
  );
  const picked: Character[] = [];
  const sameShuffled = shuffle(same);
  const otherShuffled = shuffle(others);
  while (picked.length < n && sameShuffled.length > 0) picked.push(sameShuffled.shift()!);
  while (picked.length < n && otherShuffled.length > 0) picked.push(otherShuffled.shift()!);
  return picked;
}

function langClass(lang: Language): string {
  if (lang === 'grc') return 'font-greek';
  if (lang === 'la') return 'font-latin italic';
  return '';
}

// 1. Language match: ko → (en | grc | la)
export function genLangMatch(target: Character, pool: ReadonlyArray<Character>): Question {
  const targetLang = pickRandom<Language>(['en', 'grc', 'la']);
  const distrChars = distractors(target, pool, 3, target.category);
  const options: QuizOption[] = shuffle([
    { text: target.names[targetLang], lang: targetLang, correct: true, characterId: target.id },
    ...distrChars.map<QuizOption>((c) => ({
      text: c.names[targetLang],
      lang: targetLang,
      correct: false,
      characterId: c.id,
    })),
  ]);
  return {
    mode: 'lang_match',
    prompt: target.names.ko,
    promptLang: 'ko',
    hint: `${langName(targetLang)} 이름은?`,
    options,
    targetCharacterId: target.id,
  };
}

// 2. Reverse language match: (grc | la) → ko
export function genReverseLang(target: Character, pool: ReadonlyArray<Character>): Question {
  const sourceLang = pickRandom<Language>(['grc', 'la']);
  const distrChars = distractors(target, pool, 3, target.category);
  const options: QuizOption[] = shuffle([
    { text: target.names.ko, correct: true, characterId: target.id },
    ...distrChars.map<QuizOption>((c) => ({
      text: c.names.ko,
      correct: false,
      characterId: c.id,
    })),
  ]);
  return {
    mode: 'reverse_lang',
    prompt: target.names[sourceLang],
    promptLang: sourceLang,
    hint: `이 ${langName(sourceLang)} 이름의 인물은?`,
    options,
    targetCharacterId: target.id,
  };
}

// 3. Role → character
export function genRole(target: Character, pool: ReadonlyArray<Character>): Question {
  const distrChars = distractors(target, pool, 3, target.category);
  const options: QuizOption[] = shuffle([
    { text: target.names.ko, correct: true, characterId: target.id },
    ...distrChars.map<QuizOption>((c) => ({
      text: c.names.ko,
      correct: false,
      characterId: c.id,
    })),
  ]);
  return {
    mode: 'role',
    prompt: target.role,
    hint: '이 역할의 인물은?',
    options,
    targetCharacterId: target.id,
  };
}

// 4. Symbol(s) → character
export function genSymbol(target: Character, pool: ReadonlyArray<Character>): Question | null {
  if (target.symbols.length === 0) return null;
  const count = Math.min(2, target.symbols.length);
  const picked = shuffle(target.symbols).slice(0, count);
  const distrChars = distractors(target, pool, 3, target.category);
  const options: QuizOption[] = shuffle([
    { text: target.names.ko, correct: true, characterId: target.id },
    ...distrChars.map<QuizOption>((c) => ({
      text: c.names.ko,
      correct: false,
      characterId: c.id,
    })),
  ]);
  return {
    mode: 'symbol',
    prompt: picked.join(' · '),
    hint: '이 상징을 가진 인물은?',
    options,
    targetCharacterId: target.id,
  };
}

// 5. Family relation
type RelationKind = 'parents' | 'consorts' | 'children' | 'siblings';
const RELATION_LABEL: Record<RelationKind, string> = {
  parents: '부모',
  consorts: '배우자',
  children: '자녀',
  siblings: '형제자매',
};

export function genFamily(target: Character, pool: ReadonlyArray<Character>): Question | null {
  const kinds: RelationKind[] = ['parents', 'consorts', 'children', 'siblings'];
  const candidates: { kind: RelationKind; relatedId: string }[] = [];
  for (const k of kinds) {
    for (const id of target.family[k]) {
      if (getCharacter(id)) candidates.push({ kind: k, relatedId: id });
    }
  }
  if (candidates.length === 0) return null;
  const { kind, relatedId } = pickRandom(candidates);
  const related = getCharacter(relatedId)!;
  const distrChars = distractors(related, pool, 3, related.category);
  const options: QuizOption[] = shuffle([
    { text: related.names.ko, correct: true, characterId: related.id },
    ...distrChars.map<QuizOption>((c) => ({
      text: c.names.ko,
      correct: false,
      characterId: c.id,
    })),
  ]);
  return {
    mode: 'family',
    prompt: `${target.names.ko}의 ${RELATION_LABEL[kind]}는?`,
    hint: '다음 중 한 명을 고르세요',
    options,
    targetCharacterId: related.id,
  };
}

const GENERATORS = [genLangMatch, genReverseLang, genRole, genSymbol, genFamily] as const;

export function generateQuestion(pool: ReadonlyArray<Character>): Question {
  // Try up to 8 random combinations; some generators may return null
  // (no symbols, no in-dataset family members).
  for (let i = 0; i < 8; i++) {
    const target = pickRandom(pool);
    const gen = pickRandom(GENERATORS);
    const q = gen(target, pool);
    if (q) return q;
  }
  // Fallback to guaranteed-success generator
  return genLangMatch(pickRandom(pool), pool);
}

function langName(lang: Language): string {
  if (lang === 'ko') return '한국어';
  if (lang === 'en') return '영어';
  if (lang === 'grc') return '그리스어';
  return '라틴어';
}

export { langClass };
