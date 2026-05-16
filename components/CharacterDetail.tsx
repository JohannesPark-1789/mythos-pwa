'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import type { Character } from '@/types/character';
import { characterName } from '@/lib/data';

type Props = {
  character: Character;
  onClose: () => void;
};

function RelationRow({ label, ids }: { label: string; ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-3 py-1">
      <dt className="text-ink-muted text-sm">{label}</dt>
      <dd className="text-sm">{ids.map(characterName).join(', ')}</dd>
    </div>
  );
}

export default function CharacterDetail({ character: c, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`cat-${c.category} w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-card sm:rounded-card border border-medium bg-bg-elevated`}
      >
        <header className="sticky top-0 bg-bg-elevated border-b border-soft px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{c.names.ko}</h2>
            <p className="text-ink-muted text-sm mt-0.5">
              {c.category} · Tier {c.tier} · 난이도 {c.difficulty}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-ink-muted hover:text-ink-primary text-2xl leading-none px-2"
          >
            ×
          </button>
        </header>

        <div className="px-6 py-5 space-y-5">
          <section>
            <h3 className="text-sm text-ink-muted mb-2">이름</h3>
            <dl className="space-y-1">
              <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <dt className="text-ink-muted text-sm">한국어</dt>
                <dd>{c.names.ko}</dd>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <dt className="text-ink-muted text-sm">English</dt>
                <dd>{c.names.en}</dd>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <dt className="text-ink-muted text-sm">그리스어</dt>
                <dd className="font-greek">
                  {c.names.grc}{' '}
                  <span className="text-ink-muted text-sm">({c.names.grc_translit})</span>
                </dd>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <dt className="text-ink-muted text-sm">라틴어</dt>
                <dd className="font-latin italic">{c.names.la}</dd>
              </div>
              {c.names.la_note && (
                <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                  <dt className="text-ink-muted text-sm">메모</dt>
                  <dd className="text-ink-muted text-sm">{c.names.la_note}</dd>
                </div>
              )}
            </dl>
          </section>

          <section>
            <h3 className="text-sm text-ink-muted mb-1">역할</h3>
            <p>{c.role}</p>
          </section>

          {c.domains.length > 0 && (
            <section>
              <h3 className="text-sm text-ink-muted mb-1">영역</h3>
              <p>{c.domains.join(' · ')}</p>
            </section>
          )}

          {c.symbols.length > 0 && (
            <section>
              <h3 className="text-sm text-ink-muted mb-1">상징</h3>
              <p>{c.symbols.join(' · ')}</p>
            </section>
          )}

          {(c.family.parents.length ||
            c.family.consorts.length ||
            c.family.children.length ||
            c.family.siblings.length) > 0 && (
            <section>
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="text-sm text-ink-muted">가족</h3>
                <Link
                  href={`/tree?focus=${c.id}&view=family`}
                  onClick={onClose}
                  className="rounded-card border border-soft bg-bg-secondary px-2.5 py-1 text-xs text-ink-secondary hover:bg-bg-primary"
                >
                  이 인물 중심으로 계보 보기 →
                </Link>
              </div>
              <dl>
                <RelationRow label="부모" ids={c.family.parents} />
                <RelationRow label="배우자" ids={c.family.consorts} />
                <RelationRow label="자녀" ids={c.family.children} />
                <RelationRow label="형제자매" ids={c.family.siblings} />
              </dl>
            </section>
          )}

          {c.story_hooks.length > 0 && (
            <section>
              <h3 className="text-sm text-ink-muted mb-1">이야기 훅</h3>
              <ul className="list-disc list-inside space-y-1">
                {c.story_hooks.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
