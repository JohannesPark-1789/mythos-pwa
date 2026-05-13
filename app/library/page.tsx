import dataset from '@/data/characters.json';
import type { CharacterDataset } from '@/types/character';

const data = dataset as CharacterDataset;

export default function LibraryPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">라이브러리</h1>
        <p className="text-ink-secondary mt-1">
          Tier {data.tier} · {data.characters.length}명
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.characters.map((c) => (
          <li
            key={c.id}
            className={`cat-${c.category} rounded-card border border-soft bg-bg-secondary px-4 py-3`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{c.names.ko}</span>
              <span className="text-ink-muted text-sm">{c.category}</span>
            </div>
            <div className="text-ink-secondary text-sm mt-1">{c.names.en}</div>
            <div className="font-greek text-ink-secondary text-sm mt-1">{c.names.grc}</div>
            <div className="font-latin italic text-ink-muted text-sm mt-1">{c.names.la}</div>
            <p className="text-ink-muted text-sm mt-2 line-clamp-2">{c.role}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
