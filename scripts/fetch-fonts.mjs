// Downloads self-hosted fonts into public/fonts/.
// Sources:
//   - Pretendard Variable: github.com/orioncactus/pretendard (OFL)
//   - Noto Serif (Greek subset): Google Fonts (OFL)
//   - EB Garamond: Google Fonts (OFL)
// Run: npm run fetch:fonts
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'fonts');
await mkdir(outDir, { recursive: true });

const UA_WOFF2 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0 Safari/537.36';

async function dl(url, dest, headers = {}) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`  ✓ ${dest}  (${(buf.length / 1024).toFixed(1)} kB)`);
}

async function googleCssUrls(family, subset) {
  // Google Fonts API rejects URL-encoded '+' and ':'. Build query string manually.
  const parts = [`family=${family}`];
  if (subset) parts.push(`subset=${subset}`);
  parts.push('display=swap');
  const url = `https://fonts.googleapis.com/css2?${parts.join('&')}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA_WOFF2 } });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  const css = await r.text();
  const urls = [...css.matchAll(/url\((https:[^)]+\.woff2)\)/g)].map((m) => m[1]);
  return [...new Set(urls)];
}

// ---- Pretendard Variable ----
const PRETENDARD =
  'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2';
await dl(PRETENDARD, resolve(outDir, 'Pretendard-Variable.woff2'));

// ---- Noto Serif (Greek subset) ----
const notoUrls = await googleCssUrls('Noto+Serif:wght@400;700', 'greek');
if (notoUrls.length === 0) throw new Error('Noto Serif: no woff2 URL found');
// Take first (regular). For 700, take second if present.
await dl(notoUrls[0], resolve(outDir, 'NotoSerif-Greek-400.woff2'), { 'User-Agent': UA_WOFF2 });
if (notoUrls[1]) {
  await dl(notoUrls[1], resolve(outDir, 'NotoSerif-Greek-700.woff2'), { 'User-Agent': UA_WOFF2 });
}

// ---- EB Garamond ----
const ebUrls = await googleCssUrls('EB+Garamond:ital,wght@0,400;0,600;1,400');
if (ebUrls.length === 0) throw new Error('EB Garamond: no woff2 URL found');
await dl(ebUrls[0], resolve(outDir, 'EBGaramond-400.woff2'), { 'User-Agent': UA_WOFF2 });
if (ebUrls[1]) {
  await dl(ebUrls[1], resolve(outDir, 'EBGaramond-600.woff2'), { 'User-Agent': UA_WOFF2 });
}
if (ebUrls[2]) {
  await dl(ebUrls[2], resolve(outDir, 'EBGaramond-400-italic.woff2'), { 'User-Agent': UA_WOFF2 });
}

console.log('Done.');
