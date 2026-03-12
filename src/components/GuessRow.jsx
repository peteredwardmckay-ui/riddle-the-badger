import Tile from './Tile';

// Renders one submitted or empty guess row.
// guess:    string of consonants e.g. "CSTL"
// feedback: array of states e.g. ["correct", "absent"] — empty array if not submitted
export default function GuessRow({ skeleton = [], guess = '', feedback = [], tileSize = 44, tileGap = 6 }) {
  let guessIdx = 0;
  return (
    <div style={{ display: 'flex', gap: `${tileGap}px`, justifyContent: 'center' }}>
      {skeleton.map((cell, i) => {
        if (cell !== null) {
          // Visible vowel — shown as a fixed "given" tile
          return <Tile key={i} letter={cell} state="consonant" size={tileSize} />;
        }
        const gi = guessIdx++;
        const letter = guess[gi] ?? '';
        const state = feedback[gi] ?? (letter ? 'pending' : 'empty');
        return <Tile key={i} letter={letter} state={state} size={tileSize} />;
      })}
    </div>
  );
}
