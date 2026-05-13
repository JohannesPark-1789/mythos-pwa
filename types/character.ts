export type Category =
  | '올림포스'
  | '티탄'
  | '영웅'
  | '트로이'
  | '괴물'
  | '님프'
  | '지하세계'
  | '원시신'
  | '기타신';

export type Tier = 1 | 2 | 3;
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type CharacterNames = {
  ko: string;
  en: string;
  grc: string;
  grc_translit: string;
  la: string;
  la_note?: string;
};

export type CharacterFamily = {
  parents: string[];
  consorts: string[];
  children: string[];
  siblings: string[];
};

export type Character = {
  id: string;
  tier: Tier;
  category: Category;
  names: CharacterNames;
  role: string;
  domains: string[];
  symbols: string[];
  family: CharacterFamily;
  story_hooks: string[];
  difficulty: Difficulty;
};

export type CharacterDataset = {
  version: string;
  tier: Tier;
  schema_note?: string;
  characters: Character[];
};
