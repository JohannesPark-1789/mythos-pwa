'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Character } from '@/types/character';
import { allCharacters } from '@/lib/data';
import { db } from '@/lib/db';
import { generateQuestion, langClass, type Question, type QuizOption } from '@/lib/quiz';
import { useSettings } from '@/lib/useSettings';

const SESSION_LENGTH = 10;

type SessionState = {
  question: Question | null;
  index: number;
  correctCount: number;
  selected: QuizOption | null;
};

const MODE_LABEL: Record<string, string> = {
  lang_match: '언어 매칭',
  reverse_lang: '역방향 매칭',
  role: '역할 → 인물',
  symbol: '상징 → 인물',
  family: '가족관계',
};

export default function QuizView() {
  const { settings, loaded: settingsLoaded } = useSettings();

  const pool = useMemo<Character[]>(() => {
    const allowedTiers = settings.forceUnlock ? [1, 2, 3] : [1];
    return allCharacters.filter((c) => allowedTiers.includes(c.tier));
  }, [settings.forceUnlock]);

  const [state, setState] = useState<SessionState>({
    question: null,
    index: 0,
    correctCount: 0,
    selected: null,
  });

  const nextQuestion = useCallback(() => {
    setState((s) => ({
      question: generateQuestion(pool),
      index: s.index + 1,
      correctCount: s.correctCount,
      selected: null,
    }));
  }, [pool]);

  // Start session when settings load
  useEffect(() => {
    if (!settingsLoaded) return;
    setState({
      question: generateQuestion(pool),
      index: 1,
      correctCount: 0,
      selected: null,
    });
  }, [settingsLoaded, pool]);

  async function choose(opt: QuizOption) {
    if (state.selected || !state.question) return;
    const correct = opt.correct;
    setState((s) => ({ ...s, selected: opt, correctCount: s.correctCount + (correct ? 1 : 0) }));
    await db.attempts.add({
      characterId: state.question.targetCharacterId,
      mode: state.question.mode,
      correct,
      timestamp: Date.now(),
    });
  }

  function next() {
    if (state.index >= SESSION_LENGTH) {
      // Done — keep state so the result screen renders.
      setState((s) => ({ ...s, question: null }));
      return;
    }
    nextQuestion();
  }

  function restart() {
    setState({
      question: generateQuestion(pool),
      index: 1,
      correctCount: 0,
      selected: null,
    });
  }

  if (!settingsLoaded || !state.question) {
    const done = state.index >= SESSION_LENGTH && !state.question;
    if (done) {
      const pct = Math.round((state.correctCount / SESSION_LENGTH) * 100);
      return (
        <main className="mx-auto max-w-2xl px-5 py-10">
          <h1 className="text-2xl font-semibold mb-4">퀴즈 완료</h1>
          <div className="rounded-card border border-soft bg-bg-secondary px-5 py-8 text-center">
            <p className="text-4xl font-semibold mb-2">
              {state.correctCount} / {SESSION_LENGTH}
            </p>
            <p className="text-ink-muted mb-6">{pct}% 정답</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={restart}
                className="rounded-card border border-medium bg-bg-elevated px-4 py-2 hover:bg-bg-secondary"
              >
                다시 풀기
              </button>
              <Link
                href="/"
                className="rounded-card border border-soft px-4 py-2 hover:bg-bg-elevated"
              >
                홈으로
              </Link>
            </div>
          </div>
        </main>
      );
    }
    return (
      <main className="mx-auto max-w-2xl px-5 py-10">
        <p className="text-ink-muted">준비 중…</p>
      </main>
    );
  }

  const q = state.question;
  const selected = state.selected;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">퀴즈</h1>
        <span className="text-ink-muted text-sm">
          {state.index} / {SESSION_LENGTH} · 정답 {state.correctCount}
        </span>
      </header>

      <article className="rounded-card border border-soft bg-bg-secondary px-6 py-6">
        <div className="text-ink-muted text-xs mb-1">{MODE_LABEL[q.mode]}</div>
        {q.hint && <p className="text-ink-muted text-sm mb-3">{q.hint}</p>}
        <p
          className={`text-2xl font-medium ${q.promptLang ? langClass(q.promptLang) : ''}`}
        >
          {q.prompt}
        </p>
      </article>

      <ul className="mt-5 grid grid-cols-1 gap-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === opt;
          const showCorrect = selected !== null && opt.correct;
          const showWrong = isSelected && !opt.correct;
          const cls = [
            'w-full text-left rounded-card border px-4 py-3 transition-colors',
            opt.lang ? langClass(opt.lang) : '',
            !selected
              ? 'border-soft bg-bg-elevated hover:bg-bg-secondary cursor-pointer'
              : showCorrect
                ? 'border-medium bg-accent-olympian/10 text-accent-olympian'
                : showWrong
                  ? 'border-medium bg-accent-hero/10 text-accent-hero'
                  : 'border-soft bg-bg-elevated opacity-60',
          ].join(' ');
          return (
            <li key={i}>
              <button
                type="button"
                disabled={selected !== null}
                onClick={() => choose(opt)}
                className={cls}
              >
                {opt.text}
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div className="mt-5 flex items-center justify-between">
          <p className={selected.correct ? 'text-accent-olympian' : 'text-accent-hero'}>
            {selected.correct ? '정답!' : '아쉽네요.'}
          </p>
          <button
            type="button"
            onClick={next}
            className="rounded-card border border-medium bg-bg-elevated px-4 py-2 hover:bg-bg-secondary"
          >
            {state.index >= SESSION_LENGTH ? '결과 보기' : '다음'}
          </button>
        </div>
      )}
    </main>
  );
}
