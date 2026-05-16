// Generates PWA icons + favicons from public/icons/icon.svg.
// Single source of truth: icon.svg (Greek capital Μ, dark purple on cream).
// Outputs: icon-192/512.png (PWA), apple-touch-icon.png (iOS), favicon-16/32.png (browser tabs).
import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'icons');
await mkdir(outDir, { recursive: true });

const svg = await readFile(resolve(outDir, 'icon.svg'));

const outputs = [
  { size: 512, name: 'icon-512.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 16, name: 'favicon-16.png' },
];

for (const { size, name } of outputs) {
  const file = resolve(outDir, name);
  await sharp(svg).resize(size, size).png().toFile(file);
  console.log(`  ✓ ${name} (${size}×${size})`);
}
console.log('Done.');
