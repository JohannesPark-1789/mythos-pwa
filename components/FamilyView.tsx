'use client';
import { useMemo, useState } from 'react';
import type { Character, Category } from '@/types/character';
import {
  allCharacters,
  CATEGORIES,
  categoryCount,
  characterName,
  filterByCategory,
  getCharacter,
  searchCharacters,
} from '@/lib/data';
import CharacterDetail from './CharacterDetail';

// Popular starting points when no focus is set yet.
const QUICK_PICKS: string[] = ['zeus', 'hera', 'poseidon', 'athena', 'apollo', 'artemis'];

type RelationKey = 'parents' | 'consorts' | 'siblings' | 'children';
const RELATION_LABEL: Record<RelationKey, string> = {
  parents: '부모',
  consorts: '배우자',
  siblings: '형제자매',
  children: '자녀',
};

type Props = {
  focusId: string | null;
  onFocusChange: (id: string) => void;
  onSwitchToGraph?: () => void;
};

export default function FamilyView({ focusId, onFocusChange, onSwitchToGraph }: Props) {
  const focus = focusId ? getCharacter(focusId) : null;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [detail, setDetail] = useState<Character | null>(null);

  const searching = query.trim().length > 0 || category !== null;
  const searchResults = useMemo(() => {
    if (!searching) return [] as Character[];
    const pool = filterByCategory([...allCharacters], category);
    return searchCharacters(pool, query).slice(0, 80);
  }, [query, category, searching]);

  const categoryCounts = useMemo(() => categoryCount(allCharacters), []);

  function pickFocus(id: string) {
    onFocusChange(id);
    setQuery('');
    setCategory(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-10">
      <header className="sticky top-12 z-10 -mx-4 border-b border-soft bg-bg-primary/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름·역할로 인물 찾기"
            className="flex-1 rounded-card border border-soft bg-bg-elevated px-3 py-2 text-base focus:border-medium focus:outline-none"
            aria-label="인물 검색"
          />
          {onSwitchToGraph && (
            <button
              type="button"
              onClick={onSwitchToGraph}
              className="shrink-0 rounded-card border border-soft bg-bg-elevated px-3 py-2 text-sm text-ink-secondary hover:bg-bg-secondary"
              aria-label="그래프 뷰로 전환"
            >
              그래프
            </button>
          )}
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={[
              'shrink-0 rounded-full border px-2.5 py-0.5 text-xs transition-colors',
              category === null
                ? 'border-medium bg-bg-elevated'
                : 'border-soft bg-transparent hover:bg-bg-secondary',
            ].join(' ')}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat];
            if (!count) return null;
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(active ? null : cat)}
                className={[
                  `cat-${cat} shrink-0 rounded-r-full border-y border-r pl-1.5 pr-2.5 py-0.5 text-xs transition-colors`,
                  active
                    ? 'border-medium bg-bg-elevated'
                    : 'border-soft bg-transparent hover:bg-bg-secondary',
                ].join(' ')}
              >
                {cat}
                <span className="text-ink-muted ml-1">{count}</span>
              </button>
            );
          })}
        </div>
      </header>

      {searching ? (
        <SearchResults results={searchResults} onPick={pickFocus} />
      ) : focus ? (
        <Ego focus={focus} onPick={pickFocus} onDetail={setDetail} />
      ) : (
        <EmptyState onPick={pickFocus} />
      )}

      {detail && <CharacterDetail character={detail} onClose={() => setDetail(null)} />}
    </main>
  );
}

function EmptyState({ onPick }: { onPick: (id: string) => void }) {
  const picks = QUICK_PICKS.map(getCharacter).filter((c): c is Character => Boolean(c));
  return (
    <section className="py-10 text-center">
      <p className="text-ink-secondary">
        인물을 검색하거나 아래에서 시작하세요.
      </p>
      <p className="text-ink-muted mt-1 text-sm">탭한 인물을 중심으로 가족 관계가 펼쳐집니다.</p>
      {picks.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {picks.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className={`cat-${c.category} rounded-card border border-soft bg-bg-secondary px-4 py-2 text-sm hover:bg-bg-elevated`}
            >
              {c.names.ko}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function SearchResults({
  results,
  onPick,
}: {
  results: Character[];
  onPick: (id: string) => void;
}) {
  if (results.length === 0) {
    return <p className="text-ink-muted py-10 text-center">검색 결과가 없습니다.</p>;
  }
  return (
    <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {results.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onPick(c.id)}
            className={`cat-${c.category} w-full rounded-card border border-soft bg-bg-secondary px-3 py-2 text-left hover:bg-bg-elevated`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{c.names.ko}</span>
              <span className="text-ink-muted text-xs">{c.category}</span>
            </div>
            <div className="text-ink-muted truncate text-sm">{c.names.en}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Ego({
  focus,
  onPick,
  onDetail,
}: {
  focus: Character;
  onPick: (id: string) => void;
  onDetail: (c: Character) => void;
}) {
  return (
    <div className="mt-4 space-y-5">
      <RelationGroup
        relation="parents"
        ids={focus.family.parents}
        onPick={onPick}
        align="up"
      />

      <CenterCard focus={focus} onDetail={onDetail} />

      <RelationGroup
        relation="consorts"
        ids={focus.family.consorts}
        onPick={onPick}
        align="side"
      />
      <RelationGroup
        relation="siblings"
        ids={focus.family.siblings}
        onPick={onPick}
        align="side"
      />
      <RelationGroup
        relation="children"
        ids={focus.family.children}
        onPick={onPick}
        align="down"
      />
    </div>
  );
}

function CenterCard({
  focus,
  onDetail,
}: {
  focus: Character;
  onDetail: (c: Character) => void;
}) {
  return (
    <div
      className={`cat-${focus.category} rounded-card border border-medium bg-bg-elevated p-5 shadow-none`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{focus.names.ko}</h2>
          <p className="text-ink-muted text-sm">
            {focus.category} · Tier {focus.tier}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDetail(focus)}
          className="rounded-card border border-soft bg-bg-secondary px-3 py-1.5 text-sm text-ink-secondary hover:bg-bg-primary"
        >
          상세
        </button>
      </div>
      <p className="text-ink-secondary mt-2 text-sm">{focus.role}</p>
      {focus.domains.length > 0 && (
        <p className="text-ink-muted mt-1 text-sm">{focus.domains.join(' · ')}</p>
      )}
    </div>
  );
}

function RelationGroup({
  relation,
  ids,
  onPick,
  align,
}: {
  relation: RelationKey;
  ids: string[];
  onPick: (id: string) => void;
  align: 'up' | 'down' | 'side';
}) {
  if (ids.length === 0) return null;
  const uniqueIds = Array.from(new Set(ids));
  const arrow = align === 'up' ? '↑' : align === 'down' ? '↓' : '↔';
  return (
    <section>
      <h3 className="text-ink-muted mb-2 flex items-center gap-2 text-sm">
        <span aria-hidden>{arrow}</span>
        <span>
          {RELATION_LABEL[relation]}
          <span className="ml-1.5 text-xs">({uniqueIds.length})</span>
        </span>
      </h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {uniqueIds.map((id) => (
          <li key={id}>
            <RelationCard id={id} onPick={onPick} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelationCard({ id, onPick }: { id: string; onPick: (id: string) => void }) {
  const char = getCharacter(id);
  if (!char) {
    return (
      <div
        className="rounded-card border border-dashed border-soft bg-transparent px-3 py-2 text-left"
        aria-disabled="true"
        title="아직 데이터셋에 없는 인물 (외부 참조)"
      >
        <div className="text-ink-muted text-sm">{characterName(id)}</div>
        <div className="text-ink-muted text-xs">외부</div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onPick(char.id)}
      className={`cat-${char.category} block w-full rounded-card border border-soft bg-bg-secondary px-3 py-2 text-left hover:bg-bg-elevated`}
    >
      <div className="text-sm font-medium">{char.names.ko}</div>
      <div className="text-ink-muted truncate text-xs">{char.category}</div>
    </button>
  );
}
