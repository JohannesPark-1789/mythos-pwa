'use client';
import { useMemo, useState } from 'react';
import type { Character, Category, Tier } from '@/types/character';
import { applyLibraryFilter, CATEGORIES, TIERS, categoryCount } from '@/lib/data';
import { useSettings } from '@/lib/useSettings';
import CharacterDetail from './CharacterDetail';

type Props = {
  characters: Character[];
};

export default function LibraryView({ characters }: Props) {
  const { settings } = useSettings();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [tier, setTier] = useState<Tier | null>(1);
  const [selected, setSelected] = useState<Character | null>(null);

  const filtered = useMemo(
    () => applyLibraryFilter(characters, { query, category, tier }),
    [characters, query, category, tier],
  );

  const categoryCounts = useMemo(
    () => categoryCount(tier ? characters.filter((c) => c.tier === tier) : characters),
    [characters, tier],
  );

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">라이브러리</h1>
        <p className="text-ink-secondary mt-1 text-sm">
          {filtered.length} / {characters.length}명
        </p>
      </header>

      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름·역할·상징 검색 (한·영·그리스·라틴)"
          className="w-full rounded-card border border-soft bg-bg-elevated px-4 py-2.5 text-base focus:outline-none focus:border-medium"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className="text-ink-muted text-sm self-center mr-1">Tier</span>
        {TIERS.map((t) => {
          const locked = !settings.forceUnlock && t !== 1;
          const active = tier === t;
          return (
            <button
              key={t}
              type="button"
              disabled={locked}
              onClick={() => setTier(active ? null : t)}
              className={[
                'rounded-full border px-3 py-1 text-sm transition-colors',
                active
                  ? 'border-medium bg-bg-elevated'
                  : 'border-soft bg-transparent hover:bg-bg-secondary',
                locked ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              T{t}
              {locked && ' 🔒'}
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="text-ink-muted text-sm self-center mr-1">분류</span>
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={[
            'rounded-full border px-3 py-1 text-sm transition-colors',
            category === null
              ? 'border-medium bg-bg-elevated'
              : 'border-soft bg-transparent hover:bg-bg-secondary',
          ].join(' ')}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat];
          if (count === 0) return null;
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(active ? null : cat)}
              className={[
                `cat-${cat} rounded-r-full border-y border-r pl-2 pr-3 py-1 text-sm transition-colors`,
                active
                  ? 'border-medium bg-bg-elevated'
                  : 'border-soft bg-transparent hover:bg-bg-secondary',
              ].join(' ')}
            >
              {cat}
              <span className="text-ink-muted ml-1.5">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-muted py-12 text-center">검색 결과가 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelected(c)}
                className={`cat-${c.category} w-full text-left rounded-card border border-soft bg-bg-secondary px-4 py-3 transition-colors hover:bg-bg-elevated`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{c.names.ko}</span>
                  <span className="text-ink-muted text-xs">{c.category}</span>
                </div>
                <div className="text-ink-secondary text-sm mt-1">{c.names.en}</div>
                <div className="font-greek text-ink-secondary text-sm mt-0.5">{c.names.grc}</div>
                <div className="font-latin italic text-ink-muted text-sm mt-0.5">{c.names.la}</div>
                <p className="text-ink-muted text-sm mt-2 line-clamp-2">{c.role}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && <CharacterDetail character={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
