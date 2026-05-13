'use client';
import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { CharNodeData } from '@/lib/genealogy';

function CharacterNodeBase({ data }: NodeProps<CharNodeData>) {
  const c = data.character;
  return (
    <div
      className={`cat-${c.category} rounded-card border border-soft bg-bg-secondary px-3 py-2 w-[160px] text-center cursor-pointer hover:bg-bg-elevated transition-colors`}
    >
      <Handle type="target" position={Position.Top} className="!w-1 !h-1 !bg-transparent !border-0" />
      <div className="font-medium text-sm leading-tight">{c.names.ko}</div>
      <div className="text-ink-muted text-xs mt-0.5 truncate">{c.names.en}</div>
      <Handle type="source" position={Position.Bottom} className="!w-1 !h-1 !bg-transparent !border-0" />
    </div>
  );
}

export default memo(CharacterNodeBase);
