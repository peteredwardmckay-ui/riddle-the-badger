# CLAUDE.md — Riddle the Badger

## Project Overview

Riddle the Badger is a daily mobile-first word game, delivered as a React PWA.
Each day a word has its vowels stolen by Riddle, a mischievous badger. The player
sees the consonant skeleton and must restore the missing vowels to recover the word.

**Tagline:** "A E — I O U. The rest are mine."
**Target URL:** riddlethebadger.com
**Stack:** React + Tailwind CSS, PWA, no backend required at MVP

---

## Architecture Principles

- **No backend at MVP.** All game logic is client-side. The daily puzzle is
  determined by a date seed applied to the word list — no server, no API calls.
- **One component per concern.** Keep game logic, UI, and word list handling
  in clearly separated modules.
- **Static word list.** Words stored as a JSON file, imported at build time.
- **localStorage only** for streak, guess history, and last-played date.
- **Mobile first.** All layout decisions start at 375px width. Desktop is a
  centred column, never a wide layout.

---

## File Structure

```
/src
  /components
    Game.jsx          — main game controller, owns all state
    Skeleton.jsx      — renders the consonant skeleton with vowel blanks
    Keyboard.jsx      — on-screen vowel keyboard (A E I O U + Y)
    GuessRow.jsx      — single guess row with colour feedback
    GuessGrid.jsx     — collection of guess rows
    ResultModal.jsx   — end-of-game modal (win or loss)
    ShareButton.jsx   — generates and exports the share graphic
    RiddleCharacter.jsx — badger mascot display (idle/reveal/win/loss states)
  /game
    wordList.js       — imports and exports the curated answer list
    guessList.js      — imports and exports the full valid-guess list
    skeleton.js       — strips vowels from a word, returns skeleton + vowel map
    feedback.js       — computes blue/salmon/maroon feedback for a guess
    dailyWord.js      — returns today's answer via date seed
    streak.js         — reads/writes streak data to localStorage
  /data
    answers.json      — curated answer list (800–1200 words)
    guesses.json      — valid guess list (~5000 words)
  /styles
    tokens.css        — colour tokens and typography scale
  App.jsx
  main.jsx
```

---

## Colour Tokens

Define these as CSS custom properties in `tokens.css`. Use them everywhere —
never hardcode hex values in components.

```css
:root {
  --color-bg:         #FBF7EF;  /* warm cream — page background */
  --color-text:       #1A1A1A;  /* near black — primary text */
  --color-stripe:     #2B2B2B;  /* dark stripe — badger motif, borders */
  --color-gold:       #C8900A;  /* warm gold — accent, Riddle's voice */
  --color-grey-light: #F2F2F2;  /* secondary surfaces */
  --color-grey-mid:   #DDDDDD;  /* borders, dividers */

  /* Feedback colours */
  --color-correct:    #3B6FCC;  /* blue — correct vowel, correct position */
  --color-present:    #E07060;  /* salmon — vowel present, wrong position */
  --color-absent:     #6B2737;  /* maroon/oxblood — vowel not in word */
  --color-empty:      #FFFFFF;  /* unfilled guess slot */
}
```

---

## Core Game Logic

### What counts as a vowel

For this game: **A E I O U only.**
Y is always treated as a consonant and will always appear in the skeleton, never
as a blank. This is a firm rule — do not make it contextual.

Words where Y is the only vowel-sound (MYTH, LYNX, GLYPH) produce a skeleton
with no blanks. These are valid and intentional "hard mode" puzzles.

### Skeleton generation (`skeleton.js`)

```
Input:  "CASTLE"
Output: {
  skeleton: ["C", null, "S", "T", "L", null],
  vowels:   ["A", "E"],
  vowelPositions: [1, 5]
}
```

- `null` in the skeleton array represents a stolen vowel slot
- The skeleton is always displayed with consonants visible
- Vowel positions are 0-indexed

### Feedback logic (`feedback.js`)

Standard Wordle logic applied to vowels only.

```
Input:  answer vowels = ["A", "E"],  guess vowels = ["E", "A"]
Output: ["present", "present"]   // both exist, both wrong position

Input:  answer vowels = ["A", "E"],  guess vowels = ["A", "E"]
Output: ["correct", "correct"]   // perfect

Input:  answer vowels = ["A", "E"],  guess vowels = ["I", "O"]
Output: ["absent", "absent"]
```

Feedback states: `"correct"` | `"present"` | `"absent"` | `"empty"`

Map to colours:
- `correct`  → `--color-correct`  (blue)
- `present`  → `--color-present`  (salmon)
- `absent`   → `--color-absent`   (maroon)
- `empty`    → `--color-empty`    (white)

### Daily word (`dailyWord.js`)

```javascript
// Deterministic date seed — same word for all players on a given day
export function getDailyWord(wordList) {
  const epoch = new Date("2026-01-01");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayIndex = Math.floor((today - epoch) / 86400000);
  return wordList[dayIndex % wordList.length];
}
```

### Guess validation

A guess is valid if:
1. It has the correct number of vowels for today's word
2. It exists in the valid-guess list (or answer list)
3. When its consonants are placed, they match the skeleton exactly

Rule 3 is important: the player is only guessing vowels, but the word they
enter must be a real word whose consonant skeleton matches today's puzzle.
Invalid guesses show a shake animation and the message "Not a valid word."

---

## Game State

All state lives in `Game.jsx`. Do not distribute game state across components.

```javascript
{
  answer: "CASTLE",
  skeleton: ["C", null, "S", "T", "L", null],
  guesses: [],          // array of guess strings, max 5
  feedbacks: [],        // array of feedback arrays, parallel to guesses
  currentGuess: "",     // string being typed
  gameStatus: "playing" | "won" | "lost",
  hardMode: false       // reserved for Phase 2
}
```

---

## UI Behaviour

### Keyboard
- Display only vowel keys: A E I O U (+ Y as optional toggle, Phase 2)
- Keys are coloured by best result achieved so far (same as Wordle)
- Backspace and Enter complete the standard set
- Physical keyboard input must also work

### Skeleton display
- Consonants render as plain letters
- Vowel blanks render as underscore-style tiles, identical size to letter tiles
- Filled vowel slots (current guess) show the letter in a neutral colour
  until submitted

### Animations
- Incorrect guess: row shakes horizontally
- Correct guess: tiles flip sequentially (left to right), revealing colours
- Win: tiles do a brief bounce after flip completes
- Keep animations subtle — this is not a party game

### Riddle character
- Appears at top of game view, small, unobtrusive
- Changes state on game events:
  - `idle` — during play
  - `reveal` — at puzzle start (briefly)
  - `win` — on correct solve
  - `loss` — on game over
- Placeholder SVG is fine at MVP; slot is reserved for final illustration

---

## Share Graphic (`ShareButton.jsx`)

Generated as an HTML Canvas element, exported as PNG.

**Layout (mobile dimensions: 400×500px):**
```
┌─────────────────────────────────┐
│▌ RIDDLE THE BADGER   [date]     │  ← stripe on left, gold text
│▌                                │
│▌  C _ S T L _                   │  ← skeleton (today's word)
│▌                                │
│▌  [■][■][■][■][■]               │  ← guess rows, vowel slots only
│▌  [■][■][■][■][■]               │
│▌  [■][■][■][■][■]               │
│▌                                │
│▌  Solved in 3/5                 │  ← result line
│▌                                │
│▌  riddlethebadger.com           │  ← footer URL
└─────────────────────────────────┘
```

- Left stripe is `--color-stripe`, 8px wide, full height
- Squares are coloured by feedback; empty slots are `--color-grey-mid`
- No actual letters revealed — pattern only
- Share text (for copy):
  - Win:  `"Riddle had a question. I had an answer. {n}/5 riddlethebadger.com"`
  - Loss: `"Riddle wins today. Come back tomorrow. riddlethebadger.com"`

---

## Streak & Persistence (`streak.js`)

```javascript
// localStorage schema
{
  "rtb_streak": 7,
  "rtb_lastPlayed": "2026-03-11",
  "rtb_totalPlayed": 42,
  "rtb_totalWon": 38,
  "rtb_history": {
    "2026-03-11": { "result": "won", "guesses": 3 }
  }
}
```

- Streak increments only if last played was yesterday
- Streak resets to 0 if last played was 2+ days ago
- Stats shown in ResultModal after each game

---

## PWA Configuration

- `manifest.json`: name, short_name, theme_color (`#FBF7EF`), background_color,
  display: standalone, icons at 192px and 512px
- Service worker: cache-first for assets, network-first for nothing
  (no dynamic content to fetch)
- `<meta name="viewport" content="width=device-width, initial-scale=1">`
- iOS Safari: `<meta name="apple-mobile-web-app-capable" content="yes">`

---

## Build Phases

### Phase 1 — MVP (build this first, nothing else)
- [ ] Word list (start with 100 hand-picked 5-letter words)
- [ ] Skeleton generator
- [ ] Feedback logic
- [ ] Daily word selector
- [ ] Game state in Game.jsx
- [ ] Skeleton display component
- [ ] Vowel keyboard
- [ ] Guess grid with colour feedback
- [ ] Win/loss detection
- [ ] Result modal with basic stats
- [ ] Share graphic (canvas)
- [ ] Streak persistence
- [ ] PWA manifest + service worker
- [ ] Responsive layout, mobile first

### Phase 2 — Variation
- [ ] Variable word length + weekly difficulty schedule
- [ ] Practice mode (random word, no streak)
- [ ] Riddle character illustration + state switching
- [ ] Keyboard colour persistence across guesses
- [ ] Hard mode (guesses must respect prior correct placements)
- [ ] Accessibility: high-contrast colour mode

### Phase 3 — Polish
- [ ] Riddle voice lines (short text reactions)
- [ ] Refined animations
- [ ] Weekly challenge mode
- [ ] Ko-fi link in footer
- [ ] PWA install prompt

### Phase 4 — Mobile (if metrics justify)
- [ ] Capacitor wrapper for App Store submission
- [ ] iOS/Android specific gesture handling

---

## What Not to Build at MVP

- No backend, no user accounts, no leaderboard
- No Sentence Mode (Phase 2+ concept — do not design for it yet)
- No social login or sharing integrations beyond native share sheet
- No ads, no monetisation surface of any kind
- No onboarding tutorial (the mechanic teaches itself in one play)

---

## Tone Reminders

Riddle speaks in short, dry declaratives. If adding any UI copy, follow his voice:
- ✓ "Not bad."
- ✓ "Come back tomorrow."
- ✓ "I have been busy."
- ✗ "Great job! You solved today's puzzle! 🎉"
- ✗ "So close! Better luck next time!"

No exclamation marks in Riddle's voice. Ever.
