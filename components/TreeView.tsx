'use client';
import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import type { Character, Category, Tier } from '@/types/character';
import { allCharacters, CATEGORIES, categoryCount, TIERS } from '@/lib/data';
import { buildGraph } from '@/lib/genealogy';
import { useSettings } from '@/lib/useSettings';
import CharacterNode from './CharacterNode';
import CharacterDetail from './CharacterDetail';

const nodeTypes = { character: CharacterNode };

const CATEGORY_COLOR: Record<string, string> = {
  올림포스: '#B8860B',
  티탄: '#6B4F8C',
  영웅: '#9C2A2A',
  트로이: '#9C2A2A',
  괴물: '#8B6F47',
  님프: '#5C6B5C',
  지하세계: '#4A5258',
  원시신: '#5C6B5C',
  기타신: '#8B6F47',
};

type Props = {
  focusId?: string | null;
  onSwitchToFamily?: (id?: string) => void;
};

export default function TreeView({ focusId = null, onSwitchToFamily }: Props) {
  const { settings } = useSettings();

  const availableTiers = useMemo<Tier[]>(
    () => (settings.forceUnlock ? [1, 2, 3] : [1]),
    [settings.forceUnlock],
  );

  const [activeTiers, setActiveTiers] = useState<Set<Tier>>(() => new Set(availableTiers));
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(() => new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep tier filter consistent with unlock setting (drop locked tiers).
  useEffect(() => {
    setActiveTiers((prev) => {
      const next = new Set<Tier>();
      for (const t of prev) if (availableTiers.includes(t)) next.add(t);
      if (next.size === 0) for (const t of availableTiers) next.add(t);
      return next;
    });
  }, [availableTiers]);

  const characters = useMemo<Character[]>(() => {
    return allCharacters.filter((c) => {
      if (!activeTiers.has(c.tier)) return false;
      if (activeCategories.size > 0 && !activeCategories.has(c.category)) return false;
      return true;
    });
  }, [activeTiers, activeCategories]);

  const { nodes, edges } = useMemo(() => buildGraph(characters), [characters]);
  const focusedCharacter = useMemo(
    () => (focusId ? allCharacters.find((c) => c.id === focusId) ?? null : null),
    [focusId],
  );
  const [selected, setSelected] = useState<Character | null>(null);

  const tierCounts = useMemo(() => {
    const counts: Record<Tier, number> = { 1: 0, 2: 0, 3: 0 };
    for (const c of allCharacters) counts[c.tier]++;
    return counts;
  }, []);
  const categoryCounts = useMemo(() => categoryCount(allCharacters), []);

  function toggleTier(t: Tier) {
    setActiveTiers((prev) => {
      const next = new Set(prev);
      if (next.has(t)) {
        if (next.size > 1) next.delete(t);
      } else {
        next.add(t);
      }
      return next;
    });
  }
  function toggleCategory(c: Category) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  return (
    <main className="flex h-[calc(100dvh-3rem)] flex-col px-4 py-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">계보도</h1>
          <p className="text-ink-muted text-sm">
            실선 부모→자식 · 점선 배우자 · 노드 클릭 → 상세
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-ink-muted hidden text-sm sm:inline">
            {nodes.length}명 · {edges.length}관계
          </span>
          {onSwitchToFamily && (
            <button
              type="button"
              onClick={() => onSwitchToFamily(focusId ?? undefined)}
              className="rounded-card border border-soft bg-bg-elevated px-3 py-1.5 text-sm text-ink-secondary hover:bg-bg-secondary"
              aria-label="패밀리 뷰로 전환"
            >
              패밀리
            </button>
          )}
        </div>
      </header>

      {focusedCharacter && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-card border border-soft bg-bg-secondary px-3 py-1.5 text-sm">
          <span className="text-ink-secondary">
            포커스 인물 <span className="font-medium">{focusedCharacter.names.ko}</span>
          </span>
          {onSwitchToFamily && (
            <button
              type="button"
              onClick={() => onSwitchToFamily(focusedCharacter.id)}
              className="text-ink-muted hover:text-ink-primary text-xs underline-offset-2 hover:underline"
            >
              패밀리 뷰에서 보기
            </button>
          )}
        </div>
      )}

      <div className="mb-2">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1 text-sm"
          aria-expanded={filtersOpen}
        >
          <span aria-hidden>{filtersOpen ? '▾' : '▸'}</span>
          필터
          <span className="text-ink-muted text-xs">
            (Tier {Array.from(activeTiers).sort().join('·')}
            {activeCategories.size > 0 && ` · 분류 ${activeCategories.size}`})
          </span>
        </button>
        {filtersOpen && (
          <div className="mt-2 space-y-2 rounded-card border border-soft bg-bg-secondary px-3 py-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-ink-muted mr-1 text-xs">Tier</span>
              {TIERS.map((t) => {
                const locked = !availableTiers.includes(t);
                const active = activeTiers.has(t);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={locked}
                    onClick={() => toggleTier(t)}
                    className={[
                      'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                      active
                        ? 'border-medium bg-bg-elevated'
                        : 'border-soft bg-transparent hover:bg-bg-primary',
                      locked ? 'cursor-not-allowed opacity-40' : '',
                    ].join(' ')}
                  >
                    T{t}
                    <span className="text-ink-muted ml-1">{tierCounts[t]}</span>
                    {locked && ' 🔒'}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-ink-muted mr-1 text-xs">분류</span>
              <button
                type="button"
                onClick={() => setActiveCategories(new Set())}
                className={[
                  'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                  activeCategories.size === 0
                    ? 'border-medium bg-bg-elevated'
                    : 'border-soft bg-transparent hover:bg-bg-primary',
                ].join(' ')}
              >
                전체
              </button>
              {CATEGORIES.map((cat) => {
                const count = categoryCounts[cat];
                if (!count) return null;
                const active = activeCategories.has(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={[
                      `cat-${cat} rounded-r-full border-y border-r pl-1.5 pr-2.5 py-0.5 text-xs transition-colors`,
                      active
                        ? 'border-medium bg-bg-elevated'
                        : 'border-soft bg-transparent hover:bg-bg-primary',
                    ].join(' ')}
                  >
                    {cat}
                    <span className="text-ink-muted ml-1">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-bg-secondary border-soft flex-1 overflow-hidden rounded-card border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          onNodeClick={(_, node) => setSelected(node.data.character)}
          nodesDraggable
          panOnScroll
          proOptions={{ hideAttribution: false }}
        >
          <Background color="rgba(0,0,0,0.06)" gap={20} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            className="!hidden md:!block"
            pannable
            zoomable
            maskColor="rgba(250,247,242,0.7)"
            nodeColor={(n) => CATEGORY_COLOR[n.data.character.category] ?? '#8B857E'}
          />
        </ReactFlow>
      </div>
      {selected && <CharacterDetail character={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
