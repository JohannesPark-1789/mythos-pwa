'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { allCharacters } from '@/lib/data';
import {
  evaluateUnlock,
  MASTERY_RATIO,
  RECENT_ACCURACY,
  RECENT_ATTEMPTS,
  type UnlockEval,
} from '@/lib/progression';
import { useSettings } from '@/lib/useSettings';

type Stats = {
  tier1Total: number;
  tier1Mastered: number;
  dueToday: number;
  unlock: UnlockEval;
  loaded: boolean;
};

const INITIAL_STATS: Stats = {
  tier1Total: allCharacters.filter((c) => c.tier === 1).length,
  tier1Mastered: 0,
  dueToday: 0,
  unlock: {
    tier: 1,
    totalCards: allCharacters.filter((c) => c.tier === 1).length,
    mastered: 0,
    masteryRatio: 0,
    accuracy: 0,
    accuracySampleSize: 0,
    meetsMastery: false,
    meetsAccuracy: false,
    unlocked: false,
  },
  loaded: false,
};

export default function HomeView() {
  const { settings } = useSettings();
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cards = await db.cards.toArray();
      const attempts = await db.attempts.orderBy('timestamp').toArray();
      const tier1Eval = evaluateUnlock(1, cards, attempts, settings.forceUnlock);
      const now = Date.now();
      const dueToday = cards.filter((c) => c.due <= now).length;
      if (cancelled) return;
      setStats({
        tier1Total: tier1Eval.totalCards,
        tier1Mastered: tier1Eval.mastered,
        dueToday,
        unlock: tier1Eval,
        loaded: true,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [settings.forceUnlock]);

  const masteryPct = Math.round(stats.unlock.masteryRatio * 100);
  const accuracyPct = Math.round(stats.unlock.accuracy * 100);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Mythos</h1>
        <p className="mt-2 text-ink-secondary">
          그리스로마 신화 등장인물을 한글·영어·그리스어·라틴어로 익히는 학습 도구
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-3">진도</h2>
        <div className="rounded-card border border-soft bg-bg-secondary px-5 py-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-ink-secondary">Tier 1</span>
            <span className="font-medium">
              {stats.tier1Mastered} / {stats.tier1Total} mastered
            </span>
          </div>
          <ProgressBar
            label={`마스터리 ${masteryPct}% (목표 ${Math.round(MASTERY_RATIO * 100)}%)`}
            value={stats.unlock.masteryRatio}
            target={MASTERY_RATIO}
            met={stats.unlock.meetsMastery}
          />
          <ProgressBar
            label={`최근 ${stats.unlock.accuracySampleSize}/${RECENT_ATTEMPTS}문제 정답률 ${accuracyPct}% (목표 ${Math.round(RECENT_ACCURACY * 100)}%)`}
            value={stats.unlock.accuracy}
            target={RECENT_ACCURACY}
            met={stats.unlock.meetsAccuracy}
          />
          <p className="text-ink-muted text-sm">
            {stats.unlock.unlocked
              ? settings.forceUnlock
                ? 'Tier 2 강제 해제됨 (설정에서 OFF 가능, Tier 2 데이터는 Phase 7에서 추가)'
                : 'Tier 2 해제 조건 충족! 다음 티어 데이터 추가 대기 중.'
              : 'Tier 2 해제까지 두 조건 모두 충족 필요.'}
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3">오늘 복습</h2>
        <div className="rounded-card border border-soft bg-bg-secondary px-5 py-4">
          <p className="text-ink-secondary">
            {stats.loaded ? (
              stats.dueToday > 0 ? (
                <>
                  <span className="font-medium text-ink-primary">{stats.dueToday}장</span>이
                  기다리고 있습니다.
                </>
              ) : (
                '오늘 복습할 카드가 없어요.'
              )
            ) : (
              '계산 중…'
            )}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">학습 모드</h2>
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ModeLink href="/library" label="라이브러리" desc="인물 둘러보기" />
          <ModeLink href="/flashcards" label="플래시카드" desc="SRS 복습" />
          <ModeLink href="/quiz" label="퀴즈" desc="4지선다" />
          <ModeLink href="/tree" label="계보도" desc="가족관계 시각화" />
        </nav>
      </section>

      <footer className="mt-12 text-ink-muted text-sm">
        <Link href="/settings" className="underline underline-offset-4 hover:text-ink-secondary">
          설정
        </Link>
      </footer>
    </main>
  );
}

function ProgressBar({
  label,
  value,
  target,
  met,
}: {
  label: string;
  value: number;
  target: number;
  met: boolean;
}) {
  const pct = Math.min(100, Math.round(value * 100));
  const targetPct = Math.round(target * 100);
  return (
    <div>
      <p className="text-ink-muted text-xs mb-1.5">{label}</p>
      <div className="relative h-1.5 rounded-full bg-bg-elevated border border-soft overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${met ? 'bg-accent-olympian' : 'bg-ink-muted'}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute inset-y-0 w-px bg-ink-muted/40"
          style={{ left: `${targetPct}%` }}
          aria-label="target"
        />
      </div>
    </div>
  );
}

function ModeLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="block rounded-card border border-soft bg-bg-secondary px-5 py-4 transition-colors hover:bg-bg-elevated"
    >
      <div className="font-medium">{label}</div>
      <div className="text-ink-muted text-sm mt-1">{desc}</div>
    </Link>
  );
}
