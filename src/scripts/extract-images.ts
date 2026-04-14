/**
 * Extracts base64-encoded images from index.html and writes them to:
 *   public/images/houses/{slug}/{slug}-NN.jpg   — per-house galleries (from CASA_IMGS)
 *   public/images/hero.jpg                       — hero background
 *   public/images/about.jpg                      — about section image
 *   public/images/retreats-bg.jpg                — retreats section background
 *   public/images/common/area-NN.jpg             — common area images (from AREA_IMGS)
 *
 * Usage: bun run extract-images
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const htmlPath = join(root, 'index.html');

console.log('Reading index.html …');
const html = readFileSync(htmlPath, 'utf8');

// ─── Helper: extract all base64 data URIs from a string slice ───────────────
function extractImagesFromSlice(slice: string): Buffer[] {
  const re = /data:image\/(?:jpeg|jpg|webp|png);base64,([A-Za-z0-9+/]+=*)/g;
  const results: Buffer[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(slice)) !== null) {
    results.push(Buffer.from(m[1]!, 'base64'));
  }
  return results;
}

// ─── Extract house images from CASA_IMGS ────────────────────────────────────
const houseOrder = ['celeiro', 'margarida', 'francisco', 'cabana', 'caseiro', 'palheiro'];

// Find the CASA_IMGS block
const casaMarker = 'CASA_IMGS';
const casaPos = html.indexOf(casaMarker);
if (casaPos === -1) throw new Error('CASA_IMGS not found in index.html');

// Find the matching closing brace of the CASA_IMGS object literal
const casaObjStart = html.indexOf('{', casaPos);
let casaObjEnd = casaObjStart;
{
  let depth = 0;
  for (let i = casaObjStart; i < Math.min(html.length, casaObjStart + 16_000_000); i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') {
      depth--;
      if (depth === 0) { casaObjEnd = i + 1; break; }
    }
  }
}

const casaWindowStart = casaObjStart;
const casaWindow = html.slice(casaWindowStart, casaObjEnd);

console.log('\nExtracting house images …');

for (const slug of houseOrder) {
  // Find this house's key inside the window
  const keyPattern = `"${slug}"`;
  const keyOffset = casaWindow.indexOf(keyPattern);
  if (keyOffset === -1) {
    console.warn(`  ⚠  "${slug}" key not found in CASA_IMGS`);
    continue;
  }

  // Find the next house's key (or end of CASA_IMGS) to bound this slice
  let nextOffset = casaWindow.length;
  for (const otherSlug of houseOrder) {
    if (otherSlug === slug) continue;
    const otherKey = `"${otherSlug}"`;
    const pos = casaWindow.indexOf(otherKey, keyOffset + keyPattern.length);
    if (pos !== -1 && pos < nextOffset) nextOffset = pos;
  }

  const houseSlice = casaWindow.slice(keyOffset, nextOffset);
  const buffers = extractImagesFromSlice(houseSlice);

  if (buffers.length === 0) {
    console.warn(`  ⚠  No images found for "${slug}"`);
    continue;
  }

  // Apply reorderFirst('cabana', 4): move 0-based index 4 to the front
  if (slug === 'cabana' && buffers.length > 4) {
    const [moved] = buffers.splice(4, 1);
    buffers.unshift(moved!);
  }

  const outDir = join(root, 'public', 'images', 'houses', slug);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < buffers.length; i++) {
    const filename = `${slug}-${String(i + 1).padStart(2, '0')}.jpg`;
    writeFileSync(join(outDir, filename), buffers[i]!);
  }

  console.log(`  ✓  ${slug}: ${buffers.length} images → public/images/houses/${slug}/`);
}

// ─── Extract common area images from AREA_IMGS ───────────────────────────────
console.log('\nExtracting area images …');

const areaMarker = 'AREA_IMGS';
const areaPos = html.indexOf(areaMarker);
if (areaPos !== -1) {
  // Slice from AREA_IMGS to a reasonable bound
  const areaWindowEnd = Math.min(html.length, areaPos + 8_000_000);
  const areaSliceStart = html.indexOf('[', areaPos);
  const areaSliceEnd = areaWindowEnd;
  const areaSlice = html.slice(areaSliceStart, areaSliceEnd);

  // Only read up to the closing bracket of the array
  const closingBracket = areaSlice.indexOf('];');
  const areaContent = closingBracket !== -1 ? areaSlice.slice(0, closingBracket) : areaSlice.slice(0, 2_000_000);

  const areaBuffers = extractImagesFromSlice(areaContent);
  const areaOutDir = join(root, 'public', 'images', 'common');
  mkdirSync(areaOutDir, { recursive: true });

  for (let i = 0; i < areaBuffers.length; i++) {
    const filename = `area-${String(i + 1).padStart(2, '0')}.jpg`;
    writeFileSync(join(areaOutDir, filename), areaBuffers[i]!);
  }

  console.log(`  ✓  common area: ${areaBuffers.length} images → public/images/common/`);
} else {
  console.warn('  ⚠  AREA_IMGS not found');
}

// ─── Extract named section images ───────────────────────────────────────────
// Strategy: find the first N sequential data URIs in the HTML *before* CASA_IMGS.
// These are the non-gallery images (hero bg, about, retreats-bg, etc.)
console.log('\nExtracting section images …');

const preGallerySlice = html.slice(0, casaPos);
const sectionBuffers = extractImagesFromSlice(preGallerySlice);

console.log(`  Found ${sectionBuffers.length} images before CASA_IMGS`);

// Map by position — adjust indices if your index.html order differs.
// We'll write them all to public/images/section-NN.jpg for inspection,
// then also try to identify hero and about by largest size heuristic.
const sectionOutDir = join(root, 'public', 'images');
mkdirSync(sectionOutDir, { recursive: true });

// Write all section images with sequential names so you can inspect them
for (let i = 0; i < sectionBuffers.length; i++) {
  const filename = `section-${String(i + 1).padStart(2, '0')}.jpg`;
  writeFileSync(join(sectionOutDir, filename), sectionBuffers[i]!);
}

// Hero image: first data URI in the HTML (embedded in .hero-bg CSS at line 31)
const heroIdx = 0;
if (sectionBuffers[heroIdx]) {
  writeFileSync(join(sectionOutDir, 'hero.jpg'), sectionBuffers[heroIdx]!);
  console.log(`  ✓  hero.jpg ← section image #1 (${((sectionBuffers[heroIdx]?.length ?? 0) / 1024).toFixed(0)} KB)`);
}

// About and retreats-bg: identified by size among the remaining images
const sorted = sectionBuffers
  .map((buf, i) => ({ i, size: buf.length }))
  .filter(x => x.i !== heroIdx)
  .sort((a, b) => b.size - a.size);

if (sorted[0] && sectionBuffers[sorted[0].i]) {
  writeFileSync(join(sectionOutDir, 'about.jpg'), sectionBuffers[sorted[0].i]!);
  console.log(`  ✓  about.jpg ← section image #${sorted[0].i + 1} (${(sorted[0].size / 1024).toFixed(0)} KB)`);
}

if (sorted[1] && sectionBuffers[sorted[1].i]) {
  writeFileSync(join(sectionOutDir, 'retreats-bg.jpg'), sectionBuffers[sorted[1].i]!);
  console.log(`  ✓  retreats-bg.jpg ← section image #${sorted[1].i + 1} (${(sorted[1].size / 1024).toFixed(0)} KB)`);
}

console.log('\n✓ Done.');
console.log('  Inspect public/images/section-NN.jpg to verify hero/about/retreats-bg assignments.');
console.log('  Rename manually if the heuristic picked wrong images.');
