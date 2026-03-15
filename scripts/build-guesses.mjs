// Downloads the ENABLE word list and writes src/data/guesses.json
// ENABLE: ~172k curated English words, public domain, standard for word games.
// Run with: node scripts/build-guesses.mjs

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath   = path.join(__dirname, '../src/data/guesses.json');

const URL = 'https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt';

console.log('Fetching ENABLE word list...');
const res  = await fetch(URL);
const text = await res.text();

const words = text
  .split('\n')
  .map(w => w.trim().toUpperCase())
  .filter(w => /^[A-Z]+$/.test(w) && w.length >= 2); // 2+ letters, alpha only

console.log(`${words.length} words fetched.`);
writeFileSync(outPath, JSON.stringify(words, null, 0) + '\n');
console.log(`Written to ${outPath}`);
