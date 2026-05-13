import dagre from '@dagrejs/dagre';
import type { Node, Edge } from 'reactflow';
import type { Character } from '@/types/character';

export type CharNodeData = { character: Character };

const NODE_WIDTH = 160;
const NODE_HEIGHT = 64;

export function buildGraph(
  characters: Character[],
): { nodes: Node<CharNodeData>[]; edges: Edge[] } {
  const byId = new Map(characters.map((c) => [c.id, c]));

  const nodes: Node<CharNodeData>[] = characters.map((c) => ({
    id: c.id,
    type: 'character',
    data: { character: c },
    position: { x: 0, y: 0 },
  }));

  const edges: Edge[] = [];
  const seenParentChild = new Set<string>();
  const seenConsort = new Set<string>();

  for (const c of characters) {
    for (const parentId of c.family.parents) {
      if (!byId.has(parentId)) continue;
      const key = `${parentId}->${c.id}`;
      if (seenParentChild.has(key)) continue;
      seenParentChild.add(key);
      edges.push({
        id: `pc:${key}`,
        source: parentId,
        target: c.id,
        type: 'smoothstep',
        style: { strokeWidth: 1, stroke: 'rgba(42,42,42,0.5)' },
      });
    }
    for (const consortId of c.family.consorts) {
      if (!byId.has(consortId)) continue;
      const pair = [c.id, consortId].sort();
      const key = `${pair[0]}~${pair[1]}`;
      if (seenConsort.has(key)) continue;
      seenConsort.add(key);
      edges.push({
        id: `co:${key}`,
        source: pair[0],
        target: pair[1],
        type: 'straight',
        style: { strokeWidth: 1, stroke: 'rgba(42,42,42,0.35)', strokeDasharray: '4 3' },
      });
    }
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 28, ranksep: 70, marginx: 24, marginy: 24 });
  for (const n of nodes) g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  // Only parent→child edges influence the vertical layout (consort kept off-axis).
  for (const e of edges) {
    if (e.id.startsWith('pc:')) g.setEdge(e.source, e.target);
  }
  dagre.layout(g);

  for (const n of nodes) {
    const pos = g.node(n.id);
    n.position = { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 };
  }

  return { nodes, edges };
}
