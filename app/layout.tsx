import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import NavBar from '@/components/NavBar';

const basePath = '/mythos-pwa';

const pretendard = localFont({
  src: '../public/fonts/Pretendard-Variable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

const notoSerif = localFont({
  src: [
    { path: '../public/fonts/NotoSerif-Greek-400.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/NotoSerif-Greek-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-noto-serif',
  display: 'swap',
});

const garamond = localFont({
  src: [
    { path: '../public/fonts/EBGaramond-400.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/EBGaramond-600.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/EBGaramond-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-garamond',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mythos — 그리스로마 신화 학습',
  description: '그리스로마 신화 등장인물 200+명을 4개 언어로 학습하는 PWA',
  manifest: `${basePath}/manifest.json`,
  icons: {
    icon: [
      { url: `${basePath}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { url: `${basePath}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: `${basePath}/icons/icon-192.png`, sizes: '192x192' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${notoSerif.variable} ${garamond.variable}`}
    >
      <body className="font-sans bg-bg-primary text-ink-primary">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
