'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Character } from '@/types/character';
import { allCharacters } from '@/lib/data';
import { db, type Language, type SrsCard } from '@/lib/db';
import { applyReview, newCard, type ReviewQuality } from '@/lib/srs';
import { useSettings } from '@/lib/useSettings';
import { LANGUAGE_LABEL_KO } from '@/lib/i18n';

type QueueItem = { card: SrsCard; character: Character };

const QUALITY_BUTTONS: { quality: ReviewQuality; label: string; tone: string }[] = [
  { quality: 1, label: '다시', tone: 'border-medium hover:bg-accent-hero/10 text-accent-hero' },
  { quality: 3, label: '어려움', tone: 'border-soft hover:bg-bg-elevated' },
  { quality: 4, label: '괜찮음', tone: 'border-soft hover:bg-bg-elevated' },
  { quality: 5, label: '쉬움', tone: 'border-medium hover:bg-accent-olympian/10 text-accent-olympian' },
];

export default function FlashcardsView() {
  const { settings, loaded: settingsLoaded } = useSettings();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);

  const tierCharacters = useMemo<Character[]>(() => {
    const allowedTiers = settings.forceUnlock ? [1, 2, 3] : [1];
    return allCharacters.filter((c) => allowedTiers.includes(c.tier));
  }, [settings.forceUnlock]);

  const buildQueue = useCallback(async () => {
    setLoaded(false);
    await db.transaction('rw', db.cards, async () => {
      const existing = await db.cards.toArray();
      const haveIds = new Set(existing.map((c) => c.characterId));
      const missing = tierCharacters
        .filter((c) => !haveIds.has(c.id))
        .map((c) => newCard(c.id));
      if (missing.length > 0) await db.cards.bulkAdd(missing);
    });
    const charById = new Map(tierCharacters.map((c) => [c.id, c]));
    const cards = await db.cards.toArray();
    const now = Date.now();
    const due = cards
      .filter((c) => charById.has(c.characterId) && c.due <= now)
      .sort((a, b) => a.due - b.due)
      .map<QueueItem>((card) => ({ card, character: charById.get(card.characterId)! }));
    setQueue(due);
    setRevealed(false);
    setLoaded(true);
  }, [tierCharacters]);

  useEffect(() => {
    if (!settingsLoaded) return;
    buildQueue();
  }, [settingsLoaded, buildQueue]);

  async function respond(quality: ReviewQuality) {
    const head = queue[0];
    if (!head?.card.id) return;
    const now = Date.now();
    const updated = applyReview(head.card, quality, now);
    await db.transaction('rw', db.cards, db.attempts, async () => {
      await db.cards.update(head.card.id!, {
        ef: updated.ef,
        interval: updated.interval,
        reps: updated.reps,
        due: updated.due,
        lastReview: updated.lastReview,
      });
      await db.attempts.add({
        characterId: head.character.id,
        mode: 'flashcard',
        correct: quality >= 3,
        timestamp: now,
      });
    });
    setQueue((q) => q.slice(1));
    setRevealed(false);
    setSessionDone((n) => n + 1);
  }

  if (!loaded || !settingsLoaded) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10">
        <p className="text-ink-muted">큐 준비 중…</p>
      </main>
    );
  }

  if (queue.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-2xl font-semibold mb-3">플래시카드</h1>
        <div className="rounded-card border border-soft bg-bg-secondary px-5 py-8 text-center">
          <p className="text-lg mb-2">
            {sessionDone > 0
              ? `이번 세션 ${sessionDone}장 완료`
              : '오늘 복습할 카드가 없어요'}
          </p>
          <p className="text-ink-muted text-sm">다음 due 카드는 진도 페이지에서 확인하세요.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link
              href="/"
              className="rounded-card border border-soft px-4 py-2 hover:bg-bg-elevated"
            >
              홈으로
            </Link>
            <Link
              href="/library"
              className="rounded-card border border-soft px-4 py-2 hover:bg-bg-elevated"
            >
              라이브러리
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { character: c, card } = queue[0];
  const remaining = queue.length;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">플래시카드</h1>
        <span className="text-ink-muted text-sm">
          남은 {remaining} · 완료 {sessionDone}
        </span>
      </header>

      <article
        className={`cat-${c.category} rounded-card border border-soft bg-bg-secondary px-6 py-8 min-h-[16rem] flex flex-col`}
      >
        <div className="text-ink-muted text-xs mb-3">
          {LANGUAGE_LABEL_KO[settings.frontLanguage]}
        </div>
        <FrontName character={c} language={settings.frontLanguage} />

        {revealed && (
          <div className="mt-6 pt-6 border-t border-soft space-y-3 animate-in fade-in">
            <BackLanguages
              character={c}
              front={settings.frontLanguage}
              display={settings.displayLanguages}
            />
            <div className="pt-2">
              <p className="text-ink-muted text-xs mb-1">역할</p>
              <p>{c.role}</p>
            </div>
            {c.symbols.length > 0 && (
              <div>
                <p className="text-ink-muted text-xs mb-1">상징</p>
                <p>{c.symbols.join(' · ')}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-6 text-ink-muted text-xs">
          EF {card.ef.toFixed(2)} · 반복 {card.reps} · interval {card.interval}d
        </div>
      </article>

      <div className="mt-5">
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="w-full rounded-card border border-medium bg-bg-elevated py-3 font-medium hover:bg-bg-secondary"
          >
            정답 보기 (스페이스)
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {QUALITY_BUTTONS.map((b) => (
              <button
                key={b.quality}
                type="button"
                onClick={() => respond(b.quality)}
                className={`rounded-card border bg-bg-elevated py-3 text-sm font-medium ${b.tone}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <KeyboardShortcuts
        revealed={revealed}
        onReveal={() => setRevealed(true)}
        onRespond={respond}
      />
    </main>
  );
}

function FrontName({ character: c, language }: { character: Character; language: Language }) {
  const name = c.names[language];
  const className =
    language === 'grc'
      ? 'font-greek text-3xl'
      : language === 'la'
        ? 'font-latin italic text-3xl'
        : 'text-3xl font-semibold';
  return <div className={className}>{name}</div>;
}

function BackLanguages({
  character: c,
  front,
  display,
}: {
  character: Character;
  front: Language;
  display: Language[];
}) {
  const rows: Array<{ lang: Language; value: string; cls: string }> = [];
  for (const lang of display) {
    if (lang === front) continue;
    const value = c.names[lang];
    if (!value) continue;
    const cls =
      lang === 'grc' ? 'font-greek' : lang === 'la' ? 'font-latin italic' : '';
    rows.push({ lang, value, cls });
  }
  return (
    <dl className="space-y-1">
      {rows.map(({ lang, value, cls }) => (
        <div key={lang} className="grid grid-cols-[4.5rem_1fr] gap-3">
          <dt className="text-ink-muted text-sm">{LANGUAGE_LABEL_KO[lang]}</dt>
          <dd className={cls}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function KeyboardShortcuts({
  revealed,
  onReveal,
  onRespond,
}: {
  revealed: boolean;
  onReveal: () => void;
  onRespond: (q: ReviewQuality) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!revealed) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onReveal();
        }
        return;
      }
      if (e.key === '1') onRespond(1);
      else if (e.key === '2') onRespond(3);
      else if (e.key === '3') onRespond(4);
      else if (e.key === '4') onRespond(5);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [revealed, onReveal, onRespond]);
  return null;
}
