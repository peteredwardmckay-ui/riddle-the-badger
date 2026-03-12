// Removes baked-in checkerboard artifacts from GIMP's Color to Alpha export.
// Pixels that are nearly transparent (alpha < 64) AND unsaturated (all channels < 80)
// are noise from the background — zero them out completely.
// Usage: node scripts/remove-bg.mjs
import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(__dirname, '../src/assets/riddle');

const FILES = [
  'Riddle-the-badger.png',
  'Riddle-the-badger-burrow.png',
  'Riddle-the-badger-darkmode.png',
  'Riddle-the-badger-burrow-darkmode.png',
];

for (const file of FILES) {
  const path = resolve(ASSETS, file);
  const image = sharp(path);
  const { width, height } = await image.metadata();

  const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];

    // Wipe out residual background noise:
    // low alpha AND low saturation (grey/dark) = checkerboard artifact
    if (a < 64 && r < 80 && g < 80 && b < 80) {
      pixels[i + 3] = 0;
    }

    // Also wipe near-white pixels that still have opacity
    const whiteness = Math.min(r, g, b);
    if (whiteness > 200 && a < 200) {
      pixels[i + 3] = 0;
    }
  }

  await sharp(Buffer.from(pixels), { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path);

  console.log(`✓ ${file}`);
}
