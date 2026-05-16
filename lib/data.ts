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
import tier3Titans from '@/data/tier3/titans.json';
import tier3Primordial from '@/data/tier3/primordial.json';
import tier3Muses from '@/data/tier3/muses.json';
import tier3GracesHorae from '@/data/tier3/graces_horae.json';
import tier3Winds from '@/data/tier3/winds.json';
import tier3OtherGods from '@/data/tier3/other_gods.json';
import tier3Underworld from '@/data/tier3/underworld.json';
import tier3HeroesThebes from '@/data/tier3/heroes_thebes.json';
import tier3HeroesPerseusHeracles from '@/data/tier3/heroes_perseus_heracles.json';
import tier3HeroesThebesDionysus from '@/data/tier3/heroes_thebes_dionysus.json';
import tier3HeroesAthens from '@/data/tier3/heroes_athens.json';
import tier3HeroesMisc from '@/data/tier3/heroes_misc.json';
import tier3TroyAtreus from '@/data/tier3/troy_atreus.json';
import tier3TroyIthacaSlaves from '@/data/tier3/troy_ithaca_slaves.json';
import tier3TroyGreeks from '@/data/tier3/troy_greeks.json';
import tier3TroyTrojans from '@/data/tier3/troy_trojans.json';
import tier3Nymphs from '@/data/tier3/nymphs.json';
import tier3Nymphs2 from '@/data/tier3/nymphs_2.json';
import tier3Monsters from '@/data/tier3/monsters.json';
import tier3Monsters2 from '@/data/tier3/monsters_2.json';
import type { Character, CharacterDataset, Category, Tier } from '@/types/character';
import { EXTERNAL_NAMES_KO } from './external-names';

const SOURCES: CharacterDataset[] = [
  tier1 as CharacterDataset,
  tier2Troy as CharacterDataset,
  tier2Heroes as CharacterDataset,
  tier2NymphsMonsters as CharacterDataset,
  tier2OtherGods as CharacterDataset,
  tier2Underworld as CharacterDataset,
  tier2Primordial as CharacterDataset,
  tier3Titans as CharacterDataset,
  tier3Primordial as CharacterDataset,
  tier3Muses as CharacterDataset,
  tier3GracesHorae as CharacterDataset,
  tier3Winds as CharacterDataset,
  tier3OtherGods as CharacterDataset,
  tier3Underworld as CharacterDataset,
  tier3HeroesThebes as CharacterDataset,
  tier3HeroesPerseusHeracles as CharacterDataset,
  tier3HeroesThebesDionysus as CharacterDataset,
  tier3HeroesAthens as CharacterDataset,
  tier3HeroesMisc as CharacterDataset,
  tier3TroyAtreus as CharacterDataset,
  tier3TroyIthacaSlaves as CharacterDataset,
  tier3TroyGreeks as CharacterDataset,
  tier3TroyTrojans as CharacterDataset,
  tier3Nymphs as CharacterDataset,
  tier3Nymphs2 as CharacterDataset,
  tier3Monsters as CharacterDataset,
  tier3Monsters2 as CharacterDataset,
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

// Resolves a family-field reference to the Korean display name.
// Order: dataset character → external Korean alias → raw id (last resort).
export function characterName(idOrName: string): string {
  const c = allCharacters.find((c) => c.id === idOrName);
  if (c) return c.names.ko;
  return EXTERNAL_NAMES_KO[idOrName] ?? idOrName;
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
