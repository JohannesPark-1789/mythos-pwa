// Static character dataset loader + pure filter/search helpers.
// Safe to import from server components (no IndexedDB / window refs).
// Sources are aggregated at build time; each file is a CharacterDataset wrapper.
import tier1 from '@/data/characters.json';
import tier2Troy from '@/data/tier2/troy.json';
import tier2Heroes from '@/data/tier2/heroes.json';
import tier2NymphsMonsters from '@/data/tier2/nymphs_monsters.json';
import tier2OtherGods from '@/data/tier2/other_gods.json';
import tier2Underworld from '@/data/tier2/underworld.json';
import tier2Primordial from '@/data/tier2/primordial.json';
import type { Character, CharacterDataset, Category, Tier } from '@/types/character';

const SOURCES: CharacterDataset[] = [
  tier1 as CharacterDataset,
  tier2Troy as CharacterDataset,
  tier2Heroes as CharacterDataset,
  tier2NymphsMonsters as CharacterDataset,
  tier2OtherGods as CharacterDataset,
  tier2Underworld as CharacterDataset,
  tier2Primordial as CharacterDataset,
];

export const allCharacters: ReadonlyArray<Character> = SOURCES.flatMap((s) => s.characters);

export const CATEGORIES: ReadonlyArray<Category> = [
  '올림포스',
  '티탄',
  '영웅',
  '트로이',
  '괴물',
  '님프',
  '지하세계',
  '원시신',
  '기타신',
];

export const TIERS: ReadonlyArray<Tier> = [1, 2, 3];

export function getCharacter(id: string): Character | undefined {
  return allCharacters.find((c) => c.id === id);
}

export function filterByCategory(
  chars: ReadonlyArray<Character>,
  category: Category | null,
): Character[] {
  if (!category) return [...chars];
  return chars.filter((c) => c.category === category);
}

export function filterByTier(
  chars: ReadonlyArray<Character>,
  tier: Tier | null,
): Character[] {
  if (!tier) return [...chars];
  return chars.filter((c) => c.tier === tier);
}

// Lowercase + strip combining marks (Greek accents, Latin macrons, etc).
function norm(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function searchCharacters(
  chars: ReadonlyArray<Character>,
  query: string,
): Character[] {
  const q = norm(query.trim());
  if (!q) return [...chars];
  return chars.filter((c) => {
    const fields: string[] = [
      c.names.ko,
      c.names.en,
      c.names.grc,
      c.names.grc_translit,
      c.names.la,
      c.role,
      ...c.domains,
      ...c.symbols,
    ];
    return fields.some((f) => norm(f).includes(q));
  });
}

export type LibraryFilter = {
  category: Category | null;
  tier: Tier | null;
  query: string;
};

export function applyLibraryFilter(
  chars: ReadonlyArray<Character>,
  filter: LibraryFilter,
): Character[] {
  let out: Character[] = filterByCategory(chars, filter.category);
  out = filterByTier(out, filter.tier);
  out = searchCharacters(out, filter.query);
  return out;
}

export function categoryCount(chars: ReadonlyArray<Character>): Record<Category, number> {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  for (const c of chars) counts[c.category]++;
  return counts;
}
