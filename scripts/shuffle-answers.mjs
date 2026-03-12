// One-shot script: shuffles each length group independently, preserving
// the 4-5-6-7-8-9 interleave pattern so daily difficulty still varies.
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath  = path.join(__dirname, '../src/data/answers.json');

const words = JSON.parse(readFileSync(filePath, 'utf8'));

// Split into 6 length-based buckets (original order: col 0=4-letter, col 1=5-letter, ...)
const NUM_LENGTHS = 6;
const buckets = Array.from({ length: NUM_LENGTHS }, () => []);
words.forEach((word, i) => buckets[i % NUM_LENGTHS].push(word));

// Fisher-Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

buckets.forEach(shuffle);

// Re-interleave
const result = [];
for (let row = 0; row < buckets[0].length; row++) {
  for (let col = 0; col < NUM_LENGTHS; col++) {
    if (buckets[col][row]) result.push(buckets[col][row]);
  }
}

writeFileSync(filePath, JSON.stringify(result, null, 2) + '\n');
console.log(`Shuffled ${result.length} words across ${NUM_LENGTHS} length groups.`);
buckets.forEach((b, i) => console.log(`  ${4 + i}-letter: ${b.length} words`));
