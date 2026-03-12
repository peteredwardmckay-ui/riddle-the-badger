import GuessRow from './GuessRow';

// Available content width: 375px viewport - 2×1rem padding = 343px.
// Tile size and gap shrink for longer words to prevent overflow.
const AVAILABLE_WIDTH = 343;

function calcTile(n) {
  const gap = n <= 7 ? 6 : n <= 8 ? 5 : 4;
  const size = Math.min(44, Math.floor((AVAILABLE_WIDTH - (n - 1) * gap) / n));
  return { size, gap };
}

// When game is over, renders only the submitted rows (no empty rows, no active row).
// When playing, renders exactly maxGuesses rows with the active row at guesses.length.
export default function GuessGrid({ skeleton = [], guesses = [], feedbacks = [], currentGuess = '', maxGuesses = 5, gameOver = false }) {
  const count = gameOver ? guesses.length : maxGuesses;
  const { size: tileSize, gap: tileGap } = calcTile(skeleton.length);
  const rows = [];

  for (let i = 0; i < count; i++) {
    const isActive = !gameOver && i === guesses.length;
    rows.push(
      <GuessRow
        key={i}
        skeleton={skeleton}
        guess={guesses[i] ?? (isActive ? currentGuess : '')}
        feedback={feedbacks[i] ?? []}
        tileSize={tileSize}
        tileGap={tileGap}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {rows}
    </div>
  );
}
