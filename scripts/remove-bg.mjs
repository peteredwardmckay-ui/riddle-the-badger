// Removes baked-in checkerboard artifacts from GIMP's Color to Alpha export.
// Pixels that are nearly transparent (alpha < 64) AND unsaturated (all channels < 80)
// are noise from the background — zero them out completely.
// Usage: node scripts/remove-bg.mjs
import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(__dirname, '../src/assets/riddle');

// Light mode images: black art on white background — remove near-white pixels
const LIGHT_FILES = [
  'Riddle-the-badger.png',
  'Riddle-the-badger-burrow.png',
  'Riddle-the-badger-Win.png',
  'Riddle-the-badger-Loss.png',
  'Riddle-the-badger-Win-darkmode.png',
  'Riddle-the-badger-Loss-darkmode.png',
];

// Dark mode images: white art on solid black background — remove near-black pixels
const DARK_FILES = [
  'Riddle-the-badger-darkmode.png',
  'Riddle-the-badger-burrow-darkmode.png',
];

const FILES = [
  ...LIGHT_FILES.map(f => ({ file: f, bg: 'white' })),
  ...DARK_FILES.map(f => ({ file: f, bg: 'black' })),
];

for (const { file, bg } of FILES) {
  const path = resolve(ASSETS, file);
  const image = sharp(path);
  const { width, height } = await image.metadata();

  const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];

    if (bg === 'black') {
      // White art on black background — zero out near-black pixels (the background)
      if (r < 30 && g < 30 && b < 30) {
        pixels[i + 3] = 0;
      }
    } else {
      // Black art on white background — remove checkerboard artifacts and near-white pixels
      if (a < 64 && r < 80 && g < 80 && b < 80) {
        pixels[i + 3] = 0;
      }
      const whiteness = Math.min(r, g, b);
      if (whiteness > 200) {
        pixels[i + 3] = 0;
      }
    }
  }

  await sharp(Buffer.from(pixels), { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path);

  console.log(`✓ ${file}`);
}
