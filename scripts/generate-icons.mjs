// Generates placeholder PWA icons (192/512) from an inline SVG.
// Cream background, dark gold Ω — matches the design system.
// Replace later with a real mark.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'icons');
await mkdir(outDir, { recursive: true });

const svg = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#FAF7F2"/>
  <text x="50%" y="54%"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${Math.round(size * 0.6)}"
        font-weight="600"
        fill="#B8860B"
        text-anchor="middle"
        dominant-baseline="middle">Ω</text>
</svg>`;

const sizes = [192, 512];
for (const size of sizes) {
  const file = resolve(outDir, `icon-${size}.png`);
  await sharp(Buffer.from(svg(size))).png().toFile(file);
  console.log(`  ✓ ${file}`);
}
console.log('Done.');
