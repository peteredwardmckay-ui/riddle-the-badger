// QWERTY layout with vowels (A E I O U) removed — 21 consonant keys.
const ROWS = [
  ['Q', 'W', 'R', 'T', 'Y', 'P'],
  ['S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const FEEDBACK_STYLES = {
  correct: { background: 'var(--color-correct)', color: '#fff', borderColor: 'var(--color-correct)' },
  present: { background: 'var(--color-present)', color: '#fff', borderColor: 'var(--color-present)' },
  absent:  { background: 'var(--color-absent)',  color: '#fff', borderColor: 'var(--color-absent)' },
};

const DEFAULT_STYLE = {
  background: 'var(--color-grey-light)',
  color: 'var(--color-text)',
  borderColor: 'var(--color-grey-mid)',
};

const ACTION_STYLE = {
  background: 'var(--color-stripe)',
  color: '#fff',
  borderColor: 'var(--color-stripe)',
};

const BASE = {
  height: '44px',
  border: '2px solid',
  borderRadius: '6px',
  fontWeight: 700,
  fontFamily: 'var(--font-family-mono)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  fontSize: '0.9rem',
  flex: 1,
};

export default function Keyboard({ onKey, keyStates = {} }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: '4px' }}>
          {row.map(k => {
            const s = FEEDBACK_STYLES[keyStates[k]] ?? DEFAULT_STYLE;
            return (
              <button key={k} onClick={() => onKey(k)} style={{ ...BASE, ...s }}>
                {k}
              </button>
            );
          })}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={() => onKey('BACKSPACE')} style={{ ...BASE, ...DEFAULT_STYLE }}>
          ←
        </button>
        <button onClick={() => onKey('ENTER')} style={{ ...BASE, ...ACTION_STYLE, flex: 2 }}>
          ENTER
        </button>
      </div>
    </div>
  );
}
