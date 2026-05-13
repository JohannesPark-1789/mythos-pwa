'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PAGE_TITLE: Record<string, string> = {
  '/library': '라이브러리',
  '/flashcards': '플래시카드',
  '/quiz': '퀴즈',
  '/tree': '계보도',
  '/settings': '설정',
};

export default function NavBar() {
  const pathname = usePathname() ?? '/';
  const normalized = pathname.replace(/\/$/, '') || '/';
  if (normalized === '/') return null;

  return (
    <nav className="sticky top-0 z-30 border-b border-soft bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-5 py-2.5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary"
          aria-label="홈으로"
        >
          <span aria-hidden className="text-base leading-none">←</span>
          <span>홈</span>
        </Link>
        <span className="text-ink-muted text-sm">{PAGE_TITLE[normalized] ?? ''}</span>
        <Link
          href="/settings"
          className={`text-sm ${
            normalized === '/settings' ? 'text-ink-muted' : 'text-ink-secondary hover:text-ink-primary'
          }`}
          aria-label="설정"
        >
          설정
        </Link>
      </div>
    </nav>
  );
}
