'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FamilyView from './FamilyView';
import TreeView from './TreeView';

type Mode = 'family' | 'graph';

// SSR-safe viewport detector. Returns null until first client mount to avoid
// committing to a mode before we know the actual viewport.
function useDefaultMode(): Mode | null {
  const [mode, setMode] = useState<Mode | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    setMode(mq.matches ? 'graph' : 'family');
    const onChange = (e: MediaQueryListEvent) => setMode(e.matches ? 'graph' : 'family');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mode;
}

export default function TreePane() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const focusId = params.get('focus');
  const viewParam = params.get('view') as Mode | null;
  const viewportDefault = useDefaultMode();

  // Resolved mode: URL param wins; otherwise viewport default; until viewport
  // is known we render FamilyView (works at any size).
  const mode: Mode =
    viewParam === 'family' || viewParam === 'graph'
      ? viewParam
      : viewportDefault ?? 'family';

  const updateParams = useCallback(
    (patch: Record<string, string | null>, opts: { replace?: boolean } = {}) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null) next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (opts.replace) router.replace(href);
      else router.push(href);
    },
    [params, pathname, router],
  );

  const handleFocusChange = useCallback(
    (id: string) => updateParams({ focus: id }),
    [updateParams],
  );

  const handleSwitchToGraph = useCallback(
    () => updateParams({ view: 'graph' }, { replace: true }),
    [updateParams],
  );

  const handleSwitchToFamily = useCallback(
    (id?: string) => {
      const patch: Record<string, string | null> = { view: 'family' };
      if (id) patch.focus = id;
      updateParams(patch, { replace: true });
    },
    [updateParams],
  );

  if (mode === 'graph') {
    return <TreeView focusId={focusId} onSwitchToFamily={handleSwitchToFamily} />;
  }
  return (
    <FamilyView
      focusId={focusId}
      onFocusChange={handleFocusChange}
      onSwitchToGraph={handleSwitchToGraph}
    />
  );
}
