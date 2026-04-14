/**
 * Extracts all base64-encoded images from index.html and writes them
 * as individual files under public/images/.
 *
 * Usage: bun run src/scripts/extract-images.ts
 *
 * Output mapping is written to src/scripts/extracted-images.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const htmlPath = join(root, 'index.html');
const outDir = join(root, 'public', 'images', 'extracted');

mkdirSync(outDir, { recursive: true });

console.log('Reading index.html …');
const html = readFileSync(htmlPath, 'utf8');

// Match all data URIs in src="..." and url('...')
const dataUriRe = /data:(image\/(?:jpeg|webp|png|gif));base64,([A-Za-z0-9+/=]+)/g;

const mapping: Record<string, string> = {};
let match: RegExpExecArray | null;
let count = 0;

while ((match = dataUriRe.exec(html)) !== null) {
  const mimeType = match[1];
  const b64 = match[2];
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const filename = `img-${String(count).padStart(3, '0')}.${ext}`;
  const outPath = join(outDir, filename);

  writeFileSync(outPath, Buffer.from(b64, 'base64'));
  mapping[filename] = mimeType;
  count++;

  if (count % 10 === 0) process.stdout.write(`\r  ${count} images extracted…`);
}

console.log(`\n✓ Extracted ${count} images to public/images/extracted/`);
writeFileSync(
  join(__dirname, 'extracted-images.json'),
  JSON.stringify(mapping, null, 2),
);
console.log('✓ Mapping written to src/scripts/extracted-images.json');
