'use client';
import { useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import type { Character } from '@/types/character';
import { allCharacters } from '@/lib/data';
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

export default function TreeView() {
  const { settings } = useSettings();
  const characters = useMemo<Character[]>(() => {
    const tiers = settings.forceUnlock ? [1, 2, 3] : [1];
    return allCharacters.filter((c) => tiers.includes(c.tier));
  }, [settings.forceUnlock]);

  const { nodes, edges } = useMemo(() => buildGraph(characters), [characters]);
  const [selected, setSelected] = useState<Character | null>(null);

  return (
    <main className="flex flex-col h-[calc(100dvh-3rem)] px-4 py-4">
      <header className="mb-3 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">계보도</h1>
          <p className="text-ink-muted text-sm">
            실선: 부모→자식 · 점선: 배우자 · 노드 클릭 → 상세
          </p>
        </div>
        <span className="text-ink-muted text-sm">
          {nodes.length} 노드 · {edges.length} 관계
        </span>
      </header>
      <div className="flex-1 rounded-card border border-soft bg-bg-secondary overflow-hidden">
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
