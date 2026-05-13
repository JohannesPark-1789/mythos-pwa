import type { Category } from '@/types/character';
import type { Language } from './db';

export const LANGUAGE_LABEL: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
  grc: 'Ἑλληνικά',
  la: 'Latina',
};

export const LANGUAGE_LABEL_KO: Record<Language, string> = {
  ko: '한국어',
  en: '영어',
  grc: '그리스어',
  la: '라틴어',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  올림포스: '올림포스',
  티탄: '티탄',
  영웅: '영웅',
  트로이: '트로이',
  괴물: '괴물',
  님프: '님프',
  지하세계: '지하세계',
  원시신: '원시신',
  기타신: '기타신',
};

export const FONT_SIZE_DELTA: Record<'small' | 'normal' | 'large', number> = {
  small: -2,
  normal: 0,
  large: 2,
};
