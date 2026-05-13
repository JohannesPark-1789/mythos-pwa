'use client';
import { useState } from 'react';
import { useSettings } from '@/lib/useSettings';
import { resetAllProgress, type FontSize, type Language } from '@/lib/db';
import { LANGUAGE_LABEL_KO } from '@/lib/i18n';

const LANG_OPTIONS: Language[] = ['ko', 'en', 'grc', 'la'];
const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'small', label: '작게' },
  { value: 'normal', label: '보통' },
  { value: 'large', label: '크게' },
];

export default function SettingsView() {
  const { settings, loaded, update } = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!loaded) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-ink-muted">불러오는 중…</p>
      </main>
    );
  }

  async function toggleDisplayLanguage(lang: Language) {
    const has = settings.displayLanguages.includes(lang);
    const next = has
      ? settings.displayLanguages.filter((l) => l !== lang)
      : [...settings.displayLanguages, lang];
    if (next.length === 0) return; // 최소 1개 유지
    await update({ displayLanguages: next });
  }

  async function doReset() {
    setResetting(true);
    try {
      await resetAllProgress();
      setConfirmReset(false);
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">설정</h1>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-medium mb-3">플래시카드 앞면 언어</h2>
          <p className="text-ink-muted text-sm mb-3">
            카드를 처음 볼 때 보이는 언어를 고르세요.
          </p>
          <div className="flex flex-wrap gap-2">
            {LANG_OPTIONS.map((lang) => {
              const active = settings.frontLanguage === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => update({ frontLanguage: lang })}
                  className={chipClass(active)}
                >
                  {LANGUAGE_LABEL_KO[lang]}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">뒷면 표시 언어</h2>
          <p className="text-ink-muted text-sm mb-3">
            정답 면에 함께 보일 언어를 모두 고르세요 (최소 1개).
          </p>
          <div className="flex flex-wrap gap-2">
            {LANG_OPTIONS.filter((l) => l !== settings.frontLanguage).map((lang) => {
              const active = settings.displayLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleDisplayLanguage(lang)}
                  className={chipClass(active)}
                >
                  {LANGUAGE_LABEL_KO[lang]}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">본문 글자 크기</h2>
          <div className="flex flex-wrap gap-2">
            {FONT_SIZE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ fontSize: value })}
                className={chipClass(settings.fontSize === value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">티어 강제 해제</h2>
          <p className="text-ink-muted text-sm mb-3">
            기본 OFF. 켜면 마스터리 조건(85% interval ≥ 7일 + 정답률 80%) 없이 Tier 2/3에 접근합니다.
          </p>
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.forceUnlock}
              onChange={(e) => update({ forceUnlock: e.target.checked })}
              className="h-4 w-4 accent-accent-olympian"
            />
            <span>{settings.forceUnlock ? 'ON' : 'OFF'}</span>
          </label>
        </section>

        <section className="border-t border-soft pt-6">
          <h2 className="text-lg font-medium mb-3">학습 데이터 초기화</h2>
          <p className="text-ink-muted text-sm mb-3">
            SRS 카드, 응답 기록, 티어 진도를 모두 지웁니다. 인물 데이터와 설정은 유지됩니다.
          </p>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-card border border-soft px-4 py-2 hover:bg-bg-secondary"
            >
              초기화…
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={doReset}
                disabled={resetting}
                className="rounded-card border border-medium bg-accent-hero text-bg-elevated px-4 py-2 disabled:opacity-50"
              >
                {resetting ? '지우는 중…' : '정말 지우기'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                disabled={resetting}
                className="rounded-card border border-soft px-4 py-2 hover:bg-bg-secondary"
              >
                취소
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function chipClass(active: boolean): string {
  return [
    'rounded-full border px-4 py-1.5 text-sm transition-colors',
    active
      ? 'border-medium bg-bg-elevated'
      : 'border-soft bg-transparent hover:bg-bg-secondary',
  ].join(' ');
}
