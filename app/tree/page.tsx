import { Suspense } from 'react';
import TreePane from '@/components/TreePane';

export default function TreePage() {
  return (
    <Suspense fallback={null}>
      <TreePane />
    </Suspense>
  );
}
