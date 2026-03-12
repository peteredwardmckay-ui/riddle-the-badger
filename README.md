# Riddle the Badger

A daily mobile-first word game. Riddle the Badger steals the consonants from a word each day. You see the vowel skeleton — your job is to guess the missing consonants.

**Live:** [riddlethebadger.com](https://riddlethebadger.com)

---

## How it works

Each day a word has its consonants stolen. The player sees the vowels in their correct positions, with blank tiles where the consonants were.

```
_ A _ _ _ E   →   CASTLE (consonants: C, S, T, L)
```

The player guesses consonants only, using a consonant-only QWERTY keyboard. Feedback follows standard Wordle rules applied to the consonant sequence:

- **Blue** — right consonant, right position
- **Salmon** — right consonant, wrong position
- **Maroon** — consonant not in the word

Y is always treated as a consonant. Words where Y is the only vowel-sound (MYTH, LYNX) produce a skeleton with no blanks — valid hard-mode puzzles.

Up to **5 guesses**. One puzzle per day, the same word for all players.

---

## Stack

- React 19 + Vite 7
- Tailwind CSS v4 (`@tailwindcss/vite`)
- No backend — all logic is client-side
- PWA: Web App Manifest + service worker (cache-first, offline capable)
- localStorage for streak and daily state persistence
- Umami analytics

---

## Project structure

```
src/
  components/
    Game.jsx          — main controller, owns all state
    GuessGrid.jsx     — renders guess rows (dynamic tile sizing for all word lengths)
    GuessRow.jsx      — single guess row
    Tile.jsx          — individual tile with feedback colouring
    Keyboard.jsx      — consonant-only QWERTY keyboard
    RiddleCharacter.jsx — badger mascot (idle / reveal / win / loss states, light + dark variants)
    ResultModal.jsx   — end-of-game modal with stats
    ShareButton.jsx   — generates share graphic via Canvas API, triggers native share sheet
  game/
    skeleton.js       — strips consonants, returns vowel skeleton + consonant positions
    feedback.js       — Wordle-style two-pass feedback for consonant guesses
    dailyWord.js      — date-seeded daily word (epoch: 2026-03-12, UTC-safe)
    streak.js         — localStorage read/write for streak, stats, game state
    wordList.js       — imports answer list
    guessList.js      — imports valid guess list
  data/
    answers.json      — 180 curated answer words (30 per length, 4–9 letters)
    guesses.json      — ~61 000 valid guess words
  styles/
    tokens.css        — CSS custom properties: colours, typography, light + dark mode
  App.jsx             — loading screen (burrow image, 1s minimum), then Game
  main.jsx            — React root, service worker registration
public/
  manifest.json
  sw.js               — cache-first service worker
  robots.txt
  favicon.ico + favicon_set/
scripts/
  remove-bg.mjs       — removes baked-in backgrounds from character PNGs (sharp)
```

---

## Colour tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-bg` | `#FBF7EF` | `#18140E` | Page background |
| `--color-stripe` | `#2B2B2B` | `#C8BAA0` | Header, borders, text |
| `--color-gold` | `#C8900A` | `#D4A820` | Accent, tagline, given-tile border |
| `--color-correct` | `#3B6FCC` | `#5090E8` | Blue feedback |
| `--color-present` | `#E07060` | `#E87868` | Salmon feedback |
| `--color-absent` | `#6B2737` | `#8B3348` | Maroon feedback |
| `--color-given-bg` | `#FEF0C7` | `#2C2208` | Visible vowel tiles |

Dark mode follows `prefers-color-scheme` automatically, with a manual ☾/☀ toggle that persists to localStorage.

---

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

The service worker is bypassed in dev mode by Vite. To test offline behaviour, use `npm run preview` after building.

To update the daily word list, edit `src/data/answers.json`. Bump the cache name in `public/sw.js` (`rtb-v1` → `rtb-v2`) with any production deployment so users get fresh assets.

---

## Word list

- **Answers** (`answers.json`) — 180 hand-picked words, 30 per length (4–9 letters), interleaved so difficulty cycles daily.
- **Guesses** (`guesses.json`) — ~61 000 words sourced from Webster's English Dictionary, filtered to lowercase only (excludes proper nouns).

---

## Credits

Built by [Peter McKay](https://ko-fi.com/petermckay). Character artwork by the Riddle the Badger illustration team.
