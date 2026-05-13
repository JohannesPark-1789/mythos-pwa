import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Mythos</h1>
        <p className="mt-2 text-ink-secondary">
          그리스로마 신화 등장인물을 한글·영어·그리스어·라틴어로 익히는 학습 도구
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3">진도</h2>
        <div className="rounded-card border border-soft bg-bg-secondary px-5 py-4">
          <p className="text-ink-secondary">Tier 1 · 0 / 30 mastered</p>
          <p className="text-ink-muted text-sm mt-1">학습을 시작하면 진도가 여기에 표시됩니다.</p>
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
